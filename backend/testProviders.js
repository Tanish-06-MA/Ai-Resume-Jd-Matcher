const fs = require("node:fs");
const path = require("node:path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const getEmbedding = require("./utils/embeddings");

async function main() {
    if (!process.env.HF_API_KEY || !process.env.GROQ_API_KEY) {
        console.error("Set both HF_API_KEY and GROQ_API_KEY in backend/.env.");
        process.exitCode = 1;
        return;
    }
    const { extractSkills, generateSuggestions } = require("./utils/aiService");

    const examples = JSON.parse(fs.readFileSync(
        path.join(__dirname, "fixtures/synthetic-accuracy.json"), "utf8"
    ));
    const { resumeText, jdText } = examples[0];
    let failed = false;

    console.log("Testing Hugging Face embeddings with synthetic text...");
    try {
        const [resumeVector, jdVector] = await Promise.all([
            getEmbedding(resumeText),
            getEmbedding(jdText)
        ]);
        if (resumeVector.source !== "huggingface" || jdVector.source !== "huggingface") {
            failed = true;
            console.error(`Hugging Face did not provide both embeddings (source: ${resumeVector.source}, ${jdVector.source}).`);
            console.error("The local-text-overlap fallback does not count as an HF pass.");
        } else {
            console.log(`Hugging Face passed: two ${resumeVector.length}-dimension embeddings received.`);
        }
    } catch (error) {
        failed = true;
        console.error("Hugging Face test failed:", error.message);
    }

    console.log("Testing Groq chat with synthetic text...");
    try {
        const [resumeSkills, jdSkills] = await Promise.all([
            extractSkills(resumeText),
            extractSkills(jdText)
        ]);
        const suggestions = await generateSuggestions(resumeText, jdText);
        if (!Array.isArray(resumeSkills.skills) || !Array.isArray(jdSkills.skills)
            || !Array.isArray(suggestions.strengths)
            || !Array.isArray(suggestions.weaknesses)
            || !Array.isArray(suggestions.suggestions)) {
            throw new Error("Groq returned an unexpected response shape.");
        }
        console.log(`Groq passed: extracted ${resumeSkills.skills.length} resume skills and ${jdSkills.skills.length} job skills; feedback JSON is valid.`);
    } catch (error) {
        failed = true;
        console.error("Groq test failed:", error.status ? `HTTP ${error.status}` : error.message);
    }

    console.log("\nProvider checks do not upload a PDF, authenticate, or save an analysis.");
    if (failed) process.exitCode = 1;
}

main().catch((error) => {
    console.error("Provider diagnostics failed:", error.message);
    process.exitCode = 1;
});
