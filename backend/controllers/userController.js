const User = require('../models/User');
const Dashboard = require('../models/Dashboard');
const Slot = require('../models/Slot');

/**
 * Update Vehicle Configuration (Slot Counts)
 * PUT /api/user/vehicle-config
 */
exports.updateVehicleConfig = async (req, res) => {
    try {
        const { twoWheeler, fourWheeler, bigVehicle } = req.body;
        console.log("[USER CONTROLLER] Request Body:", req.body);
        console.log("[USER CONTROLLER] User ID from req.user:", req.user?.id);

        // 1. Validation
        if (twoWheeler < 0 || fourWheeler < 0 || bigVehicle < 0) {
            return res.status(400).json({ message: "Slot counts cannot be negative" });
        }

        // 2. Calculate Total Slots
        const totalSlots = twoWheeler + fourWheeler + bigVehicle;

        // 3. Update User Schema
        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            {
                twoWheelerSlots: twoWheeler,
                fourWheelerSlots: fourWheeler,
                fourWheelerBigSlots: bigVehicle
            },
            { returnDocument: 'after', runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // 4. Update Dashboard document
        // We set totalSlots and freeSlots to the calculated total (assuming initial setup or reset)
        const updatedDashboard = await Dashboard.findOneAndUpdate(
            { user: req.user.id },
            {
                $set: {
                    totalSlots: totalSlots,
                    freeSlots: totalSlots, // Reset free slots to total on config update as per requirements
                    updatedAt: Date.now()
                }
            },
            { returnDocument: 'after', upsert: true }
        );

        if (!updatedDashboard) {
            return res.status(404).json({ message: "Dashboard not found for this user" });
        }

        // 5. Initialize/Recreate Slots for this User
        await Slot.deleteMany({ user: req.user.id });
        const slots = [];
        let count = 1;

        const createBatch = (type, qty) => {
            for (let i = 0; i < qty; i++) {
                slots.push({
                    user: req.user.id,
                    slotNumber: `${type}-${count++}`,
                    type: type,
                    status: 'Free'
                });
            }
        };

        createBatch('2W', twoWheeler);
        createBatch('4W', fourWheeler);
        createBatch('Big', bigVehicle);

        if (slots.length > 0) {
            await Slot.insertMany(slots);
        }
        console.log(`[USER CONTROLLER] Created ${slots.length} slots for user ${req.user.id}`);

        res.status(200).json({
            success: true,
            message: "Vehicle configuration updated and slots initialized successfully",
            data: {
                user: updatedUser,
                dashboard: updatedDashboard,
                slotsCreated: slots.length
            }
        });

    } catch (error) {
        console.error("[USER CONTROLLER] Error updating vehicle config:", error.message);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};
