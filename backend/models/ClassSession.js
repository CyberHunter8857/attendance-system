const mongoose = require("mongoose");

const classSessionSchema = new mongoose.Schema({
    subject: { type: String, required: true },
    branch: { 
        type: String, 
        enum: ["Computer Science", "ENTC", "IT", "Mechanical", "Electrical", "Other"],
        required: true
    },
    date: { type: Date, default: Date.now },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["active", "closed"], default: "active" },
}, { timestamps: true });

module.exports = mongoose.model("ClassSession", classSessionSchema);
