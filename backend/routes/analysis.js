const express = require("express");
const upload = require("../config/multer");
const extractText = require("../utils/extractText");
const getEmbedding = require("../utils/embeddings");
const cosineSimilarity = require("../utils/similarity");
const { matchSkills } = require("../utils/skillMatching");
const calculateOverallScore = require("../utils/scoring");
const Analysis = require("../models/Analysis");
const authMiddleware = require("../middleware/authMiddleware");
const {
    extractSkills,
    generateSuggestions,
    generateOverallFeedback,
    generateATSAnalysis,
    generateInterviewQuestions,
    generateLearningRoadmap
} = require("../utils/aiService");

const router = express.Router();

// ---------------- Main AI Analysis ----------------

router.post(
    "/analyze",
    authMiddleware,
    upload.single("resume"),
    async (req, res) => {

        let analysisStage = "input processing";
        try {

            const { jd } = req.body;

            // Validate PDF
            if (!req.file) {
                return res.status(400).json({ message: "Please upload a PDF resume." });
            }

            if (typeof jd !== "string" || !jd.trim()) {
                return res.status(400).json({ message: "Please provide a job description." });
            }
            if (jd.length > 20000) {
                return res.status(413).json({ message: "Job description must be 20,000 characters or fewer." });
            }

            // Extract Resume Text
            analysisStage = "PDF text extraction";
            if (req.file.mimetype !== "application/pdf" || req.file.buffer.subarray(0, 5).toString() !== "%PDF-") {
                return res.status(400).json({ message: "The uploaded file is not a valid PDF." });
            }

            const resumeText = await extractText(req.file.buffer);

            if (!resumeText || resumeText.trim().length < 50) {
                return res.status(400).json({ message: "Could not extract meaningful text from the PDF. Please upload a valid resume." });
            }
            if (resumeText.length > 30000) {
                return res.status(413).json({ message: "Resume contains too much text. Please upload a shorter resume." });
            }

            // Generate Embeddings
            analysisStage = "resume embedding generation";
            const resumeEmbedding = await getEmbedding(resumeText);

            analysisStage = "job description embedding generation";
            const jdEmbedding = await getEmbedding(jd);
            const matchMethod = resumeEmbedding.source === "huggingface" && jdEmbedding.source === "huggingface"
                ? "semantic-embedding"
                : "local-text-overlap";

            // Semantic Match Score
            const similarity = Math.max(0, Math.min(1, cosineSimilarity(
                resumeEmbedding,
                jdEmbedding
            )));

            const semanticScore = Number((similarity * 100).toFixed(2));

            // AI Skill Extraction
            analysisStage = "resume skill extraction (Groq)";
            const resumeSkillsResult = await extractSkills(resumeText);

            analysisStage = "job description skill extraction (Groq)";
            const jdSkillsResult = await extractSkills(jd);

            const {
                resumeSkills,
                jdSkills,
                matchedSkills,
                missingSkills,
                skillMatchPercent
            } = matchSkills(resumeSkillsResult.skills, jdSkillsResult.skills);

            // Overall Match Score (weighted: 60% semantic + 40% skill match)
            const overallScore = calculateOverallScore(similarity, skillMatchPercent);

            // AI Resume Analysis (strengths, weaknesses, suggestions)
            analysisStage = "resume feedback generation (Groq)";
            const aiAnalysis = await generateSuggestions(
                resumeText,
                jd
            );

            const strengths = aiAnalysis.strengths || [];
            const weaknesses = aiAnalysis.weaknesses || [];
            const suggestions = aiAnalysis.suggestions || [];

            // ──── Run parallel AI calls for new features ────

            const [
                feedbackResult,
                atsResult,
                interviewResult,
                roadmapResult
            ] = await Promise.allSettled([
                generateOverallFeedback({
                    resumeText,
                    jdText: jd,
                    semanticScore,
                    resumeSkills,
                    jdSkills,
                    matchedSkills,
                    missingSkills,
                    strengths,
                    weaknesses
                }),
                generateATSAnalysis(resumeText, jd, matchedSkills, missingSkills),
                generateInterviewQuestions(resumeText, jd, [...matchedSkills, ...missingSkills]),
                generateLearningRoadmap(resumeSkills, jdSkills, missingSkills)
            ]);

            // Safely extract results with fallbacks
            const overallFeedback = feedbackResult.status === "fulfilled"
                ? (feedbackResult.value.feedback || "")
                : "";

            const atsAnalysisData = atsResult.status === "fulfilled"
                ? atsResult.value
                : { atsScore: 0, formattingFeedback: "", keywordCoverage: "", experienceQuality: "", projectQuality: "", missingAreas: [] };

            const atsScore = atsAnalysisData.atsScore || 0;

            const interviewQuestions = interviewResult.status === "fulfilled"
                ? (interviewResult.value.questions || [])
                : [];

            const learningRoadmap = roadmapResult.status === "fulfilled"
                ? roadmapResult.value
                : { highPriority: [], mediumPriority: [], lowPriority: [] };

            // Save Analysis
            analysisStage = "saving analysis to MongoDB";
            const analysis = new Analysis({

                user: req.user.id,

                score: semanticScore,
                matchMethod,

                // Existing DB field
                missingKeywords: missingSkills,

                // Extended AI fields
                resumeSkills,
                jdSkills,
                matchedSkills,
                missingSkills,
                strengths,
                weaknesses,
                suggestions,

                // New feature fields
                skillMatchPercent,
                overallScore,
                overallFeedback,
                atsScore,
                atsAnalysis: {
                    formattingFeedback: atsAnalysisData.formattingFeedback || "",
                    keywordCoverage: atsAnalysisData.keywordCoverage || "",
                    experienceQuality: atsAnalysisData.experienceQuality || "",
                    projectQuality: atsAnalysisData.projectQuality || "",
                    missingAreas: atsAnalysisData.missingAreas || []
                },
                interviewQuestions,
                learningRoadmap: {
                    highPriority: learningRoadmap.highPriority || [],
                    mediumPriority: learningRoadmap.mediumPriority || [],
                    lowPriority: learningRoadmap.lowPriority || []
                }

            });

            await analysis.save();

            // Send Response
            res.status(200).json({

                matchScore: semanticScore,
                matchMethod,

                skillMatchPercent,

                overallScore,

                resumeSkills,

                jdSkills,

                matchedSkills,

                missingSkills,

                strengths,

                weaknesses,

                suggestions,

                overallFeedback,

                atsScore,

                atsAnalysis: {
                    formattingFeedback: atsAnalysisData.formattingFeedback || "",
                    keywordCoverage: atsAnalysisData.keywordCoverage || "",
                    experienceQuality: atsAnalysisData.experienceQuality || "",
                    projectQuality: atsAnalysisData.projectQuality || "",
                    missingAreas: atsAnalysisData.missingAreas || []
                },

                interviewQuestions,

                learningRoadmap: {
                    highPriority: learningRoadmap.highPriority || [],
                    mediumPriority: learningRoadmap.mediumPriority || [],
                    lowPriority: learningRoadmap.lowPriority || []
                }

            });
        } catch (error) {

            console.error(`Analysis failed during ${analysisStage}:`, error.message);

            const statusCode = error.status || error.response?.status;
            if (error.publicMessage) {
                return res.status(statusCode === 429 ? 503 : 502).json({ message: error.publicMessage });
            }
            const providerHint = /embedding/i.test(analysisStage)
                ? " Check that HF_API_KEY is valid and Hugging Face Inference is available."
                : /Groq/i.test(analysisStage)
                    ? " Check that GROQ_API_KEY is valid and the selected Groq model is enabled."
                    : /MongoDB/i.test(analysisStage)
                        ? " Check the MongoDB connection and database permissions."
                        : " Check that the uploaded file is a readable PDF.";

            res.status(statusCode === 429 ? 503 : 502).json({
                message: `Analysis failed during ${analysisStage}.${providerHint}`
            });

        }

    }
);

// ---------------- History ----------------

router.get(
    "/history",
    authMiddleware,
    async (req, res) => {

        try {

            const history = await Analysis.find({

                user: req.user.id

            }).select("-resumeText -jdText").sort({

                createdAt: -1

            }).lean();

            res.status(200).json(history);

        } catch (error) {

            console.error(error);

            res.status(500).json({

                message: "Failed to fetch history"

            });

        }

    }
);

// ---------------- Dashboard Analytics ----------------

router.get(
    "/dashboard-stats",
    authMiddleware,
    async (req, res) => {

        try {

            const analyses = await Analysis.find({
                user: req.user.id
            }).select("overallScore score atsScore resumeSkills missingSkills missingKeywords")
                .sort({ createdAt: -1 })
                .lean();

            if (analyses.length === 0) {
                return res.status(200).json({
                    totalAnalyses: 0,
                    averageMatchScore: 0,
                    highestAtsScore: 0,
                    recentSkills: [],
                    mostMissingSkill: null
                });
            }

            const totalAnalyses = analyses.length;

            // Average Match Score
            const totalScore = analyses.reduce((sum, a) => sum + (a.overallScore || a.score || 0), 0);
            const averageMatchScore = Number((totalScore / totalAnalyses).toFixed(2));

            // Highest ATS Score
            const highestAtsScore = Math.max(...analyses.map(a => a.atsScore || 0));

            // Recently Added Skills (from latest analysis)
            const recentSkills = analyses[0].resumeSkills || [];

            // Most Frequently Missing Skill
            const missingCount = {};
            analyses.forEach(a => {
                const missing = a.missingSkills || a.missingKeywords || [];
                missing.forEach(skill => {
                    const key = skill.toLowerCase();
                    missingCount[key] = (missingCount[key] || 0) + 1;
                });
            });

            let mostMissingSkill = null;
            let maxCount = 0;
            for (const [skill, count] of Object.entries(missingCount)) {
                if (count > maxCount) {
                    maxCount = count;
                    mostMissingSkill = skill;
                }
            }

            res.status(200).json({
                totalAnalyses,
                averageMatchScore,
                highestAtsScore,
                recentSkills: recentSkills.slice(0, 8),
                mostMissingSkill
            });

        } catch (error) {

            console.error(error);

            res.status(500).json({
                message: "Failed to fetch dashboard stats"
            });

        }

    }
);

module.exports = router;
