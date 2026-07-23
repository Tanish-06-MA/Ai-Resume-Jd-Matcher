const mongoose = require("mongoose");

const analysisSchema = new mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    resumeText: {
        type: String,
        required: true
    },

    jdText: {
        type: String,
        required: true
    },

    score: {
        type: Number,
        required: true
    },

    missingKeywords: {
        type: [String],
        default: []
    },

    resumeSkills: {
        type: [String],
        default: []
    },

    jdSkills: {
        type: [String],
        default: []
    },

    missingSkills: {
        type: [String],
        default: []
    },

    strengths: {
        type: [String],
        default: []
    },

    weaknesses: {
        type: [String],
        default: []
    },

    suggestions: {
        type: [String],
        default: []
    },

    // ──────── New AI Feature Fields ────────

    matchedSkills: {
        type: [String],
        default: []
    },

    skillMatchPercent: {
        type: Number,
        default: 0
    },

    overallScore: {
        type: Number,
        default: 0
    },

    overallFeedback: {
        type: String,
        default: ""
    },

    atsScore: {
        type: Number,
        default: 0
    },

    atsAnalysis: {
        formattingFeedback: { type: String, default: "" },
        keywordCoverage: { type: String, default: "" },
        experienceQuality: { type: String, default: "" },
        projectQuality: { type: String, default: "" },
        missingAreas: { type: [String], default: [] }
    },

    interviewQuestions: [{
        question: { type: String, default: "" },
        type: { type: String, default: "" },
        skill: { type: String, default: "" }
    }],

    learningRoadmap: {
        highPriority: [{
            skill: { type: String, default: "" },
            reason: { type: String, default: "" }
        }],
        mediumPriority: [{
            skill: { type: String, default: "" },
            reason: { type: String, default: "" }
        }],
        lowPriority: [{
            skill: { type: String, default: "" },
            reason: { type: String, default: "" }
        }]
    }

}, {
    timestamps: true
});

module.exports = mongoose.model("Analysis", analysisSchema);
