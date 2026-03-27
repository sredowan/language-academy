const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const { protect } = require('../middleware/auth.middleware');
const { branchScope } = require('../middleware/branch.middleware');

router.get('/', protect, notificationController.getNotifications);
router.put('/:id/read', protect, notificationController.markAsRead);
// Admin/System endpoint to create, requires branchScope usually or can be called internally
router.post('/', protect, branchScope, notificationController.createNotification);

module.exports = router;
