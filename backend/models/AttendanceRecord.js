const mongoose = require("mongoose");

const attendanceRecordSchema = new mongoose.Schema({
    sessionId: { type: mongoose.Schema.Types.ObjectId, ref: "ClassSession", required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    room: { type: String, default: "Web Check-in" }, // Default location for web check-ins
    status: { type: String, enum: ["present", "absent"], default: "present" },
    timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

// Prevent duplicate attendance for the same session and student
attendanceRecordSchema.index({ sessionId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model("AttendanceRecord", attendanceRecordSchema);
