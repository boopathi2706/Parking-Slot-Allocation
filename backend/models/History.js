const mongoose = require('mongoose');

const HistorySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    vehicleNumber: { type: String, required: true },
    ownerName: { type: String, required: true },
    ownerPhone: { type: String, required: true },
    entryTime: { type: Date, required: true },
    exitTime: { type: Date, default: Date.now },
    durationHours: { type: Number, required: true },
    amount: { type: Number, required: true },
    slotNumber: { type: String, required: true }
});

module.exports = mongoose.model('History', HistorySchema);
