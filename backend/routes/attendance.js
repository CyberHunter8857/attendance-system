const express = require("express");
const auth = require("../middleware/auth");
const ClassSession = require("../models/ClassSession");
const AttendanceRecord = require("../models/AttendanceRecord");
const User = require("../models/User");
const Class = require("../models/Class");

const router = express.Router();

// Helper to calculate distance in meters using Haversine formula
const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Earth radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // meters
};

// Teacher starts a session
router.post("/start", auth, async (req, res) => {
    try {
        if (req.user.role !== "teacher") {
            return res.status(403).json({ error: "Access denied" });
        }

        const { subject, branch, latitude, longitude, radius } = req.body;
        if (!subject || !branch) {
            return res.status(400).json({ error: "Subject and Branch are required" });
        }

        const session = new ClassSession({
            subject,
            branch,
            teacherId: req.user.id,
            location: {
                latitude,
                longitude
            },
            radius: radius || 500
        });

        await session.save();

        // Update lastAttended timestamp for the corresponding Class
        await Class.findOneAndUpdate(
            { name: subject, branch: branch, teacherId: req.user.id },
            { lastAttended: Date.now() }
        );

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
        let filter = { status: "active" };
        if (req.user.role === "student" && req.user.branch) {
            filter.branch = req.user.branch;
        }

        const sessions = await ClassSession.find(filter).populate("teacherId", "name");
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
            .sort({ createdAt: -1 });

        const sessionIds = sessions.map(s => s._id);
        const attendanceCounts = await AttendanceRecord.aggregate([
            { $match: { sessionId: { $in: sessionIds } } },
            { $group: { _id: "$sessionId", count: { $sum: 1 } } }
        ]);

        const sessionsWithCounts = sessions.map(session => {
            const countObj = attendanceCounts.find(c => c._id.toString() === session._id.toString());
            return {
                ...session.toObject(),
                presentCount: countObj ? countObj.count : 0
            };
        });

        res.json(sessionsWithCounts);
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

        const { sessionId, latitude, longitude } = req.body;
        if (!sessionId) {
            return res.status(400).json({ error: "Session ID is required" });
        }

        const session = await ClassSession.findById(sessionId);
        if (!session || session.status !== "active") {
            return res.status(400).json({ error: "Invalid or closed session" });
        }

        // Location Check
        if (session.location && session.location.latitude && session.location.longitude) {
            if (!latitude || !longitude) {
                return res.status(400).json({ error: "Location is required to mark attendance" });
            }

            const distance = getDistance(
                session.location.latitude,
                session.location.longitude,
                latitude,
                longitude
            );

            // Allow a small 10% or 10m buffer for GPS jitter
            const allowedRadius = session.radius + Math.max(10, session.radius * 0.1);

            if (distance > allowedRadius) {
                return res.status(403).json({
                    error: "You are outside the attendance zone",
                    distance: Math.round(distance),
                    required: session.radius
                });
            }
        }

        const record = new AttendanceRecord({
            sessionId: session._id,
            studentId: req.user.id,
            room: "Geo-tagged Check-in"
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

        const targetStudent = await User.findById(req.params.id);
        if (!targetStudent) {
            return res.status(404).json({ error: "Student not found" });
        }

        let sessionFilter = {};
        if (targetStudent.branch) {
            sessionFilter.branch = targetStudent.branch;
        }

        const allSessions = await ClassSession.find(sessionFilter).sort({ createdAt: -1 }).lean();
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
            .sort({ timestamp: -1 });

        res.json(records);
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});

// Get teacher dashboard KPI stats
router.get("/teacher/stats", auth, async (req, res) => {
    try {
        if (req.user.role !== "teacher") {
            return res.status(403).json({ error: "Access denied" });
        }

        // Total Students
        const totalStudents = await User.countDocuments({ role: "student" });

        // Present Now (Unique students in active sessions)
        const activeSessions = await ClassSession.find({ status: "active" });
        const activeSessionIds = activeSessions.map(s => s._id);

        const presentUnique = await AttendanceRecord.distinct("studentId", {
            sessionId: { $in: activeSessionIds }
        });
        const presentNow = presentUnique.length;

        // You can calculate trends here if needed but for now we just return the true integers
        res.json({
            totalStudents,
            presentNow,
            activeScanners: "2/3", // keep mock if hardware isn't linked
            alerts: 0
        });

    } catch (error) {
        console.error("Stats Error", error);
        res.status(500).json({ error: "Server error" });
    }
});

// Get list of students (filtered by branch optionally)
router.get("/teacher/students", auth, async (req, res) => {
    try {
        if (req.user.role !== "teacher") {
            return res.status(403).json({ error: "Access denied" });
        }

        const query = { role: "student" };
        if (req.query.branch && req.query.branch !== "All") {
            query.branch = req.query.branch;
        }

        const students = await User.find(query).select("name email branch photo").sort({ name: 1 });
        res.json(students);
    } catch (error) {
        console.error("Students list error", error);
        res.status(500).json({ error: "Server error" });
    }
});

// Get comprehensive report data
router.get("/teacher/report", auth, async (req, res) => {
    try {
        if (req.user.role !== "teacher") {
            return res.status(403).json({ error: "Access denied" });
        }

        const { startDate, endDate, classId } = req.query;
        let sessionQuery = { teacherId: req.user.id };

        if (startDate && endDate) {
            sessionQuery.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(new Date(endDate).setHours(23, 59, 59))
            };
        }

        if (classId && classId !== "all") {
            const Class = require("../models/Class");
            const cls = await Class.findById(classId);
            if (cls) {
                sessionQuery.subject = cls.name;
                sessionQuery.branch = cls.branch;
            }
        }

        const sessions = await ClassSession.find(sessionQuery).sort({ createdAt: -1, date: -1 });
        
        // Ensure sessionIds are clean hex strings to prevent CastError if any session has malformed ID
        const sessionIds = sessions.map(s => {
            const idStr = s._id.toString();
            // If the ID was stored as the literal string "ObjectId('...')", clean it up
            if (idStr.startsWith("ObjectId(")) {
                return idStr.replace(/ObjectId\(['"](.+)['"]\)/, "$1").replace(/[()"']/g, "");
            }
            return s._id;
        });

        const records = await AttendanceRecord.find({ sessionId: { $in: sessionIds } })
            .populate("studentId", "name email branch")
            .populate("sessionId", "subject branch")
            .lean();

        // Optimized Cache-based student lookup
        const User = require("../models/User");
        const uniqueBranches = [...new Set(sessions.map(s => s.branch).filter(Boolean))];
        const branchStudentsCache = {};
        
        // Fetch all students for all relevant branches in one go
        const allRelevantStudents = await User.find({ 
            role: "student", 
            branch: { $in: uniqueBranches } 
        }).lean();

        // Group students by branch
        allRelevantStudents.forEach(s => {
            if (!branchStudentsCache[s.branch]) branchStudentsCache[s.branch] = [];
            branchStudentsCache[s.branch].push(s);
        });

        const reportData = [];

        for (const session of sessions) {
            const studentsInBranch = branchStudentsCache[session.branch] || [];
            const sessionRecords = records.filter(r => r.sessionId && r.sessionId._id.toString() === session._id.toString());
            
            const presentStudentIds = new Set(
                sessionRecords
                    .filter(r => r.studentId && r.studentId._id)
                    .map(r => r.studentId._id.toString())
            );

            for (const student of studentsInBranch) {
                if (student && student._id && presentStudentIds.has(student._id.toString())) {
                    const rec = sessionRecords.find(r => r.studentId && r.studentId._id && r.studentId._id.toString() === student._id.toString());
                    reportData.push({
                        studentName: student.name,
                        email: student.email,
                        branch: student.branch,
                        subject: session.subject,
                        date: session.createdAt || session.date,
                        status: "Present",
                        timestamp: rec ? rec.timestamp : null
                    });
                } else {
                    reportData.push({
                        studentName: student.name,
                        email: student.email,
                        branch: student.branch,
                        subject: session.subject,
                        date: session.createdAt || session.date,
                        status: "Absent",
                        timestamp: null
                    });
                }
            }
        }

        // Sort by date descending
        reportData.sort((a, b) => new Date(b.date) - new Date(a.date));

        res.json(reportData);
    } catch (error) {
        console.error("Report Error:", error);
        res.status(500).json({ error: "Server error", details: error.message });
    }
});

module.exports = router;
