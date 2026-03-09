const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.put('/vehicle-config', protect, userController.updateVehicleConfig);

module.exports = router;
