const express = require('express');
const cors = require('cors');
require('dotenv').config();
const sequelize = require('./config/db.config');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/crm', require('./routes/crm.routes'));
app.use('/api/lms', require('./routes/lms.routes'));
app.use('/api/branches', require('./routes/branch.routes'));
app.use('/api/accounting', require('./routes/accounting.routes'));
app.use('/api/reconciliation', require('./routes/reconciliation.routes'));
app.use('/api/pte', require('./routes/pte.routes'));
app.use('/api/students', require('./routes/student.routes'));
app.use('/api/attendance', require('./routes/attendance.routes'));
app.use('/api/enrollments', require('./routes/enrollment.routes'));
app.use('/api/pos', require('./routes/pos.routes'));
app.use('/api/finance', require('./routes/finance.routes'));
app.use('/api/erp', require('./routes/erp.routes'));
app.use('/api/schedule', require('./routes/schedule.routes'));
app.use('/api/notifications', require('./routes/notification.routes'));
app.use('/api/dashboard', require('./routes/dashboard.routes'));
app.use('/api/payroll', require('./routes/payroll.routes'));
app.use('/api/materials', require('./routes/material.routes'));
app.use('/api/assets', require('./routes/asset.routes'));
app.use('/api/reports', require('./routes/report.routes'));
app.use('/api/automation', require('./routes/automation.routes'));

// New Finance Routes
app.use('/api/invoices', require('./routes/invoice.routes'));
app.use('/api/expenses', require('./routes/expense.routes'));
app.use('/api/budget', require('./routes/budget.routes'));

// Website Public & Payment Routes
app.use('/api/public', require('./routes/public.routes'));
app.use('/api/payment', require('./routes/payment.routes'));
app.use('/api/website', require('./routes/website.routes'));

// Default Route
app.get('/', (req, res) => {
  res.json({ message: 'Language Academy API is running' });
});

// Ensure critical tables exist
const ExpenseCategory = require('./models/ExpenseCategory');
const Expense = require('./models/Expense');
const Contact = require('./models/Contact');
const Opportunity = require('./models/Opportunity');
const Activity = require('./models/Activity');
const CampaignTemplate = require('./models/CampaignTemplate');
const Lead = require('./models/Lead');
const Student = require('./models/Student');
const PteTask = require('./models/PteTask');
const Course = require('./models/Course');
const Batch = require('./models/Batch');

// Set up Course↔Batch association (avoiding circular dependency in model files)
Course.hasMany(Batch, { foreignKey: 'course_id' });

// Sync Database
const PORT = process.env.PORT || 5000;

// Import reconciliation models for sync
const ReconciliationSession = require('./models/ReconciliationSession');
const ReconciliationLine = require('./models/ReconciliationLine');
const ReconciliationMatch = require('./models/ReconciliationMatch');
const ReconciliationEvent = require('./models/ReconciliationEvent');

// Import accounting & pos models for sync
const Transaction = require('./models/Transaction');
const JournalEntry = require('./models/JournalEntry');
const JournalLine = require('./models/JournalLine');
const Account = require('./models/Account');
const BankAccount = require('./models/BankAccount');
const BankAccountLedgerMap = require('./models/BankAccountLedgerMap');
const Invoice = require('./models/Invoice');
const Enrollment = require('./models/Enrollment');
const User = require('./models/User');

// ─── MODEL ASSOCIATIONS (Centralized to avoid circularity) ──────────────────
ReconciliationSession.hasMany(ReconciliationLine, { foreignKey: 'session_id' });
ReconciliationSession.hasMany(ReconciliationEvent, { foreignKey: 'session_id' });

ReconciliationLine.belongsTo(ReconciliationSession, { foreignKey: 'session_id' });
ReconciliationLine.belongsTo(BankAccount, { foreignKey: 'bank_account_id' });
ReconciliationLine.belongsTo(Account, { foreignKey: 'account_id' });

ReconciliationEvent.belongsTo(ReconciliationSession, { foreignKey: 'session_id' });

// Accounting & CRM
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
// ─── END ASSOCIATIONS ───────────────────────────────────────────────────────

sequelize.authenticate()
  .then(() => {
    console.log('Database connected...');
    // Sync only specific tables that may be missing
    return Promise.all([
      User.sync({ alter: true }), // Critical to sync first
      ExpenseCategory.sync({ alter: true }),
      Expense.sync({ alter: true }),
      Lead.sync({ alter: true }),
      Contact.sync({ alter: true }),
      Opportunity.sync({ alter: true }),
      Activity.sync({ alter: true }),
      CampaignTemplate.sync({ alter: true }),
      Student.sync({ alter: true }),
      PteTask.sync({ alter: true }),
      Course.sync({ alter: true }),
      Batch.sync({ alter: true }),
      Account.sync({ alter: true }),
      BankAccount.sync({ alter: true }),
      BankAccountLedgerMap.sync({ alter: true }),
      Invoice.sync({ alter: true }),
      Enrollment.sync({ alter: true }),
      Transaction.sync({ alter: true }),
      JournalEntry.sync({ alter: true }),
      JournalLine.sync({ alter: true }),
      ReconciliationSession.sync({ alter: true }),
      ReconciliationLine.sync({ alter: true }),
      ReconciliationMatch.sync({ alter: true }),
      ReconciliationEvent.sync({ alter: true }),
    ]);
  })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Database connection error:', err);
  });
