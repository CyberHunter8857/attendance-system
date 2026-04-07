const mongoose = require("mongoose");

const classSchema = new mongoose.Schema({
    name: { type: String, required: true },
    room: { type: String, required: true },
    branch: { 
        type: String, 
        enum: ["Computer Science", "ENTC", "IT", "Mechanical", "Electrical", "Other"],
        required: true 
    },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    lastAttended: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model("Class", classSchema);
