const Enrollment = require('../models/Enrollment');
const Student = require('../models/Student');
const Batch = require('../models/Batch');
const { injectBranchFilter } = require('../middleware/branch.middleware');

exports.createEnrollment = async (req, res) => {
  try {
    const { student_id, batch_id, total_fee, discount } = req.body;
    
    const enrollment = await Enrollment.create({
      branch_id: req.branchId,
      student_id,
      batch_id,
      total_fee,
      discount: discount || 0,
      paid_amount: 0,
      status: 'pending'
    });

    res.status(201).json(enrollment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getEnrollments = async (req, res) => {
  try {
    const queryOptions = injectBranchFilter(req, {
      include: [Student, Batch]
    });
    const enrollments = await Enrollment.findAll(queryOptions);
    res.json(enrollments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
