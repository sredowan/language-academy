const express = require('express');
const router = express.Router();
const hrm = require('../controllers/hrm.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const { branchMiddleware } = require('../middleware/branch.middleware');
const multer = require('multer');
const path = require('path');

// File upload for documents
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads')),
  filename: (req, file, cb) => cb(null, `doc_${Date.now()}_${file.originalname}`),
});
const upload = multer({ storage });

router.get('/test-attendance', (req, res, next) => { req.user = { role: 'admin', branch_id: 1 }; req.branchId = 1; next(); }, hrm.getStaffAttendance);
router.use(authMiddleware);
router.use(branchMiddleware);

// ─── Staff Attendance ────────────────────────────────────────
router.post('/attendance/mark', hrm.markStaffAttendance);
router.get('/attendance', hrm.getStaffAttendance);
router.get('/attendance/summary', hrm.getStaffAttendanceSummary);
router.get('/attendance/my', hrm.getMyStaffAttendance);

// ─── Leave Management ────────────────────────────────────────
router.get('/leave-types', hrm.getLeaveTypes);
router.post('/leave-types', hrm.createLeaveType);
router.get('/leaves', hrm.getLeaveRequests);
router.post('/leaves', hrm.createLeaveRequest);
router.patch('/leaves/:id/approve', hrm.approveLeave);
router.patch('/leaves/:id/reject', hrm.rejectLeave);
router.get('/leaves/my', hrm.getMyLeaves);
router.get('/leaves/balance', hrm.getLeaveBalance);

// ─── Recruitment ─────────────────────────────────────────────
router.get('/jobs', hrm.getJobPostings);
router.post('/jobs', hrm.createJobPosting);
router.patch('/jobs/:id', hrm.updateJobPosting);
router.delete('/jobs/:id', hrm.deleteJobPosting);
router.get('/applicants', hrm.getApplicants);
router.post('/applicants', hrm.createApplicant);
router.patch('/applicants/:id', hrm.updateApplicant);
router.post('/applicants/:id/hire', hrm.hireApplicant);

// ─── Documents ───────────────────────────────────────────────
router.get('/documents', hrm.getDocuments);
router.post('/documents', upload.single('file'), hrm.createDocument);
router.delete('/documents/:id', hrm.deleteDocument);
router.get('/documents/expiring', hrm.getExpiringDocuments);

// ─── Performance Reviews ────────────────────────────────────
router.get('/reviews', hrm.getReviews);
router.post('/reviews', hrm.createReview);
router.patch('/reviews/:id', hrm.updateReview);
router.get('/reviews/my', hrm.getMyReviews);

// ─── Shifts & Schedules ─────────────────────────────────────
router.get('/shifts', hrm.getShifts);
router.post('/shifts', hrm.createShift);
router.patch('/shifts/:id', hrm.updateShift);
router.get('/schedules', hrm.getSchedules);
router.post('/schedules', hrm.createSchedule);
router.delete('/schedules/:id', hrm.deleteSchedule);

// ─── Org Chart ───────────────────────────────────────────────
router.get('/org-chart', hrm.getOrgChart);

// ─── Dashboard ───────────────────────────────────────────────
router.get('/dashboard/stats', hrm.getDashboardStats);
router.get('/dashboard/birthdays', hrm.getBirthdays);
router.get('/dashboard/anniversaries', hrm.getAnniversaries);

module.exports = router;
