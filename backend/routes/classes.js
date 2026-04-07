const express = require("express");
const auth = require("../middleware/auth");
const Class = require("../models/Class");

const router = express.Router();

// GET all classes for a teacher
router.get("/", auth, async (req, res) => {
    try {
        if (req.user.role !== "teacher") {
            return res.status(403).json({ error: "Access denied" });
        }

        // Sort by lastAttended descending (newest first), then createdAt descending
        const classes = await Class.find({ teacherId: req.user.id })
            .sort({ lastAttended: -1, createdAt: -1 });
            
        res.json(classes);
    } catch (error) {
        console.error("Fetch classes error:", error);
        res.status(500).json({ error: "Server error" });
    }
});

// POST to create a new class
router.post("/", auth, async (req, res) => {
    try {
        if (req.user.role !== "teacher") {
            return res.status(403).json({ error: "Access denied" });
        }

        const { name, room, branch } = req.body;
        if (!name || !room || !branch) {
            return res.status(400).json({ error: "Name, room, and branch are required" });
        }

        const newClass = new Class({
            name,
            room,
            branch,
            teacherId: req.user.id
        });

        await newClass.save();
        res.status(201).json(newClass);
    } catch (error) {
        console.error("Create class error:", error);
        res.status(500).json({ error: "Server error" });
    }
});

// DELETE a class
router.delete("/:id", auth, async (req, res) => {
    try {
        if (req.user.role !== "teacher") {
            return res.status(403).json({ error: "Access denied" });
        }

        const deletedClass = await Class.findOneAndDelete({ _id: req.params.id, teacherId: req.user.id });
        if (!deletedClass) {
            return res.status(404).json({ error: "Class not found" });
        }

        res.json({ message: "Class successfully deleted" });
    } catch (error) {
        console.error("Delete class error:", error);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
