const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Student = require("./models/Student");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

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

// ✅ Identify Student by MAC
app.post("/api/identify", async (req, res) => {
    try {
        const { mac } = req.body;

        const student = await Student.findOne({
            mac: mac.toLowerCase()
        });

        if (!student) {
            return res.json({ found: false, student: null });
        }

        return res.json({ found: true, student: student.name });
    } catch (error) {
        console.log("Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
