const Expense = require('../models/Expense');
const Account = require('../models/Account');
const User = require('../models/User');
const ExpenseCategory = require('../models/ExpenseCategory');
const JournalEntry = require('../models/JournalEntry');
const JournalLine = require('../models/JournalLine');
const sequelize = require('../config/db.config');
const { fn, col, literal, Op } = require('sequelize');

exports.getExpenses = async (req, res) => {
  try {
    const { category, from, to } = req.query;
    const where = {};
    if (category) where.category = category;
    if (from || to) {
      where.date = {};
      if (from) where.date[Op.gte] = from;
      if (to) where.date[Op.lte] = to;
    }

    const expenses = await Expense.findAll({
      where,
      include: [
        { model: Account, attributes: ['name', 'code', 'type'] },
        { model: User, as: 'Approver', attributes: ['name'] }
      ],
      order: [['date', 'DESC']]
    });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getExpenseSplit = async (req, res) => {
  try {
    const split = await Expense.findAll({
      attributes: ['category', [fn('SUM', col('amount')), 'total']],
      where: { status: 'approved' },
      group: ['category'],
      order: [[literal('total'), 'DESC']]
    });
    const grandTotal = split.reduce((s, e) => s + parseFloat(e.dataValues.total || 0), 0);
    const result = split.map(e => ({
      category: e.category || 'Uncategorized',
      total: parseFloat(e.dataValues.total),
      percentage: grandTotal > 0 ? ((parseFloat(e.dataValues.total) / grandTotal) * 100).toFixed(1) : 0
    }));
    res.json({ split: result, grandTotal });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createExpense = async (req, res) => {
  try {
    const { account_id, amount, description, category, payment_method, date } = req.body;
    const targetBranch = req.branchId || 1;
    // receipt_url comes from multer if file was uploaded
    const receipt_url = req.file ? `/uploads/expenses/${req.file.filename}` : null;

    const expense = await Expense.create({
      branch_id: targetBranch,
      account_id, amount, description, category, payment_method,
      receipt_url, 
      date: date || new Date(), 
      status: 'pending' // Multi-layer starts as pending
    });

    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.verifyExpense = async (req, res) => {
  try {
    const expense = await Expense.findByPk(req.params.id);
    if (!expense) return res.status(404).json({ error: 'Expense not found' });
    
    await expense.update({
      status: 'verified',
      verified_by: req.user.id,
      verification_date: new Date()
    });
    
    res.json(expense);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.approveExpense = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const expense = await Expense.findByPk(req.params.id);
    if (!expense) return res.status(404).json({ error: 'Expense not found' });
    if (expense.status === 'approved') return res.status(400).json({ error: 'Already approved' });

    // --- Double-Entry Logic Triggers ONLY on Approval ---
    const targetBranch = expense.branch_id;
    const liquidAccount = await Account.findByPk(expense.account_id);
    if (!liquidAccount) throw new Error('Payment source (Bank/Cash) account not found');

    let expenseAccount = await Account.findOne({ where: { name: expense.category, type: 'expense', branch_id: targetBranch } });
    if (!expenseAccount) {
      const existing = await Account.findAll({ where: { type: 'expense', branch_id: targetBranch }, attributes: ['code'] });
      let maxCode = 5000;
      existing.forEach(acc => {
        const ci = parseInt(acc.code.split('-')[0]);
        if (!isNaN(ci) && ci > maxCode) maxCode = ci;
      });
      expenseAccount = await Account.create({
        branch_id: targetBranch, code: targetBranch === 1 ? `${maxCode + 1}` : `${maxCode + 1}-U`,
        name: expense.category, type: 'expense', is_active: true
      }, { transaction: t });
    }

    const entry = await JournalEntry.create({
      branch_id: targetBranch,
      ref_no: `EXP-APP-${expense.id}-${Date.now()}`,
      description: expense.description || `Approved Expense: ${expense.category}`,
      date: new Date(),
      posted_by: req.user.id
    }, { transaction: t });

    await JournalLine.bulkCreate([
      { journal_entry_id: entry.id, account_id: expenseAccount.id, debit: expense.amount, credit: 0, notes: expense.description },
      { journal_entry_id: entry.id, account_id: liquidAccount.id, debit: 0, credit: expense.amount, notes: `Paid via ${expense.payment_method}` }
    ], { transaction: t });

    await expense.update({
      status: 'approved',
      approved_by: req.user.id
    }, { transaction: t });

    await t.commit();
    res.json({ message: 'Expense approved and journal entry created', expense });
  } catch (error) {
    console.error('Approve Error:', error);
    if (t) await t.rollback();
    res.status(500).json({ error: error.message });
  }
};

exports.rejectExpense = async (req, res) => {
  try {
    const { rejection_reason } = req.body;
    const expense = await Expense.findByPk(req.params.id);
    if (!expense) return res.status(404).json({ error: 'Expense not found' });
    
    await expense.update({
      status: 'rejected',
      rejection_reason
    });
    
    res.json({ message: 'Expense rejected', expense });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// --- Expense Category CRUD ---

exports.getExpenseCategories = async (req, res) => {
  try {
    const categories = await ExpenseCategory.findAll({
      where: { parent_id: null, is_active: true },
      include: [{ model: ExpenseCategory, as: 'Children', where: { is_active: true }, required: false }],
      order: [['name', 'ASC'], [{ model: ExpenseCategory, as: 'Children' }, 'name', 'ASC']]
    });
    console.log('[DEBUG] Fetched Categories Count:', categories.length);
    res.json(categories);
  } catch (error) {
    console.error('[ERROR] Fetch Categories Error:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getAllCategoriesFlat = async (req, res) => {
  try {
    const categories = await ExpenseCategory.findAll({
      where: { is_active: true },
      include: [{ model: ExpenseCategory, as: 'Parent', attributes: ['name'] }],
      order: [['type', 'ASC'], ['name', 'ASC']]
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createExpenseCategory = async (req, res) => {
  try {
    const { name, parent_id, description } = req.body;
    console.log('[DEBUG] Category Creation Request:', { name, parent_id, branchId: req.branchId });
    
    const cleanParentId = (parent_id && parent_id !== '' && parent_id !== 'null' && parent_id !== 'undefined') ? parseInt(parent_id) : null;
    const type = cleanParentId ? 'sub' : 'head';
    
    console.log('[DEBUG] Parsed cleanParentId:', cleanParentId, 'Type:', type);

    if (cleanParentId && !isNaN(cleanParentId)) {
      const parent = await ExpenseCategory.findByPk(cleanParentId);
      if (!parent) return res.status(404).json({ error: 'Parent category not found' });
    }
    
    const finalParentId = (cleanParentId && !isNaN(cleanParentId)) ? cleanParentId : null;

    const category = await ExpenseCategory.create({
      branch_id: req.branchId || 1, 
      name, 
      parent_id: finalParentId, 
      type, 
      description
    });
    console.log('[DEBUG] Category Created Successfully:', category.id);
    res.status(201).json(category);
  } catch (error) {
    console.error('[ERROR] Expense Category Error:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.updateExpenseCategory = async (req, res) => {
  try {
    const cat = await ExpenseCategory.findByPk(req.params.id);
    if (!cat) return res.status(404).json({ error: 'Category not found' });
    await cat.update(req.body);
    res.json(cat);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteExpenseCategory = async (req, res) => {
  try {
    const cat = await ExpenseCategory.findByPk(req.params.id);
    if (!cat) return res.status(404).json({ error: 'Category not found' });
    await cat.update({ is_active: false });
    // Also deactivate children
    await ExpenseCategory.update({ is_active: false }, { where: { parent_id: cat.id } });
    res.json({ message: 'Category deactivated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
