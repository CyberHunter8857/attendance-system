const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authRoutes = require("./routes/auth");
require("dotenv").config();

const path = require("path");

const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cors());

// Serve static photo uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", authRoutes);
const attendanceRoutes = require("./routes/attendance");
const classesRoutes = require("./routes/classes");

app.use("/api/attendance", attendanceRoutes);
app.use("/api/classes", classesRoutes);

// ✅ Replace MongoDB local with Atlas
const MONGO_URI = process.env.MONGO_URI ||
    "mongodb+srv://<username>:<password>@cluster0.xyz.mongodb.net/attendanceDB?retryWrites=true&w=majority";

// ✅ MongoDB Connect
mongoose
    .connect(MONGO_URI)
    .then(() => console.log("✅ MongoDB Atlas Connected"))
    .catch((err) => console.log(err));

// ✅ Home Test
app.get("/", (req, res) => {
    res.send("✅ Attendance API Running...");
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
