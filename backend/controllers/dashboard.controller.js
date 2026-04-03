const sequelize = require('../config/db.config');
const Lead = require('../models/Lead');
const Batch = require('../models/Batch');
const Student = require('../models/Student');
const JournalLine = require('../models/JournalLine');
const Account = require('../models/Account');
const Invoice = require('../models/Invoice');
const Entry = sequelize; // Use for plain queries if needed
const { Op } = require('sequelize');

exports.getStats = async (req, res) => {
  try {
    const { branchId, role, user_id } = req.query;
    const whereClause = branchId && branchId !== 'all' ? { branch_id: branchId } : {};

    // 1. Core shared stats
    const totalLeads = await Lead.count({ where: whereClause });
    const totalBatches = await Batch.count({ where: whereClause });
    const totalStudents = await Student.count({ where: whereClause });

    // 2. Financial Stats (Revenue & Expenses)
    const revenue = await JournalLine.sum('credit', {
      include: [{ model: Account, where: { ...whereClause, type: 'revenue' } }]
    }) || 0;

    const expenses = await JournalLine.sum('debit', {
      include: [{ model: Account, where: { ...whereClause, type: 'expense' } }]
    }) || 0;

    // Build the response payload
    const payload = {
      totalLeads,
      totalBatches,
      totalStudents,
      revenue,
      expenses,
      netProfit: revenue - expenses,
    };

    // ─── ROLE SPECIFIC DATA ENRICHMENT ──────────────────────────────────────────

    // Accounting additional data
    if (role === 'accounting' || role === 'accounts') {
      const liquidAccounts = await Account.findAll({
        where: { ...whereClause, type: 'asset', sub_type: { [Op.in]: ['bank', 'cash'] } },
        attributes: ['id', 'name', 'balance', 'sub_type']
      });
      payload.liquidAccounts = liquidAccounts;

      const unpaidInvoices = await Invoice.sum('balance_due', { where: { ...whereClause, status: { [Op.ne]: 'paid' } } }) || 0;
      payload.unpaidInvoices = unpaidInvoices;

      // Mock revenue trend for chart (last 6 months)
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
      payload.financialTrend = months.map((m, i) => ({
        name: m,
        revenue: Math.floor(Math.random() * 500000) + 200000,
        expense: Math.floor(Math.random() * 300000) + 100000,
      }));
    }

    // CRM / Counselor additional data
    if (role === 'crm' || role === 'counselor') {
      const leadsByStatus = await Lead.findAll({
        where: whereClause,
        attributes: ['status', [sequelize.fn('COUNT', 'id'), 'count']],
        group: ['status']
      });
      payload.leadsByStatus = leadsByStatus;

      payload.recentLeads = await Lead.findAll({
        where: whereClause,
        limit: 5,
        order: [['createdAt', 'DESC']]
      });
      
      const newLeadsToday = await Lead.count({
        where: { ...whereClause, createdAt: { [Op.gte]: new Date().toISOString().split('T')[0] } }
      });
      payload.newLeadsToday = newLeadsToday;
    }

    // Teacher / Trainer additional data
    if (role === 'teacher' || role === 'trainer') {
      // Mocking teacher schedule/metrics since assignment table might be separate
      payload.teacherBatches = await Batch.findAll({
        where: whereClause,
        limit: 3,
        order: [['start_date', 'DESC']]
      });
    }

    // Brand Manager additional data
    if (role === 'brandmanager') {
      const leadsBySourceRaw = await Lead.findAll({
        where: whereClause,
        attributes: ['source', [sequelize.fn('COUNT', 'id'), 'count']],
        group: ['source']
      });
      
      const sourceMap = { fb: 'Facebook', org: 'Organic', ref: 'Referral', walk_in: 'Walk In' };
      payload.leadsBySource = leadsBySourceRaw.map(l => ({
        name: sourceMap[l.source] || l.source || 'Direct',
        value: parseInt(l.dataValues.count, 10)
      }));

      // Trend for marketing chart
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      payload.leadGenerationTrend = days.map(d => ({
        name: d,
        leads: Math.floor(Math.random() * 30) + 5
      }));
      
      // Mocks for marketing CAC and Spend
      payload.marketingSpend = Math.floor(Math.random() * 50000) + 10000;
      payload.costPerLead = totalLeads ? (payload.marketingSpend / totalLeads).toFixed(2) : 0;
    }

    res.json(payload);
  } catch (error) {
    console.error('Dashboard Error:', error);
    res.status(500).json({ error: error.message });
  }
};
