const fs = require("fs");
const pdfParse = require("pdf-parse")
console.log(pdfParse)

const extractText = async (filePath) => {

    try {

        // Read PDF file
        const dataBuffer = fs.readFileSync(filePath);

        // Extract text
        const data = await pdfParse(dataBuffer);

        return data.text;

    } catch (error) {

        console.error("PDF Parsing Error:", error);

        throw error;

    }

};

module.exports = extractText;
