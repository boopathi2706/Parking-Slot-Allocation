const Slot = require('../models/Slot');

// Initialize Slots
exports.initializeSlots = async (req, res) => {
    try {
        let { twoWheeler, fourWheeler, bigVehicle } = req.body;

        // Ensure inputs are numbers
        twoWheeler = parseInt(twoWheeler) || 0;
        fourWheeler = parseInt(fourWheeler) || 0;
        bigVehicle = parseInt(bigVehicle) || 0;

        console.log(`[INIT SLOTS] Request: 2W=${twoWheeler}, 4W=${fourWheeler}, Big=${bigVehicle}`);

        // Clear existing slots
        await Slot.deleteMany({ user: req.user.id });
        console.log(`[INIT SLOTS] Cleared existing slots for user: ${req.user.id}`);

        const slots = [];
        let count_2w = 1;
        let count_4w = 1;
        let count_big = 1;

        // Helper to create slot objects
        const createSlotBatch = (type, qty) => {
            let count = 1;
            for (let i = 0; i < qty; i++) {
                slots.push({
                    user: req.user.id,
                    slotNumber: `${type}-${count++}`,
                    type: type,
                    status: 'Free'
                });
            }
        };

        createSlotBatch('2W', twoWheeler);
        createSlotBatch('4W', fourWheeler);
        createSlotBatch('Big', bigVehicle);

        await Slot.insertMany(slots);
        console.log(`[INIT SLOTS] Created ${slots.length} total slots for user: ${req.user.id}`);

        res.status(201).json({ success: true, message: "Slots initialized successfully", count: slots.length });
    } catch (error) {
        console.error(`[INIT SLOTS] Error: ${error.message}`);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// Get All Slots
exports.getSlots = async (req, res) => {
    try {
        const slots = await Slot.find({ user: req.user.id }).sort({ slotNumber: 1 });
        res.status(200).json(slots);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// Update Slot Status (Repair / Prebooked / Free)
exports.updateSlotStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'Repair' or 'Prebooked' or 'Free'

        // 1. Get current slot state
        const oldSlot = await Slot.findOne({ _id: id, user: req.user.id });
        if (!oldSlot) return res.status(404).json({ message: "Slot not found" });

        if (oldSlot.status === status) {
            return res.status(200).json({ success: true, message: "Status already set", slot: oldSlot });
        }

        const oldStatus = oldSlot.status;

        // 2. Update Slot
        const slot = await Slot.findOneAndUpdate({ _id: id, user: req.user.id }, { status }, { returnDocument: 'after' });

        // 3. Update Dashboard Stats
        const Dashboard = require('../models/Dashboard');
        let freeSlotsInc = 0;

        // Logic: 
        // If it was Free and now it's NOT (Repair/Prebooked), freeSlots decreases
        if (oldStatus === 'Free' && status !== 'Free') {
            freeSlotsInc = -1;
        }
        // If it WASN'T Free and now it IS Free, freeSlots increases
        else if (oldStatus !== 'Free' && status === 'Free') {
            freeSlotsInc = 1;
        }

        if (freeSlotsInc !== 0) {
            await Dashboard.findOneAndUpdate(
                { user: req.user.id },
                { $inc: { freeSlots: freeSlotsInc }, $set: { updatedAt: Date.now() } }
            );
        }

        res.status(200).json({ success: true, message: "Slot status updated", slot });
    } catch (error) {
        console.error(`[UPDATE SLOT STATUS] Error: ${error.message}`);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};
