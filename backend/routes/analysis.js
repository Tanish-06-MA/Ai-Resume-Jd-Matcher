const express = require("express");
const upload = require("../config/multer");
const extractText = require("../utils/extractText");
const getEmbedding = require("../utils/embeddings");
const cosineSimilarity = require("../utils/similarity");
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

router.get("/test", (req, res) => {
    res.send("Analysis Route Working");
});

// ---------------- Upload Test ----------------

router.post(
    "/upload",
    upload.single("resume"),
    async (req, res) => {

        try {

            const resumeText = await extractText(req.file.path);

            const embedding = await getEmbedding(resumeText);

            console.log("Resume Text:");
            console.log(resumeText);

            console.log("Embedding Length:", embedding.length);

            res.status(200).json({
                message: "Embedding Generated Successfully",
                embeddingLength: embedding.length
            });

        } catch (error) {

            console.error(error);

            res.status(500).json({
                message: "Error processing resume"
            });

        }

    }
);

// ---------------- Similarity Test ----------------

router.post("/test-score", async (req, res) => {

    try {

        const { resume, jd } = req.body;

        const resumeEmbedding = await getEmbedding(resume);

        const jdEmbedding = await getEmbedding(jd);

        const score = cosineSimilarity(
            resumeEmbedding,
            jdEmbedding
        );

        res.json({

            similarity: score,

            percentage: (score * 100).toFixed(2)

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({

            message: "Similarity Calculation Failed"

        });

    }

});

// ---------------- Main AI Analysis ----------------

router.post(
    "/analyze",
    authMiddleware,
    upload.single("resume"),
    async (req, res) => {

        try {

            const { jd } = req.body;

            // Validate PDF
            if (!req.file) {
                return res.status(400).json({ message: "Please upload a PDF resume." });
            }

            if (!jd || !jd.trim()) {
                return res.status(400).json({ message: "Please provide a job description." });
            }

            // Extract Resume Text
            const resumeText = await extractText(req.file.path);

            if (!resumeText || resumeText.trim().length < 50) {
                return res.status(400).json({ message: "Could not extract meaningful text from the PDF. Please upload a valid resume." });
            }

            // Generate Embeddings
            const resumeEmbedding = await getEmbedding(resumeText);

            const jdEmbedding = await getEmbedding(jd);

            // Semantic Match Score
            const similarity = cosineSimilarity(
                resumeEmbedding,
                jdEmbedding
            );

            const semanticScore = Number((similarity * 100).toFixed(2));

            // AI Skill Extraction
            const resumeSkillsResult = await extractSkills(resumeText);

            const jdSkillsResult = await extractSkills(jd);

            const resumeSkills = resumeSkillsResult.skills || [];

            const jdSkills = jdSkillsResult.skills || [];

            // Matched & Missing Skills
            const matchedSkills = resumeSkills.filter(
                (skill) =>
                    jdSkills.some(
                        (jdSkill) =>
                            jdSkill.toLowerCase() === skill.toLowerCase()
                    )
            );

            const missingSkills = jdSkills.filter(
                (skill) =>
                    !resumeSkills.some(
                        (resumeSkill) =>
                            resumeSkill.toLowerCase() ===
                            skill.toLowerCase()
                    )
            );

            // Skill Match Percentage
            const skillMatchPercent = jdSkills.length > 0
                ? Number(((matchedSkills.length / jdSkills.length) * 100).toFixed(2))
                : 0;

            // Overall Match Score (weighted: 60% semantic + 40% skill match)
            const overallScore = Number(
                (semanticScore * 0.6 + skillMatchPercent * 0.4).toFixed(2)
            );

            // AI Resume Analysis (strengths, weaknesses, suggestions)
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
            const analysis = new Analysis({

                user: req.user.id,

                resumeText,

                jdText: jd,

                score: semanticScore,

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

            console.error("Analysis Error:", error);

            res.status(500).json({

                message: "Analysis Failed. Please try again."

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

            }).sort({

                createdAt: -1

            });

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
            }).sort({ createdAt: -1 });

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