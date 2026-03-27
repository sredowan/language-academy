const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/schedule.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/', protect, scheduleController.getSchedule);

module.exports = router;
