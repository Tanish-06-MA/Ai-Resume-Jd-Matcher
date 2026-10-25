const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");



const jwt = require("jsonwebtoken");
const router = express.Router();

router.get("/test", (req, res) => {
    res.send("Auth Route Working");
});

router.get("/profile", authMiddleware, (req, res) => {
    res.json({
        message: "Welcome! You are authenticated.",
        user: req.user
    });
});

router.post("/signup", async (req, res) => {

    try {

        const { name, email, password } = req.body;

        if (typeof name !== "string" || typeof email !== "string" || typeof password !== "string" || !name.trim() || !email.trim() || !password) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters." });
        }

        if (!process.env.JWT_SECRET) {
            return res.status(503).json({ message: "Authentication is not configured on the server." });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = await User.findOne({ email: normalizedEmail });

        if (existingUser) {
            return res.status(400).json({
                message: "User already exists"
            });
        }

        const salt = await bcrypt.genSalt(10);

        const hashedPassword = await bcrypt.hash(password, salt);

        const user = new User({
            name,
            email: normalizedEmail,
            password: hashedPassword
        });

        await user.save();

        res.status(201).json({
            message: "User Registered Successfully"
        });

    } catch (error) {

        console.error("Signup failed:", error.message);

        res.status(500).json({
            message: "Server Error"
        });

    }

});

router.post("/login", async (req, res) => {

    try {

        const { email, password } = req.body || {};

        if (typeof email !== "string" || typeof password !== "string" || !email.trim() || !password) {
            return res.status(400).json({ message: "Email and password are required." });
        }

        if (!process.env.JWT_SECRET) {
            return res.status(503).json({ message: "Authentication is not configured on the server." });
        }

        //checks for email match
        const user = await User.findOne({ email: email.trim().toLowerCase() });
        if (!user) {
            return res.status(400).json({
                message: "Invalid Email or Password"
            });
        }
        //checks for password match
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({
                message: "Invalid Email or Password"
            });
        }

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.status(200).json({
            message: "Login Successful",
            token
        });

    } catch (error) {

        console.error("Login failed:", error.message);

        res.status(500).json({
            message: "Server Error"
        });

    }

});

module.exports = router;
