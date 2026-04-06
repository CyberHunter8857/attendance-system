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

// Get teacher's all sessions
router.get("/teacher/sessions", auth, async (req, res) => {
    try {
        if (req.user.role !== "teacher") {
            return res.status(403).json({ error: "Access denied" });
        }
        const sessions = await ClassSession.find({ teacherId: req.user.id })
            .sort({ createdAt: -1 })
            .limit(10);
        res.json(sessions);
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});

// Get all attendance records for a specific session
router.get("/session/:sessionId/attendance", auth, async (req, res) => {
    try {
        if (req.user.role !== "teacher") {
            return res.status(403).json({ error: "Access denied" });
        }
        
        const session = await ClassSession.findById(req.params.sessionId);
        if (!session) {
            return res.status(404).json({ error: "Session not found" });
        }
        
        if (session.teacherId.toString() !== req.user.id.toString()) {
             return res.status(403).json({ error: "Access denied" });
        }

        const records = await AttendanceRecord.find({ sessionId: req.params.sessionId })
            .populate("studentId", "name email")
            .sort({ timestamp: -1 });
            
        res.json({ session, records });
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
        if (req.user.role === "student" && req.user.id !== req.params.id) {
            return res.status(403).json({ error: "Access denied" });
        }

        const records = await AttendanceRecord.find({ studentId: req.params.id })
            .populate("sessionId", "subject date status")
            .lean();

        const allSessions = await ClassSession.find().sort({ createdAt: -1 }).lean();
        const presentSessionIds = new Set(records.map(r => r.sessionId ? r.sessionId._id.toString() : ""));

        const combinedHistory = allSessions.map(session => {
            const sid = session._id.toString();
            if (presentSessionIds.has(sid)) {
                const rec = records.find(r => r.sessionId && r.sessionId._id.toString() === sid);
                return {
                    _id: rec._id,
                    sessionId: session,
                    room: rec.room,
                    status: "present",
                    timestamp: rec.timestamp
                };
            } else {
                return {
                    _id: "absent_" + sid,
                    sessionId: session,
                    room: "Missed",
                    status: session.status === "active" ? "pending" : "absent",
                    timestamp: session.createdAt || session.date
                };
            }
        });

        const pastOrAttendedSessions = combinedHistory.filter(h => h.status !== "pending");
        const totalClasses = pastOrAttendedSessions.length;
        const attendedClasses = pastOrAttendedSessions.filter(h => h.status === "present").length;
        const missedClasses = pastOrAttendedSessions.filter(h => h.status === "absent").length;
        
        const attendanceRate = totalClasses === 0 ? 100 : Math.round((attendedClasses / totalClasses) * 100);

        res.json({
            history: pastOrAttendedSessions,
            stats: {
                attendanceRate,
                totalCheckins: attendedClasses,
                missedClasses
            }
        });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});

// Get teacher's recent attendance activity
router.get("/teacher/recent", auth, async (req, res) => {
    try {
        if (req.user.role !== "teacher") {
            return res.status(403).json({ error: "Access denied" });
        }

        // Find all sessions created by this teacher
        const sessions = await ClassSession.find({ teacherId: req.user.id });
        const sessionIds = sessions.map(session => session._id);

        // Find recent attendance records for these sessions
        const records = await AttendanceRecord.find({ sessionId: { $in: sessionIds } })
            .populate("studentId", "name")
            .populate("sessionId", "subject")
            .sort({ timestamp: -1 })
            .limit(20);

        res.json(records);
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
