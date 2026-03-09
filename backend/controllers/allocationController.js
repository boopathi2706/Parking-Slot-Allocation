const Allocation = require('../models/Allocation');
const Slot = require('../models/Slot');
const History = require('../models/History');

// Request Allocation (Send OTP)
exports.allocationRequest = async (req, res) => {
    try {
        const { vehicleNumber, vehicleType, ownerName, ownerPhone, slotNumber } = req.body;
        console.log(`[ALLOCATION TYPE] Request: ${vehicleNumber} (${vehicleType}) in ${slotNumber}`);

        // 1. Check if vehicle already has an active allocation for this user
        const existingAllocation = await Allocation.findOne({ vehicleNumber, user: req.user.id });
        if (existingAllocation) {
            console.log(`[ALLOCATION] Vehicle ${vehicleNumber} already has an active allocation`);
            return res.status(400).json({ message: "Vehicle already has an active allocation" });
        }

        // 2. Check Slot Availability
        const slot = await Slot.findOne({ slotNumber, user: req.user.id });
        if (!slot) {
            console.log(`[ALLOCATION] Slot ${slotNumber} not found`);
            return res.status(404).json({ message: "Slot not found" });
        }
        if (slot.status !== 'Free') {
            console.log(`[ALLOCATION] Slot ${slotNumber} is ${slot.status}`);
            return res.status(400).json({ message: "Slot is not free" });
        }

        // 2. Generate OTP (Mock)
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        console.log(`[MOCK OTP] Allocation for ${vehicleNumber}: ${otp}`);

        // 3. Create Pending Allocation (or just return OTP for client to verify -> then create)
        // Better approach: Create unverified allocation ref
        const newAllocation = new Allocation({
            user: req.user.id,
            vehicleNumber, vehicleType, ownerName, ownerPhone, slotId: slot._id, otp
        });
        await newAllocation.save();
        console.log(`[ALLOCATION] Saved pending allocation: ${newAllocation._id}`);

        res.status(200).json({ success: true, message: "OTP sent to WhatsApp", allocationId: newAllocation._id, mockOtp: otp });

    } catch (error) {
        console.error(`[ALLOCATION] Error: ${error.message}`);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// Verify Allocation OTP
exports.verifyAllocation = async (req, res) => {
    try {
        const { allocationId, otp } = req.body;
        console.log(`[VERIFY ALLOCATION] ID: ${allocationId}, OTP: ${otp}`);

        const allocation = await Allocation.findOne({ _id: allocationId, user: req.user.id });

        if (!allocation) {
            console.log(`[VERIFY ALLOCATION] Allocation not found`);
            return res.status(404).json({ message: "Allocation request not found" });
        }
        if (allocation.otp !== otp) {
            console.log(`[VERIFY ALLOCATION] Invalid OTP for ${allocationId}`);
            return res.status(400).json({ message: "Invalid OTP" });
        }

        // Verify and Update Slot
        allocation.isVerified = true;
        // allocation.otp = undefined; // KEEP OTP FOR DEALLOCATION
        await allocation.save();

        await Slot.findByIdAndUpdate(allocation.slotId, { status: 'Occupied' });

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

        console.log(`[VERIFY ALLOCATION] Success for ${allocationId}. Slot Occupied. Dashboard Updated.`);

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

        // Find active allocation
        const allocation = await Allocation.findOne({ vehicleNumber, isVerified: true, user: req.user.id }).populate('slotId');
        if (!allocation) {
            console.log(`[CALC EXIT] Vehicle ${vehicleNumber} not found or not verified`);
            return res.status(404).json({ message: "Vehicle not found" });
        }

        const now = new Date();
        const entry = new Date(allocation.entryTime);
        const diffMs = now - entry;
        const diffHrs = Math.ceil(diffMs / (1000 * 60 * 60));

        // Pricing Logic
        const days = Math.ceil(diffHrs / 24) || 1;
        let rate = 0;
        if (allocation.vehicleType === '2W') rate = 20;
        else if (allocation.vehicleType === '4W') rate = 40;
        else if (allocation.vehicleType === 'Big') rate = 100;

        const amount = days * rate;

        // NO NEW OTP GENERATION - Use existing OTP

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
            mockOtp: allocation.otp // Return original OTP if needed for testing, or user must know it
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
        console.log(`[VERIFY EXIT] Request for ${vehicleNumber} with OTP ${otp}`);

        const allocation = await Allocation.findOne({ vehicleNumber, isVerified: true, user: req.user.id }).populate('slotId');
        if (!allocation) {
            console.log(`[VERIFY EXIT] Allocation not found for ${vehicleNumber}`);
            return res.status(404).json({ message: "Allocation not found" });
        }

        // CHECK AGAINST STORED OTP
        if (allocation.otp !== otp) {
            console.log(`[VERIFY EXIT] Invalid OTP. Expected: ${allocation.otp}, Got: ${otp}`);
            return res.status(400).json({ message: "Invalid OTP" });
        }

        // Create History Record
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
        console.log(`[VERIFY EXIT] History saved.`);

        // Free the Slot
        await Slot.findByIdAndUpdate(allocation.slotId._id, { status: 'Free' });

        // Delete Allocation
        await Allocation.findByIdAndDelete(allocation._id);

        // Update Dashboard Stats
        const Dashboard = require('../models/Dashboard');
        await Dashboard.findOneAndUpdate(
            { user: req.user.id },
            {
                $inc: {
                    filledSlots: -1,
                    freeSlots: 1,
                    todaysRevenue: amount,
                    totalProfit: amount
                },
                $set: { updatedAt: Date.now() }
            },
            { upsert: true }
        );

        console.log(`[VERIFY EXIT] Allocation deleted. Slot ${allocation.slotId.slotNumber} freed. Dashboard Updated.`);

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

        // Free the Slot
        await Slot.findByIdAndUpdate(allocation.slotId, { status: 'Free' });

        // Update Dashboard Stats
        const Dashboard = require('../models/Dashboard');
        await Dashboard.findOneAndUpdate(
            { user: req.user.id },
            { $inc: { filledSlots: -1, freeSlots: 1 }, $set: { updatedAt: Date.now() } }
        );

        // Delete Allocation
        await Allocation.findByIdAndDelete(id);

        res.status(200).json({ success: true, message: "Allocation deleted and slot freed" });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};