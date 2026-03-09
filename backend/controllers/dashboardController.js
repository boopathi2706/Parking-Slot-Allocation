const Dashboard = require('../models/Dashboard');

// GET /api/dashboard
// Fetch dashboard for the authenticated user
exports.getDashboard = async (req, res) => {
  try {
    let dashboard = await Dashboard.findOne({ user: req.user.id });

    if (!dashboard) {
      // Lazy Init: Create if not found
      dashboard = new Dashboard({
        user: req.user.id,
        totalSlots: 0,
        freeSlots: 0,
        filledSlots: 0,
        todaysEntry: 0,
        todaysRevenue: 0,
        totalProfit: 0
      });
      await dashboard.save();
      console.log(`[DASHBOARD] Initialized for user: ${req.user.id}`);
    }

    res.status(200).json({
      success: true,
      data: dashboard
    });
  } catch (error) {
    console.error("Error fetching dashboard:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// PUT /api/dashboard
// Update dashboard stats for the authenticated user
exports.updateDashboard = async (req, res) => {
  try {
    const updates = req.body;

    // Prevent updating the user field or _id
    delete updates.user;
    delete updates._id;

    const dashboard = await Dashboard.findOneAndUpdate(
      { user: req.user.id },
      { $set: updates, updatedAt: Date.now() },
      { returnDocument: 'after', runValidators: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({
      success: true,
      message: "Dashboard updated successfully",
      data: dashboard
    });
  } catch (error) {
    console.error("Error updating dashboard:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};