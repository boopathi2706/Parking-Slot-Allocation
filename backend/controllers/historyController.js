const History = require('../models/History');

// GET /api/history
// Fetch all history records for the user
exports.getHistory = async (req, res) => {
    try {
        const history = await History.find({ user: req.user.id }).sort({ exitTime: -1 });
        res.status(200).json({ success: true, data: history });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// DELETE /api/history/:id
// Delete a history record
exports.deleteHistoryRecord = async (req, res) => {
    try {
        const { id } = req.params;
        const history = await History.findOneAndDelete({ _id: id, user: req.user.id });
        if (!history) return res.status(404).json({ message: "History record not found" });
        res.status(200).json({ success: true, message: "History record deleted" });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};
