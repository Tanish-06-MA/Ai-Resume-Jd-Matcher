const groq = require("./groq");
require("dotenv").config();

async function extractSkills(text) {

    const response = await groq.chat.completions.create({

        model: "llama-3.3-70b-versatile",

        messages: [
            {
                role: "system",
                content: `
You are an ATS Resume Analyzer.

Extract ONLY technical skills.

Return ONLY valid JSON.

Example:

{
  "skills":[
    "Java",
    "Spring Boot",
    "Docker"
  ]
}

No explanation.
No markdown.
`
            },
            {
                role: "user",
                content: text
            }
        ],

        temperature: 0

    });

    const result = response.choices[0].message.content;

    return JSON.parse(result);

}

async function generateSuggestions(resumeText, jdText) {

    const response = await groq.chat.completions.create({

        model: "llama-3.3-70b-versatile",

        messages: [

            {

                role: "system",

                content: `

You are an expert ATS Resume Reviewer.

Compare the resume with the job description.

Return ONLY valid JSON.

Format:

{
    "strengths":[
        "...",
        "..."
    ],

    "weaknesses":[
        "...",
        "..."
    ],

    "suggestions":[
        "...",
        "...",
        "..."
    ]
}

No markdown.

No explanation.

`

            },

            {

                role: "user",

                content:

`Resume:

${resumeText}

Job Description:

${jdText}`

            }

        ],

        temperature:0

    });

    const result = response.choices[0].message.content;

    return JSON.parse(result);

}

// ──────── FEATURE 1: Overall AI Feedback ────────

async function generateOverallFeedback({
    resumeText,
    jdText,
    semanticScore,
    resumeSkills,
    jdSkills,
    matchedSkills,
    missingSkills,
    strengths,
    weaknesses
}) {
    const response = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
            {
                role: "system",
                content: `
You are an expert career advisor and ATS specialist.

Generate ONE professional summary paragraph (4-6 sentences) evaluating the candidate's resume against the job description.

Consider the semantic similarity score, matched/missing skills, strengths, and weaknesses.

Be specific, actionable, and professional.

Return ONLY valid JSON.

Format:
{
    "feedback": "Your professional summary paragraph here..."
}

No markdown. No explanation.
`
            },
            {
                role: "user",
                content: `
Resume: ${resumeText.substring(0, 2000)}

Job Description: ${jdText.substring(0, 2000)}

Semantic Score: ${semanticScore}%
Resume Skills: ${resumeSkills.join(", ")}
JD Skills: ${jdSkills.join(", ")}
Matched Skills: ${matchedSkills.join(", ")}
Missing Skills: ${missingSkills.join(", ")}
Strengths: ${strengths.join(", ")}
Weaknesses: ${weaknesses.join(", ")}
`
            }
        ],
        temperature: 0.3
    });

    const result = response.choices[0].message.content;
    return JSON.parse(result);
}

// ──────── FEATURE 4: ATS Compatibility Analysis ────────

async function generateATSAnalysis(resumeText, jdText, matchedSkills, missingSkills) {
    const response = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
            {
                role: "system",
                content: `
You are an AI-based ATS compatibility estimator.

Analyze the resume against the job description and provide an estimated ATS compatibility analysis.

IMPORTANT: This is an AI-generated estimate, NOT an official ATS algorithm result.

Return ONLY valid JSON.

Format:
{
    "atsScore": 72,
    "formattingFeedback": "Brief feedback on resume formatting...",
    "keywordCoverage": "Brief assessment of keyword coverage...",
    "experienceQuality": "Brief assessment of experience relevance...",
    "projectQuality": "Brief assessment of project relevance...",
    "missingAreas": [
        "Area 1",
        "Area 2",
        "Area 3"
    ]
}

atsScore must be an integer between 0 and 100.
No markdown. No explanation.
`
            },
            {
                role: "user",
                content: `
Resume: ${resumeText.substring(0, 2000)}

Job Description: ${jdText.substring(0, 2000)}

Matched Skills: ${matchedSkills.join(", ")}
Missing Skills: ${missingSkills.join(", ")}
`
            }
        ],
        temperature: 0.2
    });

    const result = response.choices[0].message.content;
    return JSON.parse(result);
}

// ──────── FEATURE 5: Interview Questions Generator ────────

async function generateInterviewQuestions(resumeText, jdText, skills) {
    const response = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
            {
                role: "system",
                content: `
You are a senior technical interviewer.

Generate exactly 5 interview questions based on the resume, job description, and extracted skills.

Mix technical and behavioral questions.

Return ONLY valid JSON.

Format:
{
    "questions": [
        {
            "question": "The interview question...",
            "type": "Technical OR Behavioral",
            "skill": "Related skill"
        }
    ]
}

No markdown. No explanation.
`
            },
            {
                role: "user",
                content: `
Resume: ${resumeText.substring(0, 2000)}

Job Description: ${jdText.substring(0, 2000)}

Skills: ${skills.join(", ")}
`
            }
        ],
        temperature: 0.4
    });

    const result = response.choices[0].message.content;
    return JSON.parse(result);
}

// ──────── FEATURE 6: Learning Roadmap ────────

async function generateLearningRoadmap(resumeSkills, jdSkills, missingSkills) {
    const response = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
            {
                role: "system",
                content: `
You are a career development advisor.

Generate a learning roadmap based on the candidate's current skills vs required skills.

Categorize missing/weak skills into High, Medium, and Low priority.

Explain WHY each skill should be learned.

Return ONLY valid JSON.

Format:
{
    "highPriority": [
        {
            "skill": "Skill name",
            "reason": "Why this skill should be learned first..."
        }
    ],
    "mediumPriority": [
        {
            "skill": "Skill name",
            "reason": "Why this skill matters..."
        }
    ],
    "lowPriority": [
        {
            "skill": "Skill name",
            "reason": "Why this skill is nice to have..."
        }
    ]
}

No markdown. No explanation.
`
            },
            {
                role: "user",
                content: `
Resume Skills: ${resumeSkills.join(", ")}
JD Skills: ${jdSkills.join(", ")}
Missing Skills: ${missingSkills.join(", ")}
`
            }
        ],
        temperature: 0.3
    });

    const result = response.choices[0].message.content;
    return JSON.parse(result);
}

module.exports = {
    extractSkills,
    generateSuggestions,
    generateOverallFeedback,
    generateATSAnalysis,
    generateInterviewQuestions,
    generateLearningRoadmap
};