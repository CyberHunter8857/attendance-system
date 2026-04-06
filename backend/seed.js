require("dotenv").config();
const mongoose = require("mongoose");
const student = require("./models/Student");

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB Atlas Connected"))
    .catch((err) => console.log(err));

async function seed() {
    await student.create({
        name: "Mayur Tamanke",
        mac: "08:3f:21:89:b2:1e"
    });

    console.log("✅ Sample data inserted");
    mongoose.connection.close();
}

seed();
