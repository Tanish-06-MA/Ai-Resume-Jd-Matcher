/**
 * ============================================================
 * EVALUATION PIPELINE — AI Resume-JD Matcher
 * ============================================================
 * 
 * Evaluates the semantic similarity model as a binary classifier
 * using a labeled dataset of resume-JD pairs.
 * 
 * Pipeline Steps:
 *   1. Read labels.csv (ground truth)
 *   2. For each pair: extract text → embed → cosine similarity
 *   3. Apply threshold to get predictions
 *   4. Compute classification metrics (Accuracy, Precision, Recall, F1)
 *   5. Run multi-threshold experiment
 *   6. Generate results.csv
 *   7. Invoke Python script for confusion matrix + ROC curve plots
 * 
 * Usage:  node evaluate.js [--threshold=70]
 * 
 * Reuses existing project functions:
 *   - backend/utils/extractText.js   (PDF text extraction)
 *   - backend/utils/embeddings.js    (HuggingFace sentence embeddings)
 *   - backend/utils/similarity.js    (Cosine similarity)
 * 
 * ============================================================
 */

// ──────── Load environment variables from backend .env ────────
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", "backend", ".env") });

const fs = require("fs");
const { execSync } = require("child_process");

// ──────── Reuse existing project utilities (NO rewriting) ────────
const extractText = require("../backend/utils/extractText");
const getEmbedding = require("../backend/utils/embeddings");
const cosineSimilarity = require("../backend/utils/similarity");

// ──────── Configuration ────────
const CONFIG = {
    // Default classification threshold (percentage)
    DEFAULT_THRESHOLD: 70,

    // Thresholds to test in the experiment
    EXPERIMENT_THRESHOLDS: [50, 60, 70, 75, 80],

    // Delay between HuggingFace API calls (ms) to avoid rate limiting
    API_DELAY_MS: 1500,

    // File paths
    LABELS_FILE: path.join(__dirname, "labels.csv"),
    RESULTS_FILE: path.join(__dirname, "results.csv"),
    RESUMES_DIR: path.join(__dirname, "resumes"),
    JDS_DIR: path.join(__dirname, "jds"),
    PLOTS_SCRIPT: path.join(__dirname, "generate_plots.py")
};

// ──────── Parse command-line threshold override ────────
// Usage: node evaluate.js --threshold=75
function parseThresholdArg() {
    const arg = process.argv.find(a => a.startsWith("--threshold="));
    if (arg) {
        const val = parseInt(arg.split("=")[1], 10);
        if (!isNaN(val) && val >= 0 && val <= 100) return val;
    }
    return CONFIG.DEFAULT_THRESHOLD;
}

// ──────── Utility: Sleep for rate limiting ────────
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ──────── CSV Parser (lightweight, no external dependency) ────────
// Parses a simple CSV string into an array of objects using header row as keys
function parseCSV(csvString) {
    const lines = csvString.trim().split("\n").map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length < 2) return [];

    const headers = lines[0].split(",").map(h => h.trim());
    const rows = [];

    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",").map(v => v.trim());
        const row = {};
        headers.forEach((header, idx) => {
            row[header] = values[idx] || "";
        });
        rows.push(row);
    }

    return rows;
}

// ──────── CSV Writer ────────
// Converts an array of objects into a CSV string
function toCSV(rows, columns) {
    const header = columns.join(",");
    const body = rows.map(row => columns.map(col => row[col]).join(",")).join("\n");
    return header + "\n" + body + "\n";
}

// ──────── Core: Calculate similarity score for a resume-JD pair ────────
async function calculateMatchScore(resumePath, jdPath) {
    // Step 1: Extract text from resume PDF (reusing existing extractText)
    const resumeText = await extractText(resumePath);

    // Step 2: Read JD text from file
    const jdText = fs.readFileSync(jdPath, "utf-8");

    // Step 3: Generate embeddings for both (reusing existing getEmbedding)
    // Add delay between API calls to respect rate limits
    const resumeEmbedding = await getEmbedding(resumeText);
    await sleep(CONFIG.API_DELAY_MS);

    const jdEmbedding = await getEmbedding(jdText);
    await sleep(CONFIG.API_DELAY_MS);

    // Step 4: Calculate cosine similarity (reusing existing cosineSimilarity)
    const similarity = cosineSimilarity(resumeEmbedding, jdEmbedding);

    // Convert to percentage
    const scorePercent = Number((similarity * 100).toFixed(2));

    return scorePercent;
}

// ──────── Metrics: Build confusion matrix from predictions ────────
function buildConfusionMatrix(actuals, predictions) {
    let TP = 0, TN = 0, FP = 0, FN = 0;

    for (let i = 0; i < actuals.length; i++) {
        const actual = actuals[i];
        const predicted = predictions[i];

        if (actual === 1 && predicted === 1) TP++;      // True Positive
        else if (actual === 0 && predicted === 0) TN++;  // True Negative
        else if (actual === 0 && predicted === 1) FP++;  // False Positive
        else if (actual === 1 && predicted === 0) FN++;  // False Negative
    }

    return { TP, TN, FP, FN };
}

// ──────── Metrics: Calculate classification metrics ────────
function calculateMetrics(confusionMatrix) {
    const { TP, TN, FP, FN } = confusionMatrix;
    const total = TP + TN + FP + FN;

    // Accuracy: (TP + TN) / Total
    const accuracy = total > 0 ? ((TP + TN) / total) * 100 : 0;

    // Precision: TP / (TP + FP) — How many predicted matches are correct
    const precision = (TP + FP) > 0 ? (TP / (TP + FP)) * 100 : 0;

    // Recall: TP / (TP + FN) — How many actual matches were found
    const recall = (TP + FN) > 0 ? (TP / (TP + FN)) * 100 : 0;

    // F1 Score: Harmonic mean of Precision and Recall
    const f1 = (precision + recall) > 0
        ? (2 * precision * recall) / (precision + recall)
        : 0;

    return {
        accuracy: Number(accuracy.toFixed(2)),
        precision: Number(precision.toFixed(2)),
        recall: Number(recall.toFixed(2)),
        f1: Number(f1.toFixed(2))
    };
}

// ──────── Display: Print metrics to console ────────
function printMetrics(metrics, confusionMatrix, threshold) {
    console.log("\n" + "═".repeat(55));
    console.log("  📊  CLASSIFICATION METRICS");
    console.log("═".repeat(55));
    console.log(`  Threshold     :  ${threshold}%`);
    console.log(`  Accuracy      :  ${metrics.accuracy}%`);
    console.log(`  Precision     :  ${metrics.precision}%`);
    console.log(`  Recall        :  ${metrics.recall}%`);
    console.log(`  F1 Score      :  ${metrics.f1}%`);
    console.log("═".repeat(55));

    console.log("\n  📋  CONFUSION MATRIX");
    console.log("  ─────────────────────────────────────");
    console.log("                    Predicted");
    console.log("                 No Match  │  Match");
    console.log("  ─────────────────────────────────────");
    console.log(`  Actual No Match    ${confusionMatrix.TN}     │    ${confusionMatrix.FP}`);
    console.log(`  Actual Match       ${confusionMatrix.FN}     │    ${confusionMatrix.TP}`);
    console.log("  ─────────────────────────────────────\n");
}

// ──────── Threshold Experiment ────────
// Run evaluation at multiple thresholds and compare results
function runThresholdExperiment(scores, actuals) {
    console.log("\n" + "═".repeat(65));
    console.log("  🔬  THRESHOLD EXPERIMENT");
    console.log("═".repeat(65));
    console.log("  Threshold │ Accuracy │ Precision │ Recall  │ F1 Score");
    console.log("  ──────────┼──────────┼───────────┼─────────┼─────────");

    let bestThreshold = CONFIG.EXPERIMENT_THRESHOLDS[0];
    let bestF1 = -1;
    const experimentResults = [];

    for (const threshold of CONFIG.EXPERIMENT_THRESHOLDS) {
        // Apply threshold to get predictions
        const predictions = scores.map(s => (s >= threshold ? 1 : 0));

        // Calculate metrics for this threshold
        const cm = buildConfusionMatrix(actuals, predictions);
        const metrics = calculateMetrics(cm);

        // Track best F1
        if (metrics.f1 > bestF1) {
            bestF1 = metrics.f1;
            bestThreshold = threshold;
        }

        experimentResults.push({ threshold, ...metrics });

        // Format table row
        const row = [
            `    ${threshold}%`.padEnd(12),
            `${metrics.accuracy}%`.padStart(8),
            `${metrics.precision}%`.padStart(9),
            `${metrics.recall}%`.padStart(8),
            `${metrics.f1}%`.padStart(8)
        ].join(" │ ");

        console.log(row);
    }

    console.log("  ──────────┴──────────┴───────────┴─────────┴─────────");
    console.log(`\n  🏆  RECOMMENDED THRESHOLD: ${bestThreshold}% (Highest F1 Score: ${bestF1}%)`);
    console.log("═".repeat(65) + "\n");

    return { bestThreshold, bestF1, experimentResults };
}

// ──────── Generate Plots (calls Python script) ────────
function generatePlots() {
    console.log("  🎨  Generating Confusion Matrix and ROC Curve...\n");

    try {
        // Check if Python is available
        const pythonCmd = process.platform === "win32" ? "python" : "python3";

        const output = execSync(
            `${pythonCmd} "${CONFIG.PLOTS_SCRIPT}" "${CONFIG.RESULTS_FILE}" "${__dirname}"`,
            {
                encoding: "utf-8",
                timeout: 60000, // 60 second timeout
                env: { ...process.env, PYTHONIOENCODING: "utf-8" }
            }
        );

        console.log(output);
        console.log("  ✅  confusion_matrix.png saved!");
        console.log("  ✅  roc_curve.png saved!\n");
    } catch (error) {
        console.error("  ⚠️  Python plot generation failed.");
        console.error("  Make sure Python 3 is installed with matplotlib, scikit-learn, and pandas.");
        console.error(`  Error: ${error.message}\n`);
        console.error("  To install dependencies, run:");
        console.error("  pip install matplotlib scikit-learn pandas\n");
    }
}

// ──────── Main Evaluation Pipeline ────────
async function main() {
    console.log("\n" + "═".repeat(55));
    console.log("  🚀  AI RESUME-JD MATCHER — EVALUATION PIPELINE");
    console.log("═".repeat(55));

    const threshold = parseThresholdArg();
    console.log(`\n  📁 Labels file  : ${CONFIG.LABELS_FILE}`);
    console.log(`  📁 Resumes dir  : ${CONFIG.RESUMES_DIR}`);
    console.log(`  📁 JDs dir      : ${CONFIG.JDS_DIR}`);
    console.log(`  🎯 Threshold    : ${threshold}%\n`);

    // ── Step 1: Read labels.csv ──
    console.log("  📖 Step 1: Reading labels.csv...");

    if (!fs.existsSync(CONFIG.LABELS_FILE)) {
        console.error("  ❌ labels.csv not found! Please create it first.");
        process.exit(1);
    }

    const csvContent = fs.readFileSync(CONFIG.LABELS_FILE, "utf-8");
    const labelRows = parseCSV(csvContent);

    if (labelRows.length === 0) {
        console.error("  ❌ labels.csv is empty or has no data rows!");
        process.exit(1);
    }

    console.log(`  ✅ Found ${labelRows.length} evaluation pairs.\n`);

    // ── Step 2: Process each resume-JD pair ──
    console.log("  ⚙️  Step 2: Processing resume-JD pairs...\n");

    const results = [];      // Detailed results for CSV
    const scores = [];       // Raw similarity scores
    const actuals = [];      // Ground truth labels
    let processedCount = 0;

    for (const row of labelRows) {
        const resumeFile = row.resume;
        const jdFile = row.jd;
        const actualLabel = parseInt(row.label, 10);

        const resumePath = path.join(CONFIG.RESUMES_DIR, resumeFile);
        const jdPath = path.join(CONFIG.JDS_DIR, jdFile);

        // Validate files exist
        if (!fs.existsSync(resumePath)) {
            console.error(`  ⚠️  Resume not found: ${resumeFile} — Skipping...`);
            continue;
        }
        if (!fs.existsSync(jdPath)) {
            console.error(`  ⚠️  JD not found: ${jdFile} — Skipping...`);
            continue;
        }

        try {
            processedCount++;
            console.log(`  [${processedCount}/${labelRows.length}] Processing: ${resumeFile} ↔ ${jdFile}`);

            // Calculate similarity score using existing project functions
            const score = await calculateMatchScore(resumePath, jdPath);

            // Apply threshold to get binary prediction
            const predictedLabel = score >= threshold ? 1 : 0;

            // Store results
            scores.push(score);
            actuals.push(actualLabel);

            results.push({
                Resume: resumeFile,
                JD: jdFile,
                ActualLabel: actualLabel,
                PredictedLabel: predictedLabel,
                SimilarityScore: score
            });

            // Log individual result
            const status = actualLabel === predictedLabel ? "✅" : "❌";
            console.log(`           Score: ${score}% | Actual: ${actualLabel} | Predicted: ${predictedLabel} ${status}\n`);

        } catch (error) {
            console.error(`  ❌ Error processing ${resumeFile}: ${error.message}`);
            continue;
        }
    }

    if (results.length === 0) {
        console.error("  ❌ No pairs were successfully processed!");
        process.exit(1);
    }

    // ── Step 3: Write results.csv ──
    console.log("  💾 Step 3: Writing results.csv...");

    const csvOutput = toCSV(results, ["Resume", "JD", "ActualLabel", "PredictedLabel", "SimilarityScore"]);
    fs.writeFileSync(CONFIG.RESULTS_FILE, csvOutput, "utf-8");
    console.log(`  ✅ results.csv saved with ${results.length} rows.\n`);

    // ── Step 4: Calculate and display metrics at default threshold ──
    console.log("  📊 Step 4: Calculating classification metrics...");

    const predictions = results.map(r => r.PredictedLabel);
    const confusionMatrix = buildConfusionMatrix(actuals, predictions);
    const metrics = calculateMetrics(confusionMatrix);

    printMetrics(metrics, confusionMatrix, threshold);

    // ── Step 5: Threshold Experiment ──
    console.log("  🔬 Step 5: Running threshold experiment...");

    const { bestThreshold, bestF1, experimentResults } = runThresholdExperiment(scores, actuals);

    // ── Step 6: Generate plots (Confusion Matrix + ROC Curve) ──
    console.log("  🎨 Step 6: Generating plots...\n");

    generatePlots();

    // ── Step 7: Update EVALUATION.md with actual results ──
    console.log("  📝 Step 7: Updating EVALUATION.md...\n");

    generateEvaluationReadme(results.length, threshold, metrics, bestThreshold, bestF1);

    // ── Summary ──
    console.log("═".repeat(55));
    console.log("  ✅  EVALUATION COMPLETE!");
    console.log("═".repeat(55));
    console.log(`  📊 Results      : ${CONFIG.RESULTS_FILE}`);
    console.log(`  📈 Confusion    : ${path.join(__dirname, "confusion_matrix.png")}`);
    console.log(`  📉 ROC Curve    : ${path.join(__dirname, "roc_curve.png")}`);
    console.log(`  📖 Documentation: ${path.join(__dirname, "EVALUATION.md")}`);
    console.log("═".repeat(55) + "\n");
}

// ──────── Generate EVALUATION.md with actual results ────────
function generateEvaluationReadme(datasetSize, threshold, metrics, bestThreshold, bestF1) {
    const content = `## Model Evaluation

### Overview

The AI Resume-JD Matcher model is evaluated as a binary classifier to determine whether a resume is a **Good Match (1)** or **Poor Match (0)** for a given Job Description.

The model uses **sentence embeddings** from \`all-MiniLM-L6-v2\` (HuggingFace) and **cosine similarity** to compute a match score, which is then thresholded to produce a binary prediction.

---

### Dataset

- **Dataset Size**: ${datasetSize} manually labeled Resume–JD pairs
- **Positive Samples (Good Match)**: Pairs where the resume domain aligns with the JD
- **Negative Samples (Poor Match)**: Pairs where the resume domain does NOT align with the JD

---

### Results

| Metric      | Value     |
|-------------|-----------|
| Threshold   | ${threshold}%     |
| Accuracy    | ${metrics.accuracy}%  |
| Precision   | ${metrics.precision}%  |
| Recall      | ${metrics.recall}%  |
| F1 Score    | ${metrics.f1}%  |

---

### Best Threshold (from Experiment)

| Recommended Threshold | Best F1 Score |
|----------------------|---------------|
| ${bestThreshold}%                  | ${bestF1}%         |

---

### Confusion Matrix

![Confusion Matrix](./confusion_matrix.png)

---

### ROC Curve

![ROC Curve](./roc_curve.png)

---

### How to Run

\`\`\`bash
# 1. Generate sample resumes (one-time)
node evaluation/create_sample_resumes.js

# 2. Run evaluation with default threshold (70%)
node evaluation/evaluate.js

# 3. Run with custom threshold
node evaluation/evaluate.js --threshold=60
\`\`\`

---

### File Structure

\`\`\`
evaluation/
├── resumes/               # Resume PDF files
├── jds/                   # Job Description text files
├── labels.csv             # Ground truth labels (resume, jd, label)
├── evaluate.js            # Main evaluation script
├── generate_plots.py      # Confusion matrix + ROC curve generator
├── create_sample_resumes.js  # Sample PDF generator
├── results.csv            # Generated evaluation results
├── confusion_matrix.png   # Generated confusion matrix image
├── roc_curve.png          # Generated ROC curve image
└── EVALUATION.md          # This documentation
\`\`\`

---

### Notes

- The evaluation pipeline **reuses** the same \`extractText\`, \`getEmbedding\`, and \`cosineSimilarity\` functions from the production backend — no algorithm was rewritten.
- Replace the sample resume-JD pairs with real data for meaningful evaluation results.
- The HuggingFace API has rate limits — a 1.5s delay is added between API calls.
`;

    const readmePath = path.join(__dirname, "EVALUATION.md");
    fs.writeFileSync(readmePath, content, "utf-8");
    console.log("  ✅ EVALUATION.md updated with actual results.\n");
}

// ──────── Run the pipeline ────────
main().catch((error) => {
    console.error("\n  ❌ EVALUATION FAILED:", error.message);
    console.error(error.stack);
    process.exit(1);
});
