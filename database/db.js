const mongoose = require('mongoose');

const connectToDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected successfully.");
    } catch (e) {
        console.error("Error connecting to the database:", e.message);
        process.exit(1); // Exit the process with failure
    }
}

module.exports = connectToDB;