const mongoose = require('mongoose');

const SlotSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    slotNumber: { type: String, required: true },
    type: { type: String, enum: ['2W', '4W', 'Big'], required: true },
    status: { type: String, enum: ['Free', 'Occupied', 'Repair', 'Prebooked'], default: 'Free' },
    createdAt: { type: Date, default: Date.now }
});

SlotSchema.index({ slotNumber: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Slot', SlotSchema);
