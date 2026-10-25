const axios = require("axios");

const MODEL_URL = "https://router.huggingface.co/hf-inference/models/sentence-transformers/all-MiniLM-L6-v2";
const VECTOR_SIZE = 2048;
const STOP_WORDS = new Set(["the", "and", "for", "with", "from", "that", "this", "are", "was", "were", "will", "you", "your", "our", "their", "have", "has", "had", "into", "about", "than", "then", "but", "not", "use", "using", "what", "when", "where", "who", "how", "can", "all", "any", "job", "work", "role", "team"]);
let inferenceUnavailable = false;

function localTextVector(text) {
    const normalized = String(text).toLowerCase().replace(/[^a-z0-9+#.]+/g, " ").trim();
    const words = normalized.split(/\s+/).filter((word) => word.length > 1 && !STOP_WORDS.has(word));
    const vector = Array(VECTOR_SIZE).fill(0);

    const addFeature = (feature, weight) => {
        let hash = 2166136261;
        for (let i = 0; i < feature.length; i++) {
            hash ^= feature.charCodeAt(i);
            hash = Math.imul(hash, 16777619);
        }
        const index = (hash >>> 0) % VECTOR_SIZE;
        vector[index] += (hash & 0x80000000) ? -weight : weight;
    };

    words.forEach((word, index) => {
        addFeature(`w:${word}`, 1);
        if (index > 0) addFeature(`b:${words[index - 1]}_${word}`, 0.7);
    });

    // Character trigrams help match small spelling and word-form differences.
    const compact = `  ${normalized}  `;
    for (let i = 0; i <= compact.length - 3; i++) {
        const gram = compact.slice(i, i + 3);
        if (!/^\s+$/.test(gram)) addFeature(`c:${gram}`, 0.12);
    }

    vector.source = "local-text-overlap";
    return vector;
}

const getEmbedding = async (text) => {
    if (inferenceUnavailable || !process.env.HF_API_KEY) {
        return localTextVector(text);
    }

    try {
        const response = await axios.post(
            MODEL_URL,
            {
                inputs: text
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.HF_API_KEY}`
                }
            }
        );

        let embedding = response.data;
        // Feature-extraction endpoints may return one vector per token.
        // Mean-pool token vectors so cosine similarity receives a single vector.
        if (Array.isArray(embedding) && Array.isArray(embedding[0])) {
            const dimensions = embedding[0].length;
            if (!dimensions || embedding.some((row) => !Array.isArray(row) || row.length !== dimensions)) {
                throw new Error("Embedding provider returned an invalid vector shape.");
            }
            const pooled = Array(dimensions).fill(0);
            for (const row of embedding) {
                for (let i = 0; i < dimensions; i++) pooled[i] += Number(row[i]) || 0;
            }
            embedding = pooled.map((value) => value / embedding.length);
        }
        if (!Array.isArray(embedding) || embedding.length === 0 || !embedding.every(Number.isFinite)) {
            throw new Error("Embedding provider returned an invalid embedding.");
        }
        embedding.source = "huggingface";
        return embedding;

    } catch (error) {

        const status = error.response?.status;
        const providerMessage = typeof error.response?.data === "string"
            ? error.response.data
            : error.response?.data?.error;
        console.error("Embedding provider error:", status || "no HTTP status", providerMessage || error.message);

        // Keep analysis available when inference credits run out or the provider
        // is unavailable. The result reports that this is text overlap, not AI semantics.
        inferenceUnavailable = true;
        console.warn("Using local text similarity because Hugging Face embeddings are unavailable.");
        return localTextVector(text);

    }
};

module.exports = getEmbedding;
module.exports.localTextVector = localTextVector;

