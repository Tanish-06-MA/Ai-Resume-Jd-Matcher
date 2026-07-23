const axios = require("axios");

const MODEL_URL = "https://router.huggingface.co/hf-inference/models/sentence-transformers/all-MiniLM-L6-v2/pipeline/feature-extraction";

const getEmbedding = async (text) => {
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

        return response.data;

    } catch (error) {

        console.error("Embedding Error:", error.response?.data || error.message);

        throw error;

    }
};

module.exports = getEmbedding;

