const Invoice = require('../models/Invoice');
const Student = require('../models/Student');
const User = require('../models/User');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const Batch = require('../models/Batch');
const { Op, fn, col } = require('sequelize');

exports.getInvoices = async (req, res) => {
  try {
    const { status, search } = req.query;
    const where = {};
    if (status && status !== 'all') where.status = status;

    const invoices = await Invoice.findAll({
      where,
      include: [
        { model: Student, include: [{ model: User, attributes: ['name', 'email'] }] },
        { model: Enrollment, include: [{ model: Course, attributes: ['title'] }, { model: Batch, attributes: ['name'] }] }
      ],
      order: [['issued_at', 'DESC']]
    });
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getInvoiceStats = async (req, res) => {
  try {
    const totalInvoiced = await Invoice.sum('amount') || 0;
    const totalPaid = await Invoice.sum('paid') || 0;
    const pending = await Invoice.sum('amount', { where: { status: { [Op.in]: ['pending', 'partial'] } } }) || 0;
    const pendingPaid = await Invoice.sum('paid', { where: { status: { [Op.in]: ['pending', 'partial'] } } }) || 0;
    const overdue = await Invoice.sum('amount', { where: { status: 'overdue' } }) || 0;
    const overduePaid = await Invoice.sum('paid', { where: { status: 'overdue' } }) || 0;
    const totalCount = await Invoice.count();
    const overdueCount = await Invoice.count({ where: { status: 'overdue' } });
    const pendingCount = await Invoice.count({ where: { status: { [Op.in]: ['pending', 'partial'] } } });

    res.json({
      totalInvoiced, totalPaid, collectionRate: totalInvoiced > 0 ? ((totalPaid / totalInvoiced) * 100).toFixed(1) : 0,
      pendingAmount: pending - pendingPaid, overdueAmount: overdue - overduePaid,
      totalCount, overdueCount, pendingCount
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAgingAnalysis = async (req, res) => {
  try {
    const now = new Date();
    const ranges = [
      { label: 'Current (0-30 days)', min: 0, max: 30 },
      { label: '31-60 days', min: 31, max: 60 },
      { label: '61-90 days', min: 61, max: 90 },
      { label: '90+ days', min: 91, max: 9999 }
    ];

    const aging = [];
    for (const range of ranges) {
      const fromDate = new Date(now);
      fromDate.setDate(fromDate.getDate() - range.max);
      const toDate = new Date(now);
      toDate.setDate(toDate.getDate() - range.min);

      const total = await Invoice.sum('amount', {
        where: {
          status: { [Op.in]: ['pending', 'overdue', 'partial'] },
          due_date: { [Op.between]: [fromDate.toISOString().split('T')[0], toDate.toISOString().split('T')[0]] }
        }
      }) || 0;
      const paid = await Invoice.sum('paid', {
        where: {
          status: { [Op.in]: ['pending', 'overdue', 'partial'] },
          due_date: { [Op.between]: [fromDate.toISOString().split('T')[0], toDate.toISOString().split('T')[0]] }
        }
      }) || 0;

      aging.push({ label: range.label, amount: total - paid });
    }

    const totalReceivable = aging.reduce((s, a) => s + a.amount, 0);
    res.json({ aging, totalReceivable });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createInvoice = async (req, res) => {
  try {
    const { enrollment_id, student_id, amount, due_date, notes } = req.body;
    const invoice = await Invoice.create({
      branch_id: req.branchId,
      invoice_no: `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,
      enrollment_id, student_id, amount, due_date, notes, status: 'pending'
    });
    res.status(201).json(invoice);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findByPk(req.params.id);
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
    await invoice.update(req.body);
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
