const express = require('express');
const router = express.Router();
const studentController = require('../controllers/student.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const { branchMiddleware } = require('../middleware/branch.middleware');

router.use(authMiddleware);
router.use(branchMiddleware);

router.get('/', studentController.getAllStudents);
router.get('/:id', studentController.getStudentById);
router.patch('/:id/management', studentController.updateStudentManagement);
router.put('/me', studentController.updateMe);
router.post('/', studentController.createStudent);
router.post('/enroll', studentController.enrollInBatch);

module.exports = router;
