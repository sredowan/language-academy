const Transaction = require('../models/Transaction');
const Enrollment = require('../models/Enrollment');
const JournalEntry = require('../models/JournalEntry');
const JournalLine = require('../models/JournalLine');
const Account = require('../models/Account');
const Invoice = require('../models/Invoice');
const Student = require('../models/Student');
const User = require('../models/User');
const Lead = require('../models/Lead');
const Opportunity = require('../models/Opportunity');
const Batch = require('../models/Batch');
const sequelize = require('../config/db.config');
const { Op } = require('sequelize');

exports.getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.findAll({
      where: { branch_id: req.branchId },
      include: [
        { model: Enrollment, include: [{ model: Student, include: [User] }] }
      ],
      order: [['createdAt', 'DESC']],
      limit: 50
    });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getPendingInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.findAll({
      where: { 
        branch_id: req.branchId,
        status: { [Op.in]: ['pending', 'partial', 'overdue'] }
      },
      include: [
        { model: Student, include: [User], required: false },
        { model: Enrollment, required: false }
      ]
    });
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.collectFee = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { enrollment_id, amount, method, transaction_ref, notes, account_id } = req.body;

    const enrollment = await Enrollment.findByPk(enrollment_id);
    if (!enrollment) throw new Error('Enrollment not found');

    // 1. Record Transaction
    const txn = await Transaction.create({
      branch_id: req.branchId,
      enrollment_id,
      amount,
      method,
      transaction_ref,
      recorded_by: req.user.id,
      status: 'success',
      paid_at: new Date()
    }, { transaction: t });

    // 2. Update Enrollment paid_amount
    const newPaidAmount = parseFloat(enrollment.paid_amount) + parseFloat(amount);
    enrollment.paid_amount = newPaidAmount;
    
    if (newPaidAmount >= parseFloat(enrollment.total_fee)) {
      enrollment.status = 'paid';
    } else {
      enrollment.status = 'partial';
    }
    await enrollment.save({ transaction: t });

    // ── CRM INTEGRATION ─────────────────────────────────────
    // If this enrollment came from CRM (no student_id yet),
    // create student now and mark the CRM lead as successful
    if (!enrollment.student_id) {
      // Find the CRM invoice linked to this enrollment
      const crmInvoice = await Invoice.findOne({
        where: { enrollment_id: enrollment.id, branch_id: req.branchId }
      });

      // Find the CRM lead via opportunity
      let lead = null;
      const linkedOpp = await Opportunity.findOne({
        where: { branch_id: req.branchId },
        order: [['created_at', 'DESC']],
      });

      if (linkedOpp && linkedOpp.lead_id) {
        lead = await Lead.findOne({
          where: { id: linkedOpp.lead_id, status: 'fees_pending' }
        });
      }

      // Fallback: search by invoice notes
      if (!lead && crmInvoice && crmInvoice.notes) {
        const nameMatch = crmInvoice.notes.match(/CRM Lead: (.+?) —/);
        if (nameMatch) {
          lead = await Lead.findOne({
            where: { name: nameMatch[1], branch_id: req.branchId, status: 'fees_pending' }
          });
        }
      }

      if (lead) {
        // Create User account
        let user = null;
        if (lead.email) {
          user = await User.findOne({ where: { email: lead.email } });
        }
        if (!user) {
          user = await User.create({
            name: lead.name,
            email: lead.email || `lead-${lead.id}@languageacademy.local`,
            password: Math.random().toString(36).substring(7),
            role: 'student',
            branch_id: req.branchId,
          }, { transaction: t });
        }

        // Create Student profile
        let student = await Student.findOne({ where: { user_id: user.id } });
        if (!student) {
          student = await Student.create({
            user_id: user.id,
            branch_id: req.branchId,
            batch_id: enrollment.batch_id || null,
            first_name: lead.name.split(' ')[0],
            last_name: lead.name.split(' ').slice(1).join(' ') || '',
            mobile_no: lead.phone,
            enrollment_date: new Date(),
            status: 'active',
          }, { transaction: t });
        }

        // Link student to enrollment
        enrollment.student_id = student.id;
        await enrollment.save({ transaction: t });

        // Update invoice
        if (crmInvoice) {
          await crmInvoice.update({
            student_id: student.id,
            paid: newPaidAmount,
            status: newPaidAmount >= parseFloat(enrollment.total_fee) ? 'paid' : 'partial'
          }, { transaction: t });
        }

        // Increment batch count
        if (enrollment.batch_id) {
          await Batch.increment('enrolled', { by: 1, where: { id: enrollment.batch_id }, transaction: t });
        }

        // ✅ Mark CRM lead as SUCCESSFUL — only POS can do this
        await lead.update({ status: 'successful', last_activity_at: new Date() }, { transaction: t });

        // ✅ Mark opportunity as WON
        if (linkedOpp && linkedOpp.lead_id === lead.id) {
          await linkedOpp.update({
            stage: 'won', closed_at: new Date(), probability: 100,
            invoice_id: crmInvoice?.id
          }, { transaction: t });
        }

        console.log(`[CRM→POS] Student created & lead marked successful: ${lead.name}`);
      }
    }
    // ── END CRM INTEGRATION ─────────────────────────────────

    // 3. Double-Entry Journaling
    const isUttara = req.branchId !== 1;
    let debitAccount = null;

    if (account_id) {
      debitAccount = await Account.findByPk(account_id);
      if (!debitAccount) throw new Error('Selected asset account not found');
    } else {
      const cashCode = isUttara ? '1000-U' : '1000';
      const bankCode = isUttara ? '1010-U' : '1010';
      debitAccount = await Account.findOne({ where: { code: method === 'cash' ? cashCode : bankCode } });
      
      if (!debitAccount) {
        debitAccount = await Account.create({ code: method === 'cash' ? cashCode : bankCode, name: method === 'cash' ? (isUttara ? 'Cash in Hand - Uttara' : 'Cash in Hand') : (isUttara ? 'Cash at Bank - Uttara' : 'Cash at Bank'), type: 'asset', branch_id: req.branchId, balance: 0 }, { transaction: t });
      }
    }

    const revenueCode = isUttara ? '4000-U' : '4000';
    let creditAccount = await Account.findOne({ where: { code: revenueCode } });

    if (!creditAccount) {
      creditAccount = await Account.create({ code: revenueCode, name: isUttara ? 'Tuition Revenue - Uttara' : 'Tuition Revenue', type: 'revenue', branch_id: req.branchId, balance: 0 }, { transaction: t });
    }

    if (!debitAccount || !creditAccount) throw new Error('Financial accounts not configured properly');

    const entry = await JournalEntry.create({
      branch_id: req.branchId,
      ref_no: `PAY-${txn.id}`,
      description: `Fee Collection - Enrollment: ${enrollment.id} | Ref: ${transaction_ref || 'N/A'}`,
      date: new Date(),
      posted_by: req.user.id
    }, { transaction: t });

    await JournalLine.bulkCreate([
      { journal_entry_id: entry.id, account_id: debitAccount.id, debit: amount, credit: 0, notes: notes || 'POS Payment' },
      { journal_entry_id: entry.id, account_id: creditAccount.id, debit: 0, credit: amount, notes: 'Tuition Revenue' }
    ], { transaction: t });

    await t.commit();
    res.status(201).json({ message: 'Fee collected successfully', transaction: txn });
  } catch (error) {
    await t.rollback();
    console.error('[CollectFee Error]:', error);
    res.status(500).json({ error: error.message });
  }

};
