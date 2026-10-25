const fs = require("fs");
const pdfParse = require("pdf-parse")

const extractText = async (input) => {

    try {

        // Read PDF file
        const dataBuffer = Buffer.isBuffer(input) ? input : fs.readFileSync(input);

        // Extract text
        const data = await pdfParse(dataBuffer);

        return data.text;

    } catch (error) {

        console.error("PDF Parsing Error:", error);

        throw error;

    }

};

module.exports = extractText;
