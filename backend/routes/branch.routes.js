const express = require('express');
const router = express.Router();
const branchController = require('../controllers/branch.controller');
const { authMiddleware, roleMiddleware } = require('../middleware/auth.middleware');

router.get('/', authMiddleware, roleMiddleware(['super_admin']), branchController.getAllBranches);
router.post('/', authMiddleware, roleMiddleware(['super_admin']), branchController.createBranch);
router.patch('/:id/status', authMiddleware, roleMiddleware(['super_admin']), branchController.toggleBranchStatus);

module.exports = router;
