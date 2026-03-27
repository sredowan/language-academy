const Account = require('../models/Account');
const JournalEntry = require('../models/JournalEntry');
const JournalLine = require('../models/JournalLine');
const AuditLog = require('../models/AuditLog');
const User = require('../models/User');
const sequelize = require('../config/db.config');
const { injectBranchFilter } = require('../middleware/branch.middleware');
const { Op } = require('sequelize');

// Get Chart of Accounts
exports.getAccounts = async (req, res) => {
  try {
    const queryOptions = injectBranchFilter(req, { order: [['code', 'ASC']] });
    const accounts = await Account.findAll(queryOptions);
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create Journal Entry (Double Entry)
exports.createJournalEntry = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { ref_no, description, date, lines } = req.body;
    const totalDebit = lines.reduce((sum, l) => sum + parseFloat(l.debit || 0), 0);
    const totalCredit = lines.reduce((sum, l) => sum + parseFloat(l.credit || 0), 0);
    if (Math.abs(totalDebit - totalCredit) > 0.01) throw new Error('Journal entry is not balanced');

    const entry = await JournalEntry.create({
      branch_id: req.branchId, ref_no, description, date: date || new Date(), posted_by: req.user.id
    }, { transaction: t });

    const journalLines = lines.map(line => ({
      journal_entry_id: entry.id, account_id: line.account_id, debit: line.debit || 0, credit: line.credit || 0, notes: line.notes
    }));
    await JournalLine.bulkCreate(journalLines, { transaction: t });

    await AuditLog.create({
      user_id: req.user.id, branch_id: req.branchId, action: 'CREATE', entity: 'JournalEntry',
      entity_id: entry.id, new_value: { ref_no, description, totalDebit, totalCredit }
    }, { transaction: t });

    await t.commit();
    res.status(201).json(entry);
  } catch (error) {
    await t.rollback();
    res.status(500).json({ error: error.message });
  }
};

// ── NEW: Transaction Journal (Full listing) ──
exports.getJournal = async (req, res) => {
  try {
    const { search, type } = req.query;
    const entryWhere = {};
    if (search) {
      entryWhere[Op.or] = [
        { ref_no: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    const lines = await JournalLine.findAll({
      include: [
        { model: JournalEntry, where: entryWhere, include: [{ model: User, as: 'Poster', attributes: ['name'] }] },
        { model: Account, attributes: ['name', 'code', 'type'] }
      ],
      order: [[JournalEntry, 'date', 'DESC'], ['id', 'ASC']],
      limit: 200
    });

    // Filter by account type if needed
    const filtered = type && type !== 'all'
      ? lines.filter(l => l.Account?.type === type)
      : lines;

    res.json(filtered);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ── NEW: Ledger Summary (Account-level) ──
exports.getLedgerSummary = async (req, res) => {
  try {
    const accounts = await Account.findAll({ where: { is_active: true }, order: [['type', 'ASC'], ['code', 'ASC']] });
    const summary = [];

    for (const acc of accounts) {
      const debitTotal = await JournalLine.sum('debit', { where: { account_id: acc.id } }) || 0;
      const creditTotal = await JournalLine.sum('credit', { where: { account_id: acc.id } }) || 0;
      if (debitTotal || creditTotal) {
        summary.push({
          id: acc.id, name: acc.name, code: acc.code, type: acc.type,
          debitTotal: parseFloat(debitTotal), creditTotal: parseFloat(creditTotal),
          balance: parseFloat(debitTotal) - parseFloat(creditTotal)
        });
      }
    }
    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ── NEW: Audit Log ──
exports.getAuditLog = async (req, res) => {
  try {
    const logs = await AuditLog.findAll({
      include: [{ model: User, attributes: ['name'] }],
      order: [['created_at', 'DESC']],
      limit: 100
    });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
