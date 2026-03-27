const Student = require('../models/Student');
const User = require('../models/User');
const Batch = require('../models/Batch');
const Course = require('../models/Course');
const bcrypt = require('bcryptjs');

const getEffectiveBranchId = (req) => req.scopedBranchId || req.branchId;

const deriveStudentState = (student) => {
  const status = student.status;
  const batchEndDate = student.Batch?.end_date ? new Date(student.Batch.end_date) : null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (status === 'dropped') return 'dropped';
  if (!student.batch_id || !student.Batch) return 'unassigned';

  if (batchEndDate && !Number.isNaN(batchEndDate.getTime())) {
    batchEndDate.setHours(0, 0, 0, 0);
    if (today >= batchEndDate) return 'course_completed';
  }

  return 'enrolled';
};

const decorateStudent = (student) => {
  const derivedState = deriveStudentState(student);
  const completionDate = derivedState === 'course_completed' ? student.Batch?.end_date : null;
  return {
    ...student.toJSON(),
    derived_state: derivedState,
    is_course_completed: derivedState === 'course_completed',
    course_completion_date: completionDate,
    is_premium_pte: student.plan_type === 'premium'
  };
};

exports.getAllStudents = async (req, res) => {
  try {
    const branchId = getEffectiveBranchId(req);
    if (!branchId) return res.status(400).json({ error: 'Please select a specific branch' });

    const students = await Student.findAll({
      where: { branch_id: branchId },
      include: [
        { model: User },
        { model: Batch, include: [{ model: Course, attributes: ['id', 'title'] }] }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json(students.map(decorateStudent));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getStudentById = async (req, res) => {
  try {
    const branchId = getEffectiveBranchId(req);
    if (!branchId) return res.status(400).json({ error: 'Please select a specific branch' });

    const student = await Student.findOne({
      where: { id: req.params.id, branch_id: branchId },
      include: [
        { model: User },
        { model: Batch, include: [{ model: Course, attributes: ['id', 'title'] }] }
      ]
    });

    if (!student) return res.status(404).json({ error: 'Student not found' });
    res.json(decorateStudent(student));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createStudent = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { 
      name, email, password, batch_id, guardian_id, course_id,
      first_name, middle_name, last_name, father_name, mother_name,
      mobile_no, nid_birth_cert, current_address, permanent_address,
      passport_no, photograph_url, educational_details, employment_details
    } = req.body;
    
    // Fallback for name if first_name/last_name provided but not name
    const fullName = name || `${first_name || ''} ${last_name || ''}`.trim() || 'No Name Provided';

    const hashedPassword = await bcrypt.hash(password || 'Student123', 10);
    
    // Create User account
    const user = await User.create({
      name: fullName,
      email,
      password: hashedPassword,
      role: 'student',
      branch_id: req.branchId
    }, { transaction: t });

    // Create Student record
    const student = await Student.create({
      user_id: user.id,
      branch_id: req.branchId,
      batch_id: batch_id || null,
      guardian_id: guardian_id || null,
      first_name, last_name, father_name, mother_name,
      mobile_no, nid_birth_cert, current_address, permanent_address,
      passport_no, photograph_url, 
      educational_details: (typeof educational_details === 'string' && educational_details.trim() !== '') ? JSON.parse(educational_details) : (educational_details || []),
      employment_details: (typeof employment_details === 'string' && employment_details.trim() !== '') ? JSON.parse(employment_details) : (employment_details || []),
      enrollment_date: new Date()
    }, { transaction: t });

    let invoice = null;
    let enrollment = null;

    if (course_id) {
      const Enrollment = require('../models/Enrollment');
      const Invoice = require('../models/Invoice');
      
      const course = await Course.findByPk(course_id, { transaction: t });
      if (course) {
        enrollment = await Enrollment.create({
          branch_id: req.branchId,
          student_id: student.id,
          batch_id: batch_id || null,
          total_fee: course.base_fee,
          discount: 0,
          paid_amount: 0
        }, { transaction: t });

        invoice = await Invoice.create({
          branch_id: req.branchId,
          invoice_no: `INV-${Date.now()}-${student.id}`,
          enrollment_id: enrollment.id,
          student_id: student.id,
          amount: course.base_fee,
          paid: 0,
          status: 'pending',
          due_date: new Date(new Date().setDate(new Date().getDate() + 7)),
          notes: `Admission Fee & Tuition for ${course.title}`
        }, { transaction: t });
      }
    }

    await t.commit();
    res.status(201).json({ user, student, enrollment, invoice });
  } catch (error) {
    await t.rollback();
    console.error('[CreateStudent Error]:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.enrollInBatch = async (req, res) => {
  try {
    const branchId = getEffectiveBranchId(req);
    if (!branchId) return res.status(400).json({ error: 'Please select a specific branch' });

    const { student_id, batch_id } = req.body;
    const student = await Student.findOne({ where: { id: student_id, branch_id: branchId } });
    if (!student) return res.status(404).json({ error: 'Student not found' });

    const batch = await Batch.findOne({ where: { id: batch_id, branch_id: branchId } });
    if (!batch) return res.status(400).json({ error: 'Invalid batch selected for this branch' });

    student.batch_id = batch_id;
    await student.save();
    res.json({ message: 'Student enrolled in batch', student });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateMe = async (req, res) => {
  try {
    const { target_score, exam_date, mobile_no, current_address } = req.body;
    
    const student = await Student.findOne({ where: { user_id: req.user.id } });
    if (!student) return res.status(404).json({ error: 'Student profile not found' });

    if (target_score !== undefined) student.target_score = target_score;
    if (exam_date !== undefined) student.exam_date = exam_date;
    if (mobile_no !== undefined) student.mobile_no = mobile_no;
    if (current_address !== undefined) student.current_address = current_address;

    await student.save();

    res.json({ message: 'Profile updated successfully', student });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateStudentManagement = async (req, res) => {
  try {
    const branchId = getEffectiveBranchId(req);
    if (!branchId) return res.status(400).json({ error: 'Please select a specific branch' });

    const { id } = req.params;
    const { batch_id, status } = req.body;

    const student = await Student.findOne({ where: { id, branch_id: branchId } });
    if (!student) return res.status(404).json({ error: 'Student not found' });

    if (batch_id !== undefined) {
      if (batch_id === null || batch_id === '') {
        student.batch_id = null;
      } else {
        const batch = await Batch.findOne({ where: { id: batch_id, branch_id: branchId } });
        if (!batch) return res.status(400).json({ error: 'Invalid batch selected for this branch' });
        student.batch_id = batch.id;
      }
    }

    if (status !== undefined) {
      if (!['active', 'dropped'].includes(status)) {
        return res.status(400).json({ error: 'Allowed status values are active or dropped' });
      }
      student.status = status;
    }

    await student.save();

    const updatedStudent = await Student.findOne({
      where: { id: student.id, branch_id: branchId },
      include: [
        { model: User },
        { model: Batch, include: [{ model: Course, attributes: ['id', 'title'] }] }
      ]
    });

    res.json(decorateStudent(updatedStudent));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
