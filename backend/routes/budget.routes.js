const express = require('express');
const router = express.Router();
const budgetController = require('../controllers/budget.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const { branchMiddleware } = require('../middleware/branch.middleware');

router.use(authMiddleware);
router.use(branchMiddleware);

router.get('/', budgetController.getBudgets);
router.post('/', budgetController.createBudget);
router.get('/vs-actual', budgetController.getBudgetVsActual);

module.exports = router;
