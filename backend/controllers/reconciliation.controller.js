const sequelize = require('../config/db.config');
const { Op, fn, col, literal } = require('sequelize');
const Transaction = require('../models/Transaction');
const Expense = require('../models/Expense');
const Account = require('../models/Account');
const Branch = require('../models/Branch');
const User = require('../models/User');
const BankAccount = require('../models/BankAccount');
const BankAccountLedgerMap = require('../models/BankAccountLedgerMap');
const ReconciliationSession = require('../models/ReconciliationSession');
const ReconciliationLine = require('../models/ReconciliationLine');
const ReconciliationEvent = require('../models/ReconciliationEvent');
const JournalLine = require('../models/JournalLine');
const JournalEntry = require('../models/JournalEntry');
const AuditLog = require('../models/AuditLog');

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getBranchId(req) {
  return req.scopedBranchId || req.branchId;
}

function branchWhere(req, extra = {}) {
  const bid = getBranchId(req);
  return bid ? { ...extra, branch_id: bid } : extra;
}

async function writeEvent(sessionId, branchId, userId, action, details, oldValue, newValue) {
  await ReconciliationEvent.create({
    session_id: sessionId,
    branch_id: branchId,
    user_id: userId,
    action,
    details,
    old_value: oldValue,
    new_value: newValue,
  });
}

async function writeAudit(req, entity, entityId, action, oldValue, newValue) {
  try {
    await AuditLog.create({
      user_id: req.user?.id,
      branch_id: getBranchId(req),
      entity,
      entity_id: entityId,
      action,
      old_value: oldValue,
      new_value: newValue,
      ip_address: req.ip,
    });
  } catch (_) {}
}

// ─── Mapping CRUD ─────────────────────────────────────────────────────────────

exports.getMappings = async (req, res) => {
  try {
    const where = branchWhere(req, { is_active: true });
    const maps = await BankAccountLedgerMap.findAll({
      where,
      include: [
        { model: BankAccount, attributes: ['account_name', 'account_number', 'bank_name'] },
        { model: Account, attributes: ['name', 'code', 'type'] },
      ],
    });
    res.json(maps);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.createMapping = async (req, res) => {
  try {
    const { bank_account_id, account_id, channel } = req.body;
    if (!bank_account_id || !account_id || !channel) {
      return res.status(400).json({ error: 'bank_account_id, account_id, and channel are required' });
    }
    const mapping = await BankAccountLedgerMap.create({
      bank_account_id,
      account_id,
      channel,
      branch_id: getBranchId(req),
      is_active: true,
    });
    await writeAudit(req, 'BankAccountLedgerMap', mapping.id, 'create', null, mapping.toJSON());
    res.status(201).json(mapping);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.updateMapping = async (req, res) => {
  try {
    const mapping = await BankAccountLedgerMap.findByPk(req.params.id);
    if (!mapping) return res.status(404).json({ error: 'Mapping not found' });
    const old = mapping.toJSON();
    await mapping.update(req.body);
    await writeAudit(req, 'BankAccountLedgerMap', mapping.id, 'update', old, mapping.toJSON());
    res.json(mapping);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.deleteMapping = async (req, res) => {
  try {
    const mapping = await BankAccountLedgerMap.findByPk(req.params.id);
    if (!mapping) return res.status(404).json({ error: 'Mapping not found' });
    await mapping.update({ is_active: false });
    await writeAudit(req, 'BankAccountLedgerMap', mapping.id, 'deactivate', mapping.toJSON(), { is_active: false });
    res.json({ message: 'Mapping deactivated' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// ─── Session List & Detail ────────────────────────────────────────────────────

exports.getSessions = async (req, res) => {
  try {
    const { status, start_date, end_date } = req.query;
    const where = branchWhere(req);
    if (status) where.status = status;
    if (start_date || end_date) {
      where.recon_date = {};
      if (start_date) where.recon_date[Op.gte] = start_date;
      if (end_date) where.recon_date[Op.lte] = end_date;
    }
    const sessions = await ReconciliationSession.findAll({
      where,
      order: [['recon_date', 'DESC']],
      include: [
        { model: User, as: 'Preparer', attributes: ['name'] },
        { model: User, as: 'Reviewer', attributes: ['name'] },
        { model: User, as: 'Approver', attributes: ['name'] },
      ],
    });
    res.json(sessions);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.getSessionDetail = async (req, res) => {
  try {
    const session = await ReconciliationSession.findByPk(req.params.id, {
      include: [
        { model: User, as: 'Preparer', attributes: ['name'] },
        { model: User, as: 'Reviewer', attributes: ['name'] },
        { model: User, as: 'Approver', attributes: ['name'] },
      ],
    });
    if (!session) return res.status(404).json({ error: 'Session not found' });

    const lines = await ReconciliationLine.findAll({
      where: { session_id: session.id },
      include: [{ model: Account, attributes: ['name', 'code', 'type'] }],
      order: [['channel', 'ASC']],
    });

    const events = await ReconciliationEvent.findAll({
      where: { session_id: session.id },
      order: [['created_at', 'ASC']],
      include: [{ model: User, attributes: ['name'] }],
    });

    res.json({ session, lines, events });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// ─── Engine: Generate Session ─────────────────────────────────────────────────

exports.generateSession = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const branchId = getBranchId(req);
    const { recon_date } = req.body;
    if (!recon_date) {
      await t.rollback();
      return res.status(400).json({ error: 'recon_date is required' });
    }

    // Prevent duplicate session for same date
    const existing = await ReconciliationSession.findOne({
      where: { branch_id: branchId, recon_date },
    });
    if (existing) {
      await t.rollback();
      return res.status(409).json({ error: `Session already exists for ${recon_date}` });
    }

    // Get all active mappings for this branch
    const mappings = await BankAccountLedgerMap.findAll({
      where: { branch_id: branchId, is_active: true },
      include: [
        { model: Account, attributes: ['id', 'name'] },
        { model: BankAccount, attributes: ['id', 'account_name'] },
      ],
    });

    // Get all successful transactions for the date
    const transactions = await Transaction.findAll({
      where: {
        branch_id: branchId,
        status: 'success',
        paid_at: {
          [Op.between]: [
            `${recon_date} 00:00:00`,
            `${recon_date} 23:59:59`,
          ],
        },
      },
      attributes: ['method', 'amount', 'source', 'account_id', 'enrollment_id'],
      raw: true,
    });

    // Get all approved expenses for the date
    const expenses = await Expense.findAll({
      where: {
        branch_id: branchId,
        status: 'approved',
        date: recon_date,
      },
      attributes: ['account_id', 'amount', 'payment_method', 'category'],
      raw: true,
    });

    // ─── Build per-channel aggregation ─────────────────────────────────
    const channelMap = {};

    // Inflows from transactions
    for (const tx of transactions) {
      const method = tx.method || 'cash';
      if (!channelMap[method]) channelMap[method] = { inflows: 0, outflows: 0, txCount: 0, expenseCount: 0 };
      channelMap[method].inflows += parseFloat(tx.amount) || 0;
      channelMap[method].txCount += 1;
    }

    // Outflows from expenses
    for (const exp of expenses) {
      const method = exp.payment_method || 'cash';
      if (!channelMap[method]) channelMap[method] = { inflows: 0, outflows: 0, txCount: 0, expenseCount: 0 };
      channelMap[method].outflows += parseFloat(exp.amount) || 0;
      channelMap[method].expenseCount += 1;
    }

    // Also count by account_id for ledger reconciliation
    const accountInflows = {};
    const accountOutflows = {};
    const accountTxCounts = {};
    const accountExpCounts = {};
    for (const tx of transactions) {
      const aid = tx.account_id;
      if (!aid) continue;
      accountInflows[aid] = (accountInflows[aid] || 0) + parseFloat(tx.amount);
      accountTxCounts[aid] = (accountTxCounts[aid] || 0) + 1;
    }
    for (const exp of expenses) {
      const aid = exp.account_id;
      if (!aid) continue;
      accountOutflows[aid] = (accountOutflows[aid] || 0) + parseFloat(exp.amount);
      accountExpCounts[aid] = (accountExpCounts[aid] || 0) + 1;
    }

    // ─── Create session ─────────────────────────────────────────────────
    const session = await ReconciliationSession.create({
      branch_id: branchId,
      recon_date,
      status: 'draft',
      total_inflows: transactions.reduce((s, tx) => s + parseFloat(tx.amount), 0),
      total_outflows: expenses.reduce((s, e) => s + parseFloat(e.amount), 0),
      prepared_by: req.user?.id,
    }, { transaction: t });

    let totalLedgerNet = 0;
    let totalVariance = 0;
    const linesCreated = [];

    // ─── For each mapping, compute reconciliation line ──────────────────
    for (const mapping of mappings) {
      const accId = mapping.account_id;
      const channel = mapping.channel;

      const opInflows = channelMap[channel]?.inflows || 0;
      const opOutflows = channelMap[channel]?.outflows || 0;
      const opNet = opInflows - opOutflows;
      const txCount = channelMap[channel]?.txCount || 0;
      const expenseCount = channelMap[channel]?.expenseCount || 0;

      // Ledger: get journal lines for the mapped account on this date
      const ledgerLines = await JournalLine.findAll({
        where: { account_id: accId },
        include: [{
          model: JournalEntry,
          where: {
            branch_id: branchId,
            date: recon_date,
          },
          attributes: [],
        }],
        raw: true,
      });

      const ledgerDebit = ledgerLines.reduce((s, l) => s + parseFloat(l.debit || 0), 0);
      const ledgerCredit = ledgerLines.reduce((s, l) => s + parseFloat(l.credit || 0), 0);
      const ledgerNet = ledgerDebit - ledgerCredit;

      const variance = Math.abs(opNet - ledgerNet);
      let lineStatus = 'matched';
      if (variance > 5) lineStatus = 'variance_major';
      else if (variance > 0) lineStatus = 'variance_minor';

      const line = await ReconciliationLine.create({
        session_id: session.id,
        mapping_id: mapping.id,
        account_id: accId,
        bank_account_id: mapping.bank_account_id,
        channel,
        operational_inflows: opInflows,
        operational_outflows: opOutflows,
        operational_net: opNet,
        ledger_debit: ledgerDebit,
        ledger_credit: ledgerCredit,
        ledger_net: ledgerNet,
        variance,
        status: lineStatus,
        tx_count: txCount,
        expense_count: expenseCount,
      }, { transaction: t });

      linesCreated.push(line);
      totalLedgerNet += ledgerNet;
      totalVariance += variance;
    }

    // Update session totals
    await session.update({
      total_ledger_net: totalLedgerNet,
      total_variance: totalVariance,
    }, { transaction: t });

    await writeEvent(session.id, branchId, req.user?.id, 'generate', `Session generated for ${recon_date}`, null, { lines: linesCreated.length });

    await t.commit();
    res.status(201).json({ session, lines: linesCreated });
  } catch (e) {
    await t.rollback();
    res.status(500).json({ error: e.message });
  }
};

// ─── Line drill-down ──────────────────────────────────────────────────────────

exports.getLineDetail = async (req, res) => {
  try {
    const line = await ReconciliationLine.findByPk(req.params.lineId);
    if (!line) return res.status(404).json({ error: 'Reconciliation line not found' });

    const session = await ReconciliationSession.findByPk(line.session_id);
    if (!session) return res.status(404).json({ error: 'Session not found' });

    const reconDate = session.recon_date;
    const branchId = session.branch_id;
    const channel = line.channel;
    const accId = line.account_id;

    // Transactions for this channel on this date
    const transactions = await Transaction.findAll({
      where: {
        branch_id: branchId,
        status: 'success',
        method: channel,
        paid_at: { [Op.between]: [`${reconDate} 00:00:00`, `${reconDate} 23:59:59`] },
      },
      include: [
        {
          model: require('../models/Enrollment'),
          include: [
            { model: require('../models/Student'), include: [{ model: require('../models/User'), attributes: ['name'] }] },
          ],
        },
      ],
      order: [['paid_at', 'ASC']],
    });

    // Approved expenses for this channel on this date
    const expenseRows = await Expense.findAll({
      where: {
        branch_id: branchId,
        status: 'approved',
        date: reconDate,
        payment_method: channel,
      },
      include: [{ model: Account, attributes: ['name'] }],
      order: [['date', 'ASC']],
    });

    // Journal lines for mapped account on this date
    const ledgerLines = await JournalLine.findAll({
      where: { account_id: accId },
      include: [{
        model: JournalEntry,
        where: { branch_id: branchId, date: reconDate },
        attributes: ['ref_no', 'description', 'date'],
      }],
    });

    res.json({ transactions, expenses: expenseRows, ledgerLines, line });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// ─── Workflow: Review / Approve / Reopen ──────────────────────────────────────

exports.reviewSession = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const session = await ReconciliationSession.findByPk(req.params.id);
    if (!session) {
      await t.rollback();
      return res.status(404).json({ error: 'Session not found' });
    }
    if (session.status !== 'draft') {
      await t.rollback();
      return res.status(400).json({ error: `Cannot review session in '${session.status}' status` });
    }
    const oldStatus = session.status;
    await session.update({
      status: 'reviewed',
      reviewed_by: req.user?.id,
    }, { transaction: t });

    await writeEvent(session.id, session.branch_id, req.user?.id, 'review', 'Session marked as reviewed', { status: oldStatus }, { status: 'reviewed' });
    await t.commit();
    res.json({ message: 'Session reviewed', session });
  } catch (e) {
    await t.rollback();
    res.status(500).json({ error: e.message });
  }
};

exports.approveSession = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const session = await ReconciliationSession.findByPk(req.params.id);
    if (!session) {
      await t.rollback();
      return res.status(404).json({ error: 'Session not found' });
    }
    if (session.status !== 'reviewed') {
      await t.rollback();
      return res.status(400).json({ error: `Cannot approve session in '${session.status}' status` });
    }
    // Segregation of duties: approver cannot be preparer
    if (session.prepared_by === req.user?.id) {
      await t.rollback();
      return res.status(403).json({ error: 'Approver must be different from preparer (segregation of duties)' });
    }
    const oldStatus = session.status;
    await session.update({
      status: 'approved',
      approved_by: req.user?.id,
      locked_at: new Date(),
    }, { transaction: t });

    await writeEvent(session.id, session.branch_id, req.user?.id, 'approve', 'Session approved and locked', { status: oldStatus }, { status: 'approved' });
    await writeAudit(req, 'ReconciliationSession', session.id, 'approve', { status: oldStatus }, { status: 'approved', locked_at: new Date() });
    await t.commit();
    res.json({ message: 'Session approved and locked', session });
  } catch (e) {
    await t.rollback();
    res.status(500).json({ error: e.message });
  }
};

exports.reopenSession = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const session = await ReconciliationSession.findByPk(req.params.id);
    if (!session) {
      await t.rollback();
      return res.status(404).json({ error: 'Session not found' });
    }
    if (session.status !== 'approved') {
      await t.rollback();
      return res.status(400).json({ error: `Can only reopen approved sessions` });
    }
    const { reason } = req.body;
    if (!reason) {
      await t.rollback();
      return res.status(400).json({ error: 'Reopen reason is required' });
    }
    const oldStatus = session.status;
    await session.update({
      status: 'draft',
      approved_by: null,
      locked_at: null,
      reopen_reason: reason,
    }, { transaction: t });

    await writeEvent(session.id, session.branch_id, req.user?.id, 'reopen', reason, { status: oldStatus }, { status: 'draft' });
    await writeAudit(req, 'ReconciliationSession', session.id, 'reopen', { status: oldStatus }, { status: 'draft', reopen_reason: reason });
    await t.commit();
    res.json({ message: 'Session reopened', session });
  } catch (e) {
    await t.rollback();
    res.status(500).json({ error: e.message });
  }
};

exports.lockSession = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const session = await ReconciliationSession.findByPk(req.params.id);
    if (!session) {
      await t.rollback();
      return res.status(404).json({ error: 'Session not found' });
    }
    if (session.status !== 'approved') {
      await t.rollback();
      return res.status(400).json({ error: `Can only lock approved sessions` });
    }
    await session.update({
      status: 'locked',
      locked_at: new Date(),
    }, { transaction: t });

    await writeEvent(session.id, session.branch_id, req.user?.id, 'lock', 'Session locked', { status: 'approved' }, { status: 'locked' });
    await t.commit();
    res.json({ message: 'Session locked', session });
  } catch (e) {
    await t.rollback();
    res.status(500).json({ error: e.message });
  }
};

exports.updateLineNotes = async (req, res) => {
  try {
    const line = await ReconciliationLine.findByPk(req.params.lineId);
    if (!line) return res.status(404).json({ error: 'Line not found' });

    const session = await ReconciliationSession.findByPk(line.session_id);
    if (session?.status === 'approved' || session?.status === 'locked') {
      return res.status(403).json({ error: 'Cannot edit lines on approved/locked sessions' });
    }

    const old = { notes: line.notes, status: line.status };
    await line.update({
      notes: req.body.notes || line.notes,
      status: req.body.status || line.status,
    });

    await writeEvent(session.id, session.branch_id, req.user?.id, 'line_update', `Line updated: ${line.channel}`, old, { notes: line.notes, status: line.status });
    res.json(line);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// ─── Quick Stats ──────────────────────────────────────────────────────────────

exports.getStats = async (req, res) => {
  try {
    const branchId = getBranchId(req);
    const today = new Date().toISOString().split('T')[0];

    // Today's totals
    const todayTx = await Transaction.findAll({
      where: {
        branch_id: branchId,
        status: 'success',
        paid_at: { [Op.between]: [`${today} 00:00:00`, `${today} 23:59:59`] },
      },
      attributes: [[fn('SUM', col('amount')), 'total'], [fn('COUNT', col('id')), 'count']],
      raw: true,
    });

    const todayExp = await Expense.findAll({
      where: {
        branch_id: branchId,
        status: 'approved',
        date: today,
      },
      attributes: [[fn('SUM', col('amount')), 'total'], [fn('COUNT', col('id')), 'count']],
      raw: true,
    });

    // Session stats
    const sessions = await ReconciliationSession.findAll({
      where: { branch_id: branchId },
      attributes: ['status', [fn('COUNT', col('id')), 'count']],
      group: ['status'],
      raw: true,
    });

    const sessionStats = {};
    for (const s of sessions) {
      sessionStats[s.status] = parseInt(s.count);
    }

    // Unreconciled variance
    const varianceLines = await ReconciliationLine.findAll({
      where: { status: { [Op.in]: ['variance_minor', 'variance_major'] } },
      include: [{
        model: ReconciliationSession,
        where: { branch_id: branchId },
        attributes: [],
      }],
      attributes: [[fn('SUM', col('variance')), 'total']],
      raw: true,
    });

    res.json({
      today: {
        inflows: parseFloat(todayTx[0]?.total) || 0,
        inflow_count: parseInt(todayTx[0]?.count) || 0,
        outflows: parseFloat(todayExp[0]?.total) || 0,
        outflow_count: parseInt(todayExp[0]?.count) || 0,
        net: (parseFloat(todayTx[0]?.total) || 0) - (parseFloat(todayExp[0]?.total) || 0),
      },
      sessions: {
        draft: sessionStats.draft || 0,
        reviewed: sessionStats.reviewed || 0,
        approved: sessionStats.approved || 0,
        locked: sessionStats.locked || 0,
      },
      unresolved_variance: parseFloat(varianceLines[0]?.total) || 0,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// Keep old endpoints for backward compatibility
exports.getBankAccounts = async (req, res) => {
  try {
    const accounts = await BankAccount.findAll();
    res.json(accounts);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};