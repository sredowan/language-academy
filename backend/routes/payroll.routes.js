const express = require('express');
const router = express.Router();
const payrollController = require('../controllers/payroll.controller');
const { branchMiddleware } = require('../middleware/branch.middleware');
const { authMiddleware } = require('../middleware/auth.middleware');

router.use(authMiddleware);
router.use(branchMiddleware);

router.get('/staff', payrollController.getStaff);
router.post('/profiles', payrollController.updateStaffProfile);
router.get('/history', payrollController.getPayrollHistory);
router.post('/generate', payrollController.generateDraftPayroll);
router.post('/pay/:id', payrollController.processPayment);

module.exports = router;
