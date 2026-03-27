const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoice.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const { branchMiddleware } = require('../middleware/branch.middleware');

router.use(authMiddleware);
router.use(branchMiddleware);

router.get('/', invoiceController.getInvoices);
router.get('/stats', invoiceController.getInvoiceStats);
router.get('/aging', invoiceController.getAgingAnalysis);
router.post('/', invoiceController.createInvoice);
router.put('/:id', invoiceController.updateInvoice);

module.exports = router;
