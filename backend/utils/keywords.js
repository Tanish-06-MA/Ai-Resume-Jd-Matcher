const getMissingKeywords = (resumeText, jdText) => {

    const resumeWords = resumeText
        .toLowerCase()
        .split(/\W+/);

    const jdWords = jdText
        .toLowerCase()
        .split(/\W+/);

    const resumeSet = new Set(resumeWords);

    const missing = [];

    for (const word of jdWords) {

        if (!resumeSet.has(word)) {

            missing.push(word);

        }

    }

    return [...new Set(missing)];

};

module.exports = getMissingKeywords;