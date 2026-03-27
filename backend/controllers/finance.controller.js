const JournalEntry = require('../models/JournalEntry');
const JournalLine = require('../models/JournalLine');
const Account = require('../models/Account');
const Transaction = require('../models/Transaction');
const Invoice = require('../models/Invoice');
const Expense = require('../models/Expense');
const Enrollment = require('../models/Enrollment');
const Student = require('../models/Student');
const User = require('../models/User');
const sequelize = require('../config/db.config');
const { Op, fn, col, literal } = require('sequelize');

// ── Existing: Record Expense (journal entry based) ──
exports.recordExpense = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { account_id, amount, payment_method, notes, date } = req.body;
    const expenseAccount = await Account.findByPk(account_id);
    if (!expenseAccount || expenseAccount.type !== 'expense') throw new Error('Invalid expense account');

    const cashCode = '1000';
    const bankCode = '1010';
    const creditAccount = await Account.findOne({ where: { code: payment_method === 'cash' ? cashCode : bankCode, branch_id: req.branchId } });
    if (!creditAccount) throw new Error('Payment account not found');

    const entry = await JournalEntry.create({
      branch_id: req.branchId,
      ref_no: `EXP-${Date.now()}`,
      description: notes || `Expense: ${expenseAccount.name}`,
      date: date || new Date(),
      posted_by: req.user.id
    }, { transaction: t });

    await JournalLine.bulkCreate([
      { journal_entry_id: entry.id, account_id: expenseAccount.id, debit: amount, credit: 0, notes },
      { journal_entry_id: entry.id, account_id: creditAccount.id, debit: 0, credit: amount, notes: `Paid via ${payment_method}` }
    ], { transaction: t });

    await Expense.create({
      branch_id: req.branchId, account_id, amount, description: notes, category: expenseAccount.name,
      payment_method, date: date || new Date(), approved_by: req.user.id, status: 'approved'
    }, { transaction: t });

    await t.commit();
    res.status(201).json(entry);
  } catch (error) {
    await t.rollback();
    res.status(500).json({ error: error.message });
  }
};

// ── Finance Stats (basic) ──
exports.getFinanceStats = async (req, res) => {
  try {
    const revenue = await JournalLine.sum('credit', { include: [{ model: Account, where: { type: 'revenue' } }] });
    const expenses = await JournalLine.sum('debit', { include: [{ model: Account, where: { type: 'expense' } }] });
    res.json({ totalRevenue: revenue || 0, totalExpenses: expenses || 0, netProfit: (revenue || 0) - (expenses || 0) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ── NEW: Accounts Overview Dashboard ──
exports.getOverview = async (req, res) => {
  try {
    const revenue = await JournalLine.sum('credit', { include: [{ model: Account, where: { type: 'revenue' } }] }) || 0;
    const expenses = await JournalLine.sum('debit', { include: [{ model: Account, where: { type: 'expense' } }] }) || 0;
    const receivables = await Invoice.sum('amount', { where: { status: { [Op.in]: ['pending', 'overdue', 'partial'] } } }) || 0;
    const receivablesPaid = await Invoice.sum('paid', { where: { status: { [Op.in]: ['pending', 'overdue', 'partial'] } } }) || 0;
    const totalInvoices = await Invoice.count();
    const unpaidInvoices = await Invoice.count({ where: { status: { [Op.in]: ['pending', 'overdue'] } } });
    const feeCollected = await Transaction.sum('amount', { where: { status: 'success' } }) || 0;
    const salaryExpense = await Expense.sum('amount', { where: { category: { [Op.like]: '%Salary%' } } }) || 0;
    const scholarshipGiven = await Expense.sum('amount', { where: { category: { [Op.like]: '%Scholarship%' } } }) || 0;

    res.json({
      revenue, expenses, netProfit: revenue - expenses,
      receivablesDue: receivables - receivablesPaid,
      overdueReceivables: await Invoice.sum('amount', { where: { status: 'overdue' } }) || 0,
      totalInvoices, unpaidInvoices, feeCollected, salaryExpense, scholarshipGiven
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ── NEW: Profit & Loss ──
exports.getProfitLoss = async (req, res) => {
  try {
    const { from, to } = req.query;
    const dateFilter = {};
    if (from) dateFilter[Op.gte] = from;
    if (to) dateFilter[Op.lte] = to;
    const entryWhere = Object.keys(dateFilter).length ? { date: dateFilter } : {};

    const revenueAccounts = await Account.findAll({ where: { type: 'revenue' }, attributes: ['id', 'name', 'code'] });
    const expenseAccounts = await Account.findAll({ where: { type: 'expense' }, attributes: ['id', 'name', 'code'] });

    const getTotal = async (accountIds, field) => {
      if (!accountIds.length) return 0;
      const result = await JournalLine.sum(field, {
        where: { account_id: { [Op.in]: accountIds } },
        include: [{ model: JournalEntry, where: entryWhere, attributes: [] }]
      });
      return result || 0;
    };

    const revenueIds = revenueAccounts.map(a => a.id);
    const expenseIds = expenseAccounts.map(a => a.id);

    const totalRevenue = await getTotal(revenueIds, 'credit');
    const totalExpenses = await getTotal(expenseIds, 'debit');

    // Per-account breakdown
    const revenueBreakdown = [];
    for (const acc of revenueAccounts) {
      const total = await getTotal([acc.id], 'credit');
      if (total > 0) revenueBreakdown.push({ name: acc.name, code: acc.code, amount: total });
    }
    const expenseBreakdown = [];
    for (const acc of expenseAccounts) {
      const total = await getTotal([acc.id], 'debit');
      if (total > 0) expenseBreakdown.push({ name: acc.name, code: acc.code, amount: total });
    }

    res.json({ totalRevenue, totalExpenses, netProfit: totalRevenue - totalExpenses, revenueBreakdown, expenseBreakdown });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ── NEW: Trial Balance ──
exports.getTrialBalance = async (req, res) => {
  try {
    const accounts = await Account.findAll({ where: { is_active: true }, order: [['code', 'ASC']] });
    const summary = [];
    let totalDebits = 0, totalCredits = 0;

    for (const acc of accounts) {
      const debitTotal = await JournalLine.sum('debit', { where: { account_id: acc.id } }) || 0;
      const creditTotal = await JournalLine.sum('credit', { where: { account_id: acc.id } }) || 0;
      const balance = debitTotal - creditTotal;
      if (debitTotal || creditTotal) {
        summary.push({ id: acc.id, name: acc.name, code: acc.code, type: acc.type, debitTotal, creditTotal, balance });
        totalDebits += debitTotal;
        totalCredits += creditTotal;
      }
    }

    res.json({ accounts: summary, totalDebits, totalCredits, difference: totalDebits - totalCredits, isBalanced: Math.abs(totalDebits - totalCredits) < 0.01 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ── NEW: Cash Flow ──
exports.getCashFlow = async (req, res) => {
  try {
    // Get cash/bank account IDs
    const cashAccounts = await Account.findAll({ where: { type: 'asset', name: { [Op.like]: '%Cash%' } } });
    const cashIds = cashAccounts.map(a => a.id);

    if (!cashIds.length) return res.json({ inflows: 0, outflows: 0, net: 0, monthly: [] });

    const inflows = await JournalLine.sum('debit', { where: { account_id: { [Op.in]: cashIds } } }) || 0;
    const outflows = await JournalLine.sum('credit', { where: { account_id: { [Op.in]: cashIds } } }) || 0;

    res.json({ inflows, outflows, net: inflows - outflows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ── NEW: Income vs Expense ──
exports.getIncomeExpense = async (req, res) => {
  try {
    const revenue = await JournalLine.sum('credit', { include: [{ model: Account, where: { type: 'revenue' } }] }) || 0;
    const expenses = await JournalLine.sum('debit', { include: [{ model: Account, where: { type: 'expense' } }] }) || 0;

    // Expense split by category
    const expenseSplit = await Expense.findAll({
      attributes: ['category', [fn('SUM', col('amount')), 'total']],
      group: ['category'],
      order: [[literal('total'), 'DESC']]
    });

    res.json({ totalIncome: revenue, totalExpense: expenses, surplus: revenue - expenses, expenseSplit });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ── NEW: Student-wise Income ──
exports.getStudentIncome = async (req, res) => {
  try {
    const students = await Transaction.findAll({
      attributes: ['enrollment_id', [fn('SUM', col('amount')), 'total_paid'], [fn('COUNT', col('Transaction.id')), 'payment_count']],
      where: { status: 'success' },
      include: [{ model: Enrollment, include: [{ model: Student, include: [{ model: User, attributes: ['name'] }] }] }],
      group: ['enrollment_id'],
      order: [[literal('total_paid'), 'DESC']]
    });
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ── NEW: Liquid Accounts (Bank, Cash, MFS) ──
exports.getLiquidAccounts = async (req, res) => {
  try {
    const targetBranch = req.branchId || 1;
    // Liquid accounts are 'asset' type, typically code starting with '10'
    const accounts = await Account.findAll({
      where: {
        branch_id: targetBranch,
        type: 'asset',
        code: { [Op.like]: '10%' }
      },
      order: [['code', 'ASC']]
    });

    const detailedAccounts = [];
    for (const acc of accounts) {
      const debitTotal = await JournalLine.sum('debit', { where: { account_id: acc.id } }) || 0;
      const creditTotal = await JournalLine.sum('credit', { where: { account_id: acc.id } }) || 0;
      
      detailedAccounts.push({
        id: acc.id,
        code: acc.code,
        name: acc.name,
        sub_type: acc.sub_type || 'cash',
        balance: debitTotal - creditTotal
      });
    }

    res.json(detailedAccounts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createLiquidAccount = async (req, res) => {
  try {
    const { name, sub_type } = req.body;
    const targetBranch = req.branchId || 1;
    
    // Find highest existing code starting with '10'
    const existingAccounts = await Account.findAll({
      where: { type: 'asset', code: { [Op.like]: '10%' }, branch_id: targetBranch },
      attributes: ['code']
    });
    
    let maxCode = 1000;
    existingAccounts.forEach(acc => {
      const codeInt = parseInt(acc.code.split('-')[0]); // handle '1000-U'
      if (!isNaN(codeInt) && codeInt > maxCode && codeInt < 1100) {
        maxCode = codeInt;
      }
    });
    
    const newCodePrefix = (maxCode + 1).toString();
    const newCode = targetBranch === 1 ? newCodePrefix : `${newCodePrefix}-U`;

    const newAccount = await Account.create({
      branch_id: targetBranch,
      code: newCode,
      name,
      type: 'asset',
      sub_type: sub_type || 'bank',
      is_active: true
    });

    res.status(201).json(newAccount);
  } catch (error) {
    console.error('Account Creation Error:', error);
    res.status(500).json({ error: error.message });
  }
};
