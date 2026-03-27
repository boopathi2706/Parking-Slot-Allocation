const express = require('express');
const router = express.Router();
const slotController = require('../controllers/slotController');
const { protect } = require('../middleware/authMiddleware');

router.post('/init', protect, slotController.initializeSlots);
router.post('/add', protect, slotController.addSlots);
router.get('/free', protect, slotController.getFreeSlots);
router.get('/', protect, slotController.getSlots);
router.put('/:id/status', protect, slotController.updateSlotStatus);

module.exports = router;


