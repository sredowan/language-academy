const Attendance = require('../models/Attendance');
const automationService = require('../services/automation.service');
const Student = require('../models/Student');
const User = require('../models/User');
const Batch = require('../models/Batch');

exports.markAttendance = async (req, res) => {
  try {
    const { batch_id, date, attendance_data } = req.body;
    // attendance_data looks like: [{ student_id: 1, status: 'present' }, ...]

    const records = await Promise.all(attendance_data.map(async (record) => {
      const [attendance, created] = await Attendance.findOrCreate({
        where: {
          batch_id,
          student_id: record.student_id,
          date
        },
        defaults: {
          branch_id: req.branchId,
          status: record.status,
          method: 'manual'
        }
      });

      if (!created) {
        attendance.status = record.status;
        await attendance.save();
      }

      if (record.status === 'absent') {
        const student = await Student.findByPk(record.student_id, { include: [User] });
        automationService.processTrigger('student_absent', {
          student_id: record.student_id,
          student_name: student?.User?.name,
          phone: student?.User?.phone,
          branch_id: req.branchId,
          date: date
        });
      }

      return attendance;
    }));

    res.json({ message: 'Attendance marked successfully', records });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getBatchAttendance = async (req, res) => {
  try {
    const { batch_id, date } = req.query;
    const where = { batch_id };
    if (date) where.date = date;

    const attendance = await Attendance.findAll({
      where,
      include: [{ model: Student, include: [User] }]
    });

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getStudentAttendance = async (req, res) => {
  try {
    const { student_id } = req.params;
    const attendance = await Attendance.findAll({
      where: { student_id },
      include: [Batch]
    });

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getMyAttendance = async (req, res) => {
  try {
    // Find the student record for this user
    const student = await Student.findOne({ where: { user_id: req.user.id } });
    if (!student) return res.status(404).json({ error: 'Student record not found' });

    const attendance = await Attendance.findAll({
      where: { student_id: student.id },
      include: [Batch]
    });

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
