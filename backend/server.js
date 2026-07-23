// Load environment variables from .env file
const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");

const authRoutes = require("./routes/auth");

const analysisRoutes = require("./routes/analysis");




connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/analysis", analysisRoutes);

// Health check route — test if server is running
app.get("/health", (req, res) => {
    res.status(200).json({ status: "OK", message: "Server is running" });
});


app.get("/check-key", (req, res) => {
    res.json({
        key: process.env.HF_API_KEY
    });
});


// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
