const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "fallback_super_secret_key";

// Signup Route
router.post("/signup", async (req, res) => {
    try {
        const { name, email, password, role, branch, photo } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "User already exists with this email" });
        }

        // Hash Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Handle Photo Save
        let photoPath = null;
        if (photo && photo.startsWith("data:image")) {
            const fs = require("fs");
            const path = require("path");
            
            // Extract base64 data
            const matches = photo.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
            if (matches && matches.length === 3) {
                const imageBuffer = Buffer.from(matches[2], "base64");
                const uploadDir = path.join(__dirname, "../uploads/photos");
                
                // Ensure directory exists
                if (!fs.existsSync(uploadDir)) {
                    fs.mkdirSync(uploadDir, { recursive: true });
                }

                const fileName = `${Date.now()}_${name.replace(/\s+/g, '_')}.png`;
                photoPath = `/uploads/photos/${fileName}`;
                fs.writeFileSync(path.join(uploadDir, fileName), imageBuffer);
            }
        }

        // Create User
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role: role || "student",
            branch: role === "teacher" ? null : branch,
            photo: photoPath
        });

        await newUser.save();

        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        console.error("Signup Error:", error);
        res.status(500).json({ error: "Server error during registration" });
    }
});

// Login Route
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: "Invalid email or password" });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: "Invalid email or password" });
        }

        // Generate Token
        const token = jwt.sign(
            { id: user._id, role: user.role, branch: user.branch, name: user.name, email: user.email },
            JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.json({
            message: "Logged in successfully",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                branch: user.branch,
                photo: user.photo
            }
        });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ error: "Server error during login" });
    }
});

// Get User by ID
router.get("/user/:id", async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password");
        if (!user) return res.status(404).json({ error: "User not found" });
        res.json(user);
    } catch (error) {
        console.error("Get User Error:", error);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
