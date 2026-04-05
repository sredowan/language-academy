/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  Language Academy — Monolith Production Server              ║
 * ║                                                             ║
 * ║  Combines:                                                  ║
 * ║    • Express backend API (/api/*)                           ║
 * ║    • Static admin portal  (/admin/*)                        ║
 * ║    • Static student portal (/student/*)                     ║
 * ║    • Next.js website      (/* catch-all)                    ║
 * ║    • Upload file serving  (/uploads/*)                      ║
 * ║                                                             ║
 * ║  Single process · Single port · Hostinger-ready             ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const next = require('next');

// ─── Load backend .env ──────────────────────────────────────────────────────
require('dotenv').config({ path: path.join(__dirname, 'backend', '.env') });
process.env.TZ = 'Asia/Dhaka';

const PORT = process.env.PORT || 3000;
const isDev = process.env.NODE_ENV !== 'production';

// ─── Next.js app (website) ──────────────────────────────────────────────────
const nextApp = next({
  dev: false,          // Always run in production mode
  dir: path.join(__dirname, 'website'),
  conf: {
    // Tell Next.js it's served from root /
    skipTrailingSlashRedirect: true,
  },
});
const nextHandle = nextApp.getRequestHandler();

// ─── Boot ───────────────────────────────────────────────────────────────────
async function start() {
  // 1. Prepare Next.js
  await nextApp.prepare();

  const app = express();

  // ─── Global Middleware ──────────────────────────────────────────────────
  app.use(cors());
  app.use(express.json());

  // ─── Backend API Routes ─────────────────────────────────────────────────
  // Mount all backend routes exactly as backend/server.js does
  app.use('/api/auth', require('./backend/routes/auth.routes'));
  app.use('/api/crm', require('./backend/routes/crm.routes'));
  app.use('/api/lms', require('./backend/routes/lms.routes'));
  app.use('/api/branches', require('./backend/routes/branch.routes'));
  app.use('/api/accounting', require('./backend/routes/accounting.routes'));
  app.use('/api/reconciliation', require('./backend/routes/reconciliation.routes'));
  app.use('/api/pte', require('./backend/routes/pte.routes'));
  app.use('/api/students', require('./backend/routes/student.routes'));
  app.use('/api/attendance', require('./backend/routes/attendance.routes'));
  app.use('/api/enrollments', require('./backend/routes/enrollment.routes'));
  app.use('/api/pos', require('./backend/routes/pos.routes'));
  app.use('/api/finance', require('./backend/routes/finance.routes'));
  app.use('/api/erp', require('./backend/routes/erp.routes'));
  app.use('/api/schedule', require('./backend/routes/schedule.routes'));
  app.use('/api/notifications', require('./backend/routes/notification.routes'));
  app.use('/api/dashboard', require('./backend/routes/dashboard.routes'));
  app.use('/api/payroll', require('./backend/routes/payroll.routes'));
  app.use('/api/materials', require('./backend/routes/material.routes'));
  app.use('/api/assets', require('./backend/routes/asset.routes'));
  app.use('/api/reports', require('./backend/routes/report.routes'));
  app.use('/api/automation', require('./backend/routes/automation.routes'));
  app.use('/api/invoices', require('./backend/routes/invoice.routes'));
  app.use('/api/expenses', require('./backend/routes/expense.routes'));
  app.use('/api/budget', require('./backend/routes/budget.routes'));
  app.use('/api/public', require('./backend/routes/public.routes'));
  app.use('/api/payment', require('./backend/routes/payment.routes'));
  app.use('/api/website', require('./backend/routes/website.routes'));
  app.use('/api/hrm', require('./backend/routes/hrm.routes'));
  app.use('/api/rbac', require('./backend/routes/rbac.routes'));
  app.use('/api/settings', require('./backend/routes/settings.routes'));

  // ─── Upload Files (backend-served) ──────────────────────────────────────
  app.use('/uploads', express.static(path.join(__dirname, 'backend', 'uploads')));

  // ─── Admin Portal (pre-built Vite SPA) ──────────────────────────────────
  const adminDist = path.join(__dirname, 'admin-portal', 'dist');
  app.use('/admin', express.static(adminDist));
  // SPA fallback: any /admin/* route serves index.html
  app.get('/admin/*', (req, res) => {
    res.sendFile(path.join(adminDist, 'index.html'));
  });

  // ─── Student Portal (pre-built Vite SPA) ────────────────────────────────
  const studentDist = path.join(__dirname, 'student-portal', 'dist');
  app.use('/student', express.static(studentDist));
  // SPA fallback: any /student/* route serves index.html
  app.get('/student/*', (req, res) => {
    res.sendFile(path.join(studentDist, 'index.html'));
  });

  // ─── Next.js Website (catch-all) ────────────────────────────────────────
  app.all('*', (req, res) => {
    return nextHandle(req, res);
  });

  // ─── Database Init (mirrors backend/server.js) ──────────────────────────
  const sequelize = require('./backend/config/db.config');

  // Models & Associations  
  const ExpenseCategory = require('./backend/models/ExpenseCategory');
  const Expense = require('./backend/models/Expense');
  const Contact = require('./backend/models/Contact');
  const Opportunity = require('./backend/models/Opportunity');
  const Activity = require('./backend/models/Activity');
  const CampaignTemplate = require('./backend/models/CampaignTemplate');
  const Lead = require('./backend/models/Lead');
  const Student = require('./backend/models/Student');
  const PteTask = require('./backend/models/PteTask');
  const Course = require('./backend/models/Course');
  const Batch = require('./backend/models/Batch');
  const ReconciliationSession = require('./backend/models/ReconciliationSession');
  const ReconciliationLine = require('./backend/models/ReconciliationLine');
  const ReconciliationMatch = require('./backend/models/ReconciliationMatch');
  const ReconciliationEvent = require('./backend/models/ReconciliationEvent');
  const LiquidityMovement = require('./backend/models/LiquidityMovement');
  const Transaction = require('./backend/models/Transaction');
  const JournalEntry = require('./backend/models/JournalEntry');
  const JournalLine = require('./backend/models/JournalLine');
  const Account = require('./backend/models/Account');
  const BankAccount = require('./backend/models/BankAccount');
  const BankAccountLedgerMap = require('./backend/models/BankAccountLedgerMap');
  const Invoice = require('./backend/models/Invoice');
  const Enrollment = require('./backend/models/Enrollment');
  const User = require('./backend/models/User');
  const StaffAttendance = require('./backend/models/StaffAttendance');
  const LeaveType = require('./backend/models/LeaveType');
  const LeaveRequest = require('./backend/models/LeaveRequest');
  const LeaveBalance = require('./backend/models/LeaveBalance');
  const JobPosting = require('./backend/models/JobPosting');
  const Applicant = require('./backend/models/Applicant');
  const StaffDocument = require('./backend/models/StaffDocument');
  const PerformanceReview = require('./backend/models/PerformanceReview');
  const Shift = require('./backend/models/Shift');
  const StaffSchedule = require('./backend/models/StaffSchedule');
  const StaffProfile = require('./backend/models/StaffProfile');
  const RbacConfig = require('./backend/models/RbacConfig');
  const SystemSetting = require('./backend/models/SystemSetting');
  const IncomeCategory = require('./backend/models/IncomeCategory');
  const Customer = require('./backend/models/Customer');

  // Associations
  Course.hasMany(Batch, { foreignKey: 'course_id' });
  ReconciliationSession.hasMany(ReconciliationLine, { foreignKey: 'session_id' });
  ReconciliationSession.hasMany(ReconciliationEvent, { foreignKey: 'session_id' });
  ReconciliationLine.belongsTo(ReconciliationSession, { foreignKey: 'session_id' });
  ReconciliationLine.belongsTo(BankAccount, { foreignKey: 'bank_account_id' });
  ReconciliationLine.belongsTo(Account, { foreignKey: 'account_id' });
  ReconciliationEvent.belongsTo(ReconciliationSession, { foreignKey: 'session_id' });
  Student.belongsTo(User, { foreignKey: 'user_id' });
  User.hasOne(Student, { foreignKey: 'user_id' });
  Enrollment.belongsTo(Student, { foreignKey: 'student_id' });
  Enrollment.belongsTo(Batch, { foreignKey: 'batch_id' });
  Transaction.belongsTo(Enrollment, { foreignKey: 'enrollment_id' });
  Invoice.belongsTo(Student, { foreignKey: 'student_id' });
  Invoice.belongsTo(Enrollment, { foreignKey: 'enrollment_id' });
  JournalEntry.hasMany(JournalLine, { foreignKey: 'journal_entry_id' });
  JournalLine.belongsTo(JournalEntry, { foreignKey: 'journal_entry_id' });
  JournalLine.belongsTo(Account, { foreignKey: 'account_id' });

  const models = [
    User, ExpenseCategory, Expense, Lead, Contact, Opportunity, Activity,
    CampaignTemplate, Student, PteTask, Course, Batch, Account, BankAccount,
    BankAccountLedgerMap, Invoice, Enrollment, Transaction, JournalEntry,
    JournalLine, ReconciliationSession, ReconciliationLine,
    ReconciliationMatch, ReconciliationEvent, LiquidityMovement,
    StaffAttendance, LeaveType, LeaveRequest, LeaveBalance,
    JobPosting, Applicant, StaffDocument, PerformanceReview,
    Shift, StaffSchedule, StaffProfile, RbacConfig, SystemSetting,
    IncomeCategory, Customer,
  ];

  try {
    await sequelize.authenticate();
    console.log('✓ Database connected');

    await Promise.allSettled(
      models.map(m => m.sync({ alter: true }).catch(err => {
        console.warn(`  ⚠ Sync warning for ${m.name}: ${err.message.substring(0, 80)}`);
      }))
    );

    // Initialize settings defaults
    const settingsController = require('./backend/controllers/settings.controller');
    await settingsController.initializeDefaults().catch(err =>
      console.error('Error initializing settings:', err)
    );
  } catch (err) {
    console.error('Database connection error:', err);
    process.exit(1);
  }

  // ─── Start Server ────────────────────────────────────────────────────────
  app.listen(PORT, () => {
    console.log(`\n  ╔══════════════════════════════════════════════╗`);
    console.log(`  ║  Language Academy · Production · :${PORT}        ║`);
    console.log(`  ╠══════════════════════════════════════════════╣`);
    console.log(`  ║  Website    → http://localhost:${PORT}           ║`);
    console.log(`  ║  Admin      → http://localhost:${PORT}/admin     ║`);
    console.log(`  ║  Student    → http://localhost:${PORT}/student   ║`);
    console.log(`  ║  API        → http://localhost:${PORT}/api       ║`);
    console.log(`  ╚══════════════════════════════════════════════╝\n`);
  });
}

start().catch(err => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});
