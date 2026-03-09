const express = require('express');
const router = express.Router();
const allocationController = require('../controllers/allocationController');
const { protect } = require('../middleware/authMiddleware');

router.post('/allocate', protect, allocationController.allocationRequest);
router.post('/verify-allocate', protect, allocationController.verifyAllocation);
router.post('/calculate-exit', protect, allocationController.calculateExit);
router.post('/complete-exit', protect, allocationController.verifyDeallocation);
router.get('/', protect, allocationController.getActiveAllocations);
router.delete('/:id', protect, allocationController.deleteActiveAllocation);

module.exports = router;
