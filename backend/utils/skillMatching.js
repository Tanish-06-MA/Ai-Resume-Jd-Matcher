const normalizeSkill = (skill) => skill
    .normalize("NFKC")
    .trim()
    .toLocaleLowerCase("en-US")
    .replace(/\s+/g, " ")
    .replace(/\bnode\s*\.?\s*js\b/g, "nodejs")
    .replace(/\breact\s*\.?\s*js\b/g, "react");

function uniqueSkills(skills) {
    if (!Array.isArray(skills)) return [];
    const seen = new Set();
    return skills.filter((skill) => {
        if (typeof skill !== "string" || !skill.trim()) return false;
        const key = normalizeSkill(skill);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

function matchSkills(resumeSkills, jdSkills) {
    const resume = uniqueSkills(resumeSkills);
    const job = uniqueSkills(jdSkills);
    const resumeSet = new Set(resume.map(normalizeSkill));
    const matchedSkills = job.filter((skill) => resumeSet.has(normalizeSkill(skill)));
    const matchedSet = new Set(matchedSkills.map(normalizeSkill));
    const missingSkills = job.filter((skill) => !matchedSet.has(normalizeSkill(skill)));
    const skillMatchPercent = job.length
        ? Number(((matchedSkills.length / job.length) * 100).toFixed(2))
        : 0;

    return { resumeSkills: resume, jdSkills: job, matchedSkills, missingSkills, skillMatchPercent };
}

module.exports = { normalizeSkill, uniqueSkills, matchSkills };
