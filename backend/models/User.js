const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    companyName: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    whatsappNumber: { type: String, required: true },
    twoWheelerSlots: { type: Number, default: 0 },
    fourWheelerSlots: { type: Number, default: 0 },
    fourWheelerBigSlots: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);