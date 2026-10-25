const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const getEmbedding = require("./utils/embeddings");
const cosineSimilarity = require("./utils/similarity");
const { extractSkills } = require("./utils/aiService");
const { matchSkills, normalizeSkill } = require("./utils/skillMatching");
const calculateOverallScore = require("./utils/scoring");

function validateCases(cases) {
    if (!Array.isArray(cases) || cases.length === 0) {
        throw new Error("Evaluation file must contain a non-empty JSON array.");
    }
    cases.forEach((item, index) => {
        const row = index + 1;
        if (typeof item.resumeText !== "string" || !item.resumeText.trim()) throw new Error(`Row ${row}: resumeText is required.`);
        if (typeof item.jdText !== "string" || !item.jdText.trim()) throw new Error(`Row ${row}: jdText is required.`);
        if (!Number.isFinite(item.expectedScore) || item.expectedScore < 0 || item.expectedScore > 100) {
            throw new Error(`Row ${row}: expectedScore must be between 0 and 100.`);
        }
        if (!Array.isArray(item.expectedResumeSkills) || !Array.isArray(item.expectedJdSkills)) {
            throw new Error(`Row ${row}: expectedResumeSkills and expectedJdSkills must be arrays.`);
        }
    });
}

function f1Score(truePositive, falsePositive, falseNegative) {
    const precision = truePositive + falsePositive ? truePositive / (truePositive + falsePositive) : 0;
    const recall = truePositive + falseNegative ? truePositive / (truePositive + falseNegative) : 0;
    return { precision, recall, f1: precision + recall ? 2 * precision * recall / (precision + recall) : 0 };
}

function correlation(pairs) {
    if (pairs.length < 2) return null;
    const meanX = pairs.reduce((sum, pair) => sum + pair.expected, 0) / pairs.length;
    const meanY = pairs.reduce((sum, pair) => sum + pair.predicted, 0) / pairs.length;
    const numerator = pairs.reduce((sum, pair) => sum + (pair.expected - meanX) * (pair.predicted - meanY), 0);
    const denomX = pairs.reduce((sum, pair) => sum + (pair.expected - meanX) ** 2, 0);
    const denomY = pairs.reduce((sum, pair) => sum + (pair.predicted - meanY) ** 2, 0);
    return denomX && denomY ? numerator / Math.sqrt(denomX * denomY) : null;
}

async function main() {
    const inputFile = process.argv[2];
    if (!inputFile) {
        console.error("Usage: node evaluateAccuracy.js <path-to-labeled-json>");
        process.exitCode = 1;
        return;
    }

    const filePath = path.resolve(process.cwd(), inputFile);
    const cases = JSON.parse(fs.readFileSync(filePath, "utf8"));
    validateCases(cases);

    const scorePairs = [];
    const skillCounts = { tp: 0, fp: 0, fn: 0 };
    console.log(`Evaluating ${cases.length} labeled resume/JD pair(s).`);

    for (const [index, item] of cases.entries()) {
        const resumeEmbedding = await getEmbedding(item.resumeText);
        const jdEmbedding = await getEmbedding(item.jdText);
        const consistentProvider = resumeEmbedding.source === jdEmbedding.source;
        const resumeVector = consistentProvider ? resumeEmbedding : getEmbedding.localTextVector(item.resumeText);
        const jdVector = consistentProvider ? jdEmbedding : getEmbedding.localTextVector(item.jdText);
        const matchMethod = resumeVector.source === "huggingface" ? "semantic-embedding" : "local-text-overlap";
        const similarity = Math.max(0, Math.min(1, cosineSimilarity(resumeVector, jdVector)));

        const resumeResult = await extractSkills(item.resumeText);
        const jdResult = await extractSkills(item.jdText);
        const skillResult = matchSkills(resumeResult.skills, jdResult.skills);
        const predictedScore = calculateOverallScore(similarity, skillResult.skillMatchPercent);

        scorePairs.push({ expected: item.expectedScore, predicted: predictedScore });
        for (const [actualSkills, expectedSkills] of [
            [skillResult.resumeSkills, item.expectedResumeSkills],
            [skillResult.jdSkills, item.expectedJdSkills]
        ]) {
            const actual = new Set(actualSkills.map(normalizeSkill));
            const expected = new Set(expectedSkills.map(normalizeSkill));
            for (const skill of actual) expected.has(skill) ? skillCounts.tp++ : skillCounts.fp++;
            for (const skill of expected) if (!actual.has(skill)) skillCounts.fn++;
        }

        const label = item.id || `case-${index + 1}`;
        console.log(`${label}: expected ${item.expectedScore}, predicted ${predictedScore} (${matchMethod}), skill match ${skillResult.skillMatchPercent}%`);
    }

    const mae = scorePairs.reduce((sum, pair) => sum + Math.abs(pair.expected - pair.predicted), 0) / scorePairs.length;
    const rmse = Math.sqrt(scorePairs.reduce((sum, pair) => sum + (pair.expected - pair.predicted) ** 2, 0) / scorePairs.length);
    const skills = f1Score(skillCounts.tp, skillCounts.fp, skillCounts.fn);

    console.log("\nEvaluation summary (scores are 0-100):");
    console.log(`Score MAE: ${mae.toFixed(2)} points (lower is better)`);
    console.log(`Score RMSE: ${rmse.toFixed(2)} points (lower is better)`);
    console.log(`Score correlation: ${correlation(scorePairs) === null ? "not enough score variation/examples" : correlation(scorePairs).toFixed(3)}`);
    console.log(`Skill extraction precision: ${(skills.precision * 100).toFixed(1)}%`);
    console.log(`Skill extraction recall: ${(skills.recall * 100).toFixed(1)}%`);
    console.log(`Skill extraction F1: ${(skills.f1 * 100).toFixed(1)}%`);
    console.log("ATS wording, suggestions, interview questions, and roadmap quality need separate human review.");
}

main().catch((error) => {
    console.error("Accuracy evaluation failed:", error.message);
    process.exitCode = 1;
});
