const User = require('../models/User');
const StaffProfile = require('../models/StaffProfile');
const Payroll = require('../models/Payroll');
const Account = require('../models/Account');
const JournalEntry = require('../models/JournalEntry');
const JournalLine = require('../models/JournalLine');
const sequelize = require('../config/db.config');
const { Op } = require('sequelize');

exports.getStaff = async (req, res) => {
  try {
    const branchId = req.branchId;
    const staff = await User.findAll({
      where: { 
        branch_id: branchId,
        role: { [Op.not]: 'student' }
      },
      include: [{ model: StaffProfile }],
      attributes: ['id', 'name', 'email', 'role', 'status']
    });
    res.json(staff);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateStaffProfile = async (req, res) => {
  try {
    const { 
      user_id, designation, base_salary, bank_name, account_no,
      father_name, mother_name, address, contact_details, educational_background, work_experience, joining_date
    } = req.body;
    let profile = await StaffProfile.findOne({ where: { user_id } });

    if (profile) {
      await profile.update({ 
        designation, base_salary, bank_name, account_no,
        father_name, mother_name, address, contact_details, educational_background, work_experience, joining_date
      });
    } else {
      profile = await StaffProfile.create({
        user_id,
        branch_id: req.branchId,
        designation,
        base_salary,
        bank_name,
        account_no,
        father_name, mother_name, address, contact_details, educational_background, work_experience, joining_date
      });
    }
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPayrollHistory = async (req, res) => {
  try {
    const { month, year } = req.query;
    const where = { branch_id: req.branchId };
    if (month) where.month = month;
    if (year) where.year = year;

    const payrolls = await Payroll.findAll({
      where,
      include: [{ model: User, as: 'Staff', attributes: ['name'] }]
    });
    res.json(payrolls);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.generateDraftPayroll = async (req, res) => {
  try {
    const { month, year } = req.body;
    const branchId = req.branchId;

    // Check if payroll already exists for this branch/month/year
    const existing = await Payroll.findOne({ where: { branch_id: branchId, month, year } });
    if (existing) {
      return res.status(400).json({ error: 'Payroll for this month has already been generated.' });
    }

    // Get all staff with profiles in this branch
    const staffProfiles = await StaffProfile.findAll({ where: { branch_id: branchId } });
    
    if (staffProfiles.length === 0) {
      return res.status(400).json({ error: 'No staff profiles found for this branch. Please set up salaries first.' });
    }

    const payrollDrafts = staffProfiles.map(profile => ({
      staff_id: profile.user_id,
      branch_id: branchId,
      month,
      year,
      base_salary: profile.base_salary,
      net_salary: profile.base_salary, // Allowances/deductions initially 0
      status: 'draft'
    }));

    await Payroll.bulkCreate(payrollDrafts);
    res.status(201).json({ message: 'Draft payroll generated successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.processPayment = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { payment_method } = req.body; // 'cash' or 'bank'

    const payroll = await Payroll.findByPk(id, {
      include: [{ model: User, as: 'Staff' }]
    });

    if (!payroll || payroll.status === 'paid') {
      throw new Error('Invalid or already paid payroll record.');
    }

    // 1. Find Accounts
    const isUttara = req.branchId !== 1; // Simple logic from finance.controller
    const salaryExpCode = isUttara ? '5000-U' : '5000';
    const cashCode = isUttara ? '1000-U' : '1000';
    const bankCode = isUttara ? '1010-U' : '1010';

    const expenseAccount = await Account.findOne({ where: { code: salaryExpCode } });
    const creditAccount = await Account.findOne({ where: { code: payment_method === 'cash' ? cashCode : bankCode } });

    if (!expenseAccount || !creditAccount) {
      throw new Error('Required General Ledger accounts not found.');
    }

    // 2. Create Journal Entry
    const entry = await JournalEntry.create({
      branch_id: req.branchId,
      ref_no: `PAY-${payroll.year}${payroll.month}-${payroll.id}`,
      description: `Salary Payment: ${payroll.Staff.name} (${payroll.month}/${payroll.year})`,
      date: new Date(),
      posted_by: req.user.id
    }, { transaction: t });

    // 3. Create Journal Lines
    await JournalLine.bulkCreate([
      {
        journal_entry_id: entry.id,
        account_id: expenseAccount.id,
        debit: payroll.net_salary,
        credit: 0,
        notes: `Staff Salary - ${payroll.Staff.name}`
      },
      {
        journal_entry_id: entry.id,
        account_id: creditAccount.id,
        debit: 0,
        credit: payroll.net_salary,
        notes: `Paid via ${payment_method}`
      }
    ], { transaction: t });

    // 3.5 Create corresponding Expense log so it maps to the Liquidity Dashboard correctly
    const Expense = require('../models/Expense');
    await Expense.create({
      branch_id: req.branchId,
      account_id: creditAccount.id,
      amount: payroll.net_salary,
      description: `Staff Salary: ${payroll.Staff.name} (${payroll.month}/${payroll.year})`,
      category: 'Payroll & Salaries',
      payment_method: payment_method,
      date: new Date(),
      status: 'approved',
      verified_by: req.user.id,
      approved_by: req.user.id,
      verification_date: new Date()
    }, { transaction: t });

    // 4. Update Payroll Record
    await payroll.update({
      status: 'paid',
      journal_entry_id: entry.id
    }, { transaction: t });

    await t.commit();
    res.json({ message: 'Salary processed and posted to accounting.' });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ error: error.message });
  }
};
