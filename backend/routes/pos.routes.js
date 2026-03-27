const express = require('express');
const router = express.Router();
const posController = require('../controllers/pos.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const { branchMiddleware } = require('../middleware/branch.middleware');

router.use(authMiddleware);
router.use(branchMiddleware);

router.get('/transactions', posController.getTransactions);
router.get('/pending', posController.getPendingInvoices);
router.post('/collect-fee', posController.collectFee);

module.exports = router;
