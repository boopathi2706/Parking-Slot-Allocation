const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
const Dashboard = require('./models/Dashboard');
const Slot = require('./models/Slot');

async function debugData() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/parking_db');
        console.log("DB Connected");

        const user = await User.findOne({ username: 'ajay' });
        if (!user) {
            console.log("User 'ajay' not found");
            return;
        }

        console.log("\n--- USER DATA ---");
        console.log(`ID: ${user._id}`);
        console.log(`Slots: 2W=${user.twoWheelerSlots}, 4W=${user.fourWheelerSlots}, Big=${user.fourWheelerBigSlots}`);

        const dashboard = await Dashboard.findOne({ user: user._id });
        console.log("\n--- DASHBOARD DATA ---");
        if (dashboard) {
            console.log(`Total: ${dashboard.totalSlots}, Free: ${dashboard.freeSlots}`);
        } else {
            console.log("Dashboard NOT FOUND");
        }

        const slotsCount = await Slot.countDocuments({ user: user._id });
        console.log(`\n--- SLOTS DATA ---`);
        console.log(`Total Slots in DB for this user: ${slotsCount}`);

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

debugData();
