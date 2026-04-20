const mongoose = require("mongoose");

const liveDetectionSchema = new mongoose.Schema({
  deviceMac: { type: String, required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  studentName: { type: String, required: true },
  rssi: { type: Number, default: -99 },
  room: { type: String, default: "Unknown Location" },
  status: { type: String, default: "detected" },
  createdAt: { 
    type: Date, 
    default: Date.now, 
    expires: 60 // Document automatically removed after 60 seconds by MongoDB TTL index
  }
});

// Since we want fast queries based on time and studentId
liveDetectionSchema.index({ createdAt: -1 });

module.exports = mongoose.model("LiveDetection", liveDetectionSchema);
