const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/parking_db');
        console.log(`MongoDB Connected: ${conn.connection.host}`);

        mongoose.connection.once('open', () => {
            console.log("MongoDB Connected Successfully - Ready for operations");
        });
    } catch (err) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
