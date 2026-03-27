const Lead = require('../models/Lead');
const Batch = require('../models/Batch');
const Student = require('../models/Student');
const JournalLine = require('../models/JournalLine');
const Account = require('../models/Account');
const { Op } = require('sequelize');

exports.getStats = async (req, res) => {
  try {
    const { branchId } = req.query;
    const whereClause = branchId && branchId !== 'all' ? { branch_id: branchId } : {};

    // 1. Leads Count
    const totalLeads = await Lead.count({ where: whereClause });

    // 2. Batches Count
    const totalBatches = await Batch.count({ where: whereClause });

    // 3. Students Count
    const totalStudents = await Student.count({ where: whereClause });

    // 4. Financial Stats (Revenue & Expenses)
    // We join with Account to filter by type
    const revenue = await JournalLine.sum('credit', {
      include: [{
        model: Account,
        where: { ...whereClause, type: 'revenue' }
      }]
    }) || 0;

    const expenses = await JournalLine.sum('debit', {
      include: [{
        model: Account,
        where: { ...whereClause, type: 'expense' }
      }]
    }) || 0;

    // 5. Recent Activity (Simplified - last 5 leads)
    const recentLeads = await Lead.findAll({
      where: whereClause,
      limit: 5,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      totalLeads,
      totalBatches,
      totalStudents,
      revenue,
      expenses,
      netProfit: revenue - expenses,
      recentLeads
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
