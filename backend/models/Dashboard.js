const mongoose = require('mongoose');

const DashboardSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    totalSlots: { type: Number, default: 0 },
    freeSlots: { type: Number, default: 0 },
    filledSlots: { type: Number, default: 0 },
    todaysEntry: { type: Number, default: 0 },
    todaysRevenue: { type: Number, default: 0 },
    totalProfit: { type: Number, default: 0 },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Dashboard', DashboardSchema);
