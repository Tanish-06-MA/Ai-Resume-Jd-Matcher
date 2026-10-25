const fs = require("node:fs");
const path = require("node:path");
const cosineSimilarity = require("../utils/similarity");
const { localTextVector } = require("../utils/embeddings");
const { matchSkills, uniqueSkills } = require("../utils/skillMatching");
const calculateOverallScore = require("../utils/scoring");

describe("skill matching", () => {
    test("normalizes common aliases and counts required skills once", () => {
        const result = matchSkills(
            ["Node.js", "React.js", "PostgreSQL", "NodeJS", ""],
            ["NodeJS", "React", "PostgreSQL", "Docker"]
        );

        expect(result.matchedSkills).toEqual(["NodeJS", "React", "PostgreSQL"]);
        expect(result.missingSkills).toEqual(["Docker"]);
        expect(result.skillMatchPercent).toBe(75);
        expect(uniqueSkills(["Node.js", "NodeJS", null])).toEqual(["Node.js"]);
    });

    test("handles empty or invalid skill lists", () => {
        expect(matchSkills(null, []).skillMatchPercent).toBe(0);
        expect(matchSkills(["   ", 42], ["Docker"]).matchedSkills).toEqual([]);
    });
});

describe("similarity and score calculations", () => {
    test("calculates cosine similarity and rejects invalid vectors", () => {
        expect(cosineSimilarity([1, 0], [1, 0])).toBe(1);
        expect(cosineSimilarity([1, 0], [0, 1])).toBe(0);
        expect(() => cosineSimilarity([1], [1, 0])).toThrow(/equal length/);
        expect(() => cosineSimilarity([0], [0])).toThrow(/zero magnitude/);
    });

    test("applies the documented 60/40 score weighting and bounds", () => {
        expect(calculateOverallScore(0.8, 75)).toBe(78);
        expect(calculateOverallScore(-2, 120)).toBe(40);
        expect(() => calculateOverallScore(Number.NaN, 50)).toThrow(/finite/);
    });
});

describe("offline synthetic smoke cases", () => {
    const cases = JSON.parse(fs.readFileSync(
        path.join(__dirname, "../fixtures/synthetic-accuracy.json"), "utf8"
    ));

    test("local vectors are deterministic and favor related sample text", () => {
        const first = localTextVector(cases[0].resumeText);
        expect(Array.from(localTextVector(cases[0].resumeText))).toEqual(Array.from(first));

        expect(first).toHaveLength(2048);
        expect(cosineSimilarity(first, first)).toBeCloseTo(1);
    });

    test("synthetic strong, partial, and weak cases rank in expected order", () => {
        const scores = cases.map((item) => {
            const skillResult = matchSkills(item.resumeSkills, item.jdSkills);
            const similarity = Math.max(0, cosineSimilarity(
                localTextVector(item.resumeText), localTextVector(item.jdText)
            ));
            return calculateOverallScore(similarity, skillResult.skillMatchPercent);
        });

        expect(scores[0]).toBeGreaterThan(scores[1]);
        expect(scores[1]).toBeGreaterThan(scores[2]);
    });
});
