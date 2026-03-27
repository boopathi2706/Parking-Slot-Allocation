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

// Add Extra Slots (without deleting existing ones)
exports.addSlots = async (req, res) => {
    try {
        let { twoWheeler, fourWheeler, bigVehicle } = req.body;

        twoWheeler = parseInt(twoWheeler) || 0;
        fourWheeler = parseInt(fourWheeler) || 0;
        bigVehicle = parseInt(bigVehicle) || 0;

        console.log(`[ADD SLOTS] Adding: 2W=${twoWheeler}, 4W=${fourWheeler}, Big=${bigVehicle}`);

        // Get existing slots to determine current max slot numbers per type
        const existingSlots = await Slot.find({ user: req.user.id });

        const getMaxCount = (type) => {
            const typeSlots = existingSlots.filter(s => s.type === type);
            if (typeSlots.length === 0) return 0;
            const nums = typeSlots.map(s => {
                const parts = s.slotNumber.split('-');
                return parseInt(parts[parts.length - 1]) || 0;
            });
            return Math.max(...nums);
        };

        const newSlots = [];

        const appendSlotBatch = (type, qty, startFrom) => {
            let count = startFrom + 1;
            for (let i = 0; i < qty; i++) {
                newSlots.push({
                    user: req.user.id,
                    slotNumber: `${type}-${count++}`,
                    type: type,
                    status: 'Free'
                });
            }
        };

        appendSlotBatch('2W', twoWheeler, getMaxCount('2W'));
        appendSlotBatch('4W', fourWheeler, getMaxCount('4W'));
        appendSlotBatch('Big', bigVehicle, getMaxCount('Big'));

        if (newSlots.length === 0) {
            return res.status(400).json({ message: "No slots to add. Please enter at least 1." });
        }

        await Slot.insertMany(newSlots);
        console.log(`[ADD SLOTS] Added ${newSlots.length} new slots for user: ${req.user.id}`);

        // Update Dashboard total slots count
        const Dashboard = require('../models/Dashboard');
        await Dashboard.findOneAndUpdate(
            { user: req.user.id },
            { $inc: { totalSlots: newSlots.length, freeSlots: newSlots.length }, $set: { updatedAt: Date.now() } }
        );

        res.status(201).json({ success: true, message: `${newSlots.length} slots added successfully`, count: newSlots.length });
    } catch (error) {
        console.error(`[ADD SLOTS] Error: ${error.message}`);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// Get All Slots (correctly sorted numerically)
exports.getSlots = async (req, res) => {
    try {
        const slots = await Slot.find({ user: req.user.id });
        // Sort by type prefix then numeric slot number (e.g. 2W-1, 2W-2, ... 2W-10)
        slots.sort((a, b) => {
            if (a.type !== b.type) return a.type.localeCompare(b.type);
            const numA = parseInt(a.slotNumber.split('-').pop()) || 0;
            const numB = parseInt(b.slotNumber.split('-').pop()) || 0;
            return numA - numB;
        });
        res.status(200).json(slots);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// Get Free Slots by Type (for dropdown in Slot Allocation form)
exports.getFreeSlots = async (req, res) => {
    try {
        const { type } = req.query;
        const query = { user: req.user.id, status: 'Free' };
        if (type) query.type = type;
        const slots = await Slot.find(query);
        // Sort numerically
        slots.sort((a, b) => {
            const numA = parseInt(a.slotNumber.split('-').pop()) || 0;
            const numB = parseInt(b.slotNumber.split('-').pop()) || 0;
            return numA - numB;
        });
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


