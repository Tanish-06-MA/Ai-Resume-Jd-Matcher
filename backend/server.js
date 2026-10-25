// Load environment variables from .env file
const path = require("path");
const dotenv = require("dotenv");
dotenv.config({ path: path.join(__dirname, ".env") });
const express = require("express");
const cors = require("cors");
const multer = require("multer");

const connectDB = require("./config/db");

const authRoutes = require("./routes/auth");

const analysisRoutes = require("./routes/analysis");




const app = express();
const PORT = process.env.PORT || 5000;

// Restrict browser access in production when FRONTEND_URL is configured.
// Comma-separated origins can be used for a production site plus a preview site.
const allowedOrigins = process.env.FRONTEND_URL
    ?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
app.use(cors({ origin: allowedOrigins?.length ? allowedOrigins : true }));
app.use(express.json({ limit: "100kb" }));

app.use("/api/auth", authRoutes);
app.use("/api/analysis", analysisRoutes);

// Health check route — test if server is running
app.get("/health", (req, res) => {
    res.status(200).json({ status: "OK", message: "Server is running" });
});


// app.get("/check-key", (req, res) => {
//     res.json({
//         key: process.env.HF_API_KEY
//     });
// });


// Start server
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}).catch((error) => {
    console.error("Server startup failed:", error.message);
    process.exit(1);
});

app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        return res.status(error.code === "LIMIT_FILE_SIZE" ? 413 : 400).json({
            message: error.code === "LIMIT_FILE_SIZE" ? "Resume PDF must be 5 MB or smaller." : error.message
        });
    }
    if (error.message === "Please upload a PDF file.") {
        return res.status(400).json({ message: error.message });
    }
    console.error("Request failed:", error.message);
    res.status(500).json({ message: "An unexpected server error occurred." });
});
