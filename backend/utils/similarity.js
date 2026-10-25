const cosineSimilarity = (vecA, vecB) => {

    if (!Array.isArray(vecA) || !Array.isArray(vecB) || vecA.length === 0 || vecA.length !== vecB.length) {
        throw new Error("Embedding vectors must be non-empty arrays of equal length.");
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {

        dotProduct += vecA[i] * vecB[i];

        normA += vecA[i] * vecA[i];

        normB += vecB[i] * vecB[i];

    }

    normA = Math.sqrt(normA);

    normB = Math.sqrt(normB);

    const denominator = normA * normB;
    if (!Number.isFinite(denominator) || denominator === 0) {
        throw new Error("Embedding vectors cannot have zero magnitude.");
    }

    return dotProduct / denominator;

};

module.exports = cosineSimilarity;
