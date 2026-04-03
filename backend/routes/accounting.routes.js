const express = require('express');
const router = express.Router();
const accountingController = require('../controllers/accounting.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const { branchMiddleware } = require('../middleware/branch.middleware');

router.use(authMiddleware);
router.use(branchMiddleware);

router.get('/accounts', accountingController.getAccounts);
router.post('/journal-entries', accountingController.createJournalEntry);
router.get('/journal', accountingController.getJournal);
router.get('/ledger-summary', accountingController.getLedgerSummary);
router.get('/ledger/:id', accountingController.getLedgerAccountDetails);
router.get('/audit-log', accountingController.getAuditLog);

module.exports = router;
