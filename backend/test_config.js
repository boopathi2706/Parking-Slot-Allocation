const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const axios = require('axios');
require('dotenv').config();
const User = require('./models/User');

async function testConfig() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/parking_db');
        const user = await User.findOne({ username: 'ajay' });
        if (!user) {
            console.log("User 'ajay' not found");
            return;
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        console.log("Generated Token for ajay:", token);

        const config = { twoWheeler: 10, fourWheeler: 20, bigVehicle: 5 };

        console.log("\nAttempting PUT /api/user/vehicle-config...");
        const res = await axios.put('https://parking-slot-allocation.onrender.com/api/user/vehicle-config', config, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log("Response Status:", res.status);
        console.log("Response Data:", JSON.stringify(res.data, null, 2));

        process.exit(0);
    } catch (e) {
        console.error("Test Failed:");
        if (e.response) {
            console.error("Status:", e.response.status);
            console.error("Data:", e.response.data);
        } else {
            console.error(e.message);
        }
        process.exit(1);
    }
}

testConfig();
