const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendance.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const { branchMiddleware } = require('../middleware/branch.middleware');

router.use(authMiddleware);
router.use(branchMiddleware);

router.post('/mark', attendanceController.markAttendance);
router.get('/batch', attendanceController.getBatchAttendance);
router.get('/student/me', attendanceController.getMyAttendance);
router.get('/student/:student_id', attendanceController.getStudentAttendance);

module.exports = router;
