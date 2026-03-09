const express = require('express');
const router = express.Router();
const historyController = require('../controllers/historyController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, historyController.getHistory);
router.delete('/:id', protect, historyController.deleteHistoryRecord);

module.exports = router;
