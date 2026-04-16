const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["teacher", "student"], default: "student" },
    branch: { 
        type: String, 
        enum: ["Computer Science", "ENTC", "IT", "Mechanical", "Electrical", "Other"], 
        default: null 
    },
    photo: { type: String, default: null }, // Stores local file path
    faceDescriptor: { type: [Number], default: [] }, // Stores 128-float face signature
    macAddress: { type: String, default: null }, // Stores BLE MAC Address
    lastBleSync: { type: Date, default: null }, // Stores the timestamp when Raspberry Pi last scanned this user

}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
