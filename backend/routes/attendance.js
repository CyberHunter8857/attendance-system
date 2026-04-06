const express = require("express");
const auth = require("../middleware/auth");
const ClassSession = require("../models/ClassSession");
const AttendanceRecord = require("../models/AttendanceRecord");
const User = require("../models/User");

const router = express.Router();

// Teacher starts a session
router.post("/start", auth, async (req, res) => {
    try {
        if (req.user.role !== "teacher") {
            return res.status(403).json({ error: "Access denied" });
        }
        
        const { subject } = req.body;
        if (!subject) {
            return res.status(400).json({ error: "Subject is required" });
        }

        const session = new ClassSession({
            subject,
            teacherId: req.user.id
        });
        
        await session.save();
        res.status(201).json(session);
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});

// Teacher ends a session
router.put("/stop/:id", auth, async (req, res) => {
    try {
        if (req.user.role !== "teacher") {
            return res.status(403).json({ error: "Access denied" });
        }

        const session = await ClassSession.findOneAndUpdate(
            { _id: req.params.id, teacherId: req.user.id },
            { status: "closed" },
            { new: true }
        );

        if (!session) {
            return res.status(404).json({ error: "Session not found" });
        }

        res.json(session);
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});

// Get active sessions
router.get("/active", auth, async (req, res) => {
    try {
        const sessions = await ClassSession.find({ status: "active" }).populate("teacherId", "name");
        res.json(sessions);
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});

// Student manually checks in
router.post("/mark-present", auth, async (req, res) => {
    try {
        if (req.user.role !== "student") {
            return res.status(403).json({ error: "Access denied" });
        }

        const { sessionId } = req.body;
        if (!sessionId) {
            return res.status(400).json({ error: "Session ID is required" });
        }

        const session = await ClassSession.findById(sessionId);
        if (!session || session.status !== "active") {
            return res.status(400).json({ error: "Invalid or closed session" });
        }

        const record = new AttendanceRecord({
            sessionId: session._id,
            studentId: req.user.id,
            room: "Web Check-in"
        });

        await record.save();
        res.status(201).json({ message: "Attendance marked successfully" });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ error: "You have already marked attendance for this session" });
        }
        res.status(500).json({ error: "Server error" });
    }
});

// Get student's attendance history
router.get("/student/:id", auth, async (req, res) => {
    try {
        // Find only for the requesting student, unless they're a teacher wanting to view
        if (req.user.role === "student" && req.user.id !== req.params.id) {
            return res.status(403).json({ error: "Access denied" });
        }

        const records = await AttendanceRecord.find({ studentId: req.params.id })
            .populate("sessionId", "subject date")
            .sort({ timestamp: -1 });
        res.json(records);
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
