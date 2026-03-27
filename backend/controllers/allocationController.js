const Allocation = require('../models/Allocation');
const Slot = require('../models/Slot');
const History = require('../models/History');

// Pending allocation temp store (in-memory, cleared on verify/cancel)
// Structure: { [tempId]: { user, vehicleNumber, vehicleType, ownerName, ownerPhone, slotId, otp } }
const pendingAllocations = {};

// Request Allocation (Send OTP) — does NOT write to DB yet
exports.allocationRequest = async (req, res) => {
    try {
        const { vehicleNumber, vehicleType, ownerName, ownerPhone, slotNumber } = req.body;
        console.log(`[ALLOCATION] Request: ${vehicleNumber} (${vehicleType}) in ${slotNumber}`);

        // 1. Check if vehicle already has an active allocation for this user
        const existingAllocation = await Allocation.findOne({ vehicleNumber, user: req.user.id });
        if (existingAllocation) {
            return res.status(400).json({ message: "Vehicle already has an active allocation" });
        }

        // 2. Check Slot Availability
        const slot = await Slot.findOne({ slotNumber, user: req.user.id });
        if (!slot) return res.status(404).json({ message: "Slot not found" });
        if (slot.status !== 'Free') return res.status(400).json({ message: `Slot is not free (currently ${slot.status})` });

        // 3. Generate OTP (Mock) — NOT saved to DB yet
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const tempId = `${req.user.id}_${Date.now()}`;
        console.log(`[MOCK OTP] ${vehicleNumber}: ${otp} | tempId: ${tempId}`);

        // 4. Hold in memory — DB write happens only after OTP is verified
        pendingAllocations[tempId] = {
            user: req.user.id,
            vehicleNumber, vehicleType, ownerName, ownerPhone,
            slotId: slot._id, slotNumber,
            otp,
            createdAt: Date.now()
        };

        // Auto-expire pending allocation after 10 minutes
        setTimeout(() => {
            delete pendingAllocations[tempId];
            console.log(`[ALLOCATION] Expired pending allocation: ${tempId}`);
        }, 10 * 60 * 1000);

        res.status(200).json({ success: true, message: "OTP sent to WhatsApp", allocationId: tempId, mockOtp: otp });

    } catch (error) {
        console.error(`[ALLOCATION] Error: ${error.message}`);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// Verify Allocation OTP — writes to DB only on correct OTP
exports.verifyAllocation = async (req, res) => {
    try {
        const { allocationId, otp } = req.body;
        console.log(`[VERIFY ALLOCATION] ID: ${allocationId}, OTP: ${otp}`);

        const pending = pendingAllocations[allocationId];

        if (!pending || pending.user !== req.user.id) {
            return res.status(404).json({ message: "Allocation request not found or already processed" });
        }
        if (pending.otp !== otp) {
            return res.status(400).json({ message: "Invalid OTP. Please try again." });
        }

        // OTP is correct — now save to DB
        const newAllocation = new Allocation({
            user: pending.user,
            vehicleNumber: pending.vehicleNumber,
            vehicleType: pending.vehicleType,
            ownerName: pending.ownerName,
            ownerPhone: pending.ownerPhone,
            slotId: pending.slotId,
            otp: pending.otp,
            isVerified: true
        });
        await newAllocation.save();

        // Mark slot as Occupied
        await Slot.findByIdAndUpdate(pending.slotId, { status: 'Occupied' });

        // Update Dashboard Stats
        const Dashboard = require('../models/Dashboard');
        await Dashboard.findOneAndUpdate(
            { user: req.user.id },
            {
                $inc: { filledSlots: 1, freeSlots: -1, todaysEntry: 1 },
                $set: { updatedAt: Date.now() }
            },
            { upsert: true }
        );

        // Remove from pending store
        delete pendingAllocations[allocationId];

        console.log(`[VERIFY ALLOCATION] Success. Allocation saved. Slot ${pending.slotNumber} Occupied.`);
        res.status(200).json({ success: true, message: "Allocation Successful" });

    } catch (error) {
        console.error(`[VERIFY ALLOCATION] Error: ${error.message}`);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// Calculate Deallocation Price (Preview)
exports.calculateExit = async (req, res) => {
    try {
        const { vehicleNumber } = req.body;
        console.log(`[CALC EXIT] Request for ${vehicleNumber}`);

        const allocation = await Allocation.findOne({ vehicleNumber, isVerified: true, user: req.user.id }).populate('slotId');
        if (!allocation) return res.status(404).json({ message: "Vehicle not found" });

        const now = new Date();
        const entry = new Date(allocation.entryTime);
        const diffMs = now - entry;
        const diffHrs = Math.ceil(diffMs / (1000 * 60 * 60));

        const days = Math.ceil(diffHrs / 24) || 1;
        let rate = 0;
        if (allocation.vehicleType === '2W') rate = 20;
        else if (allocation.vehicleType === '4W') rate = 40;
        else if (allocation.vehicleType === 'Big') rate = 100;

        const amount = days * rate;

        res.status(200).json({
            success: true,
            data: {
                vehicleNumber,
                entryTime: allocation.entryTime,
                exitTime: now,
                durationHours: diffHrs,
                amount,
                days,
                slotNumber: allocation.slotId.slotNumber
            },
            mockOtp: allocation.otp
        });

    } catch (error) {
        console.error(`[CALC EXIT] Error: ${error.message}`);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// Verify Deallocation OTP & Complete Exit
exports.verifyDeallocation = async (req, res) => {
    try {
        const { vehicleNumber, otp, amount, durationHours } = req.body;
        console.log(`[VERIFY EXIT] Request for ${vehicleNumber}`);

        const allocation = await Allocation.findOne({ vehicleNumber, isVerified: true, user: req.user.id }).populate('slotId');
        if (!allocation) return res.status(404).json({ message: "Allocation not found" });

        if (allocation.otp !== otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        const history = new History({
            user: req.user.id,
            vehicleNumber: allocation.vehicleNumber,
            ownerName: allocation.ownerName,
            ownerPhone: allocation.ownerPhone,
            entryTime: allocation.entryTime,
            exitTime: new Date(),
            durationHours,
            amount,
            slotNumber: allocation.slotId.slotNumber
        });
        await history.save();

        await Slot.findByIdAndUpdate(allocation.slotId._id, { status: 'Free' });
        await Allocation.findByIdAndDelete(allocation._id);

        const Dashboard = require('../models/Dashboard');
        await Dashboard.findOneAndUpdate(
            { user: req.user.id },
            {
                $inc: { filledSlots: -1, freeSlots: 1, todaysRevenue: amount, totalProfit: amount },
                $set: { updatedAt: Date.now() }
            },
            { upsert: true }
        );

        console.log(`[VERIFY EXIT] Done. Slot ${allocation.slotId.slotNumber} freed.`);
        res.status(200).json({ success: true, message: "Deallocation Successful. Slot is now Free." });

    } catch (error) {
        console.error(`[VERIFY EXIT] Error: ${error.message}`);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// Get All Verified Active Allocations for User
exports.getActiveAllocations = async (req, res) => {
    try {
        const allocations = await Allocation.find({ user: req.user.id, isVerified: true }).populate('slotId');
        res.status(200).json({ success: true, data: allocations });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// Delete an Active Allocation (Free Slot)
exports.deleteActiveAllocation = async (req, res) => {
    try {
        const { id } = req.params;
        const allocation = await Allocation.findOne({ _id: id, user: req.user.id });
        if (!allocation) return res.status(404).json({ message: "Allocation not found" });

        await Slot.findByIdAndUpdate(allocation.slotId, { status: 'Free' });

        const Dashboard = require('../models/Dashboard');
        await Dashboard.findOneAndUpdate(
            { user: req.user.id },
            { $inc: { filledSlots: -1, freeSlots: 1 }, $set: { updatedAt: Date.now() } }
        );

        await Allocation.findByIdAndDelete(id);

        res.status(200).json({ success: true, message: "Allocation deleted and slot freed" });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};