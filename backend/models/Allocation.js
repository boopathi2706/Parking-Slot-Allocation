const mongoose = require('mongoose');

const AllocationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    vehicleNumber: { type: String, required: true },
    vehicleType: { type: String, required: true },
    ownerName: { type: String, required: true },
    ownerPhone: { type: String, required: true },
    slotId: { type: mongoose.Schema.Types.ObjectId, ref: 'Slot', required: true },
    entryTime: { type: Date, default: Date.now },
    otp: { type: String }, // For verification
    isVerified: { type: Boolean, default: false }
});

AllocationSchema.index({ vehicleNumber: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Allocation', AllocationSchema);