function calculateOverallScore(similarity, skillMatchPercent) {
    if (!Number.isFinite(similarity) || !Number.isFinite(skillMatchPercent)) {
        throw new TypeError("Similarity and skill match must be finite numbers.");
    }

    const boundedSimilarity = Math.max(0, Math.min(1, similarity));
    const boundedSkillMatch = Math.max(0, Math.min(100, skillMatchPercent));
    return Number((boundedSimilarity * 60 + boundedSkillMatch * 0.4).toFixed(2));
}

module.exports = calculateOverallScore;
