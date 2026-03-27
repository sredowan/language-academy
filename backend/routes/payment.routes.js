const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

router.use(authMiddleware);

// Simulate payment and upgrade plan
router.post('/simulate', paymentController.simulatePayment);

module.exports = router;
