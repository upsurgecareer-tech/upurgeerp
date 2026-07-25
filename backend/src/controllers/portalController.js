const Student = require('../models/Student');
const Admission = require('../models/Admission');
const Attendance = require('../models/Attendance');
const FeePayment = require('../models/FeePayment');
const FeeSchedule = require('../models/FeeSchedule');
const ExamAttempt = require('../models/ExamAttempt');
const { Op } = require('sequelize');

// Student Portal
exports.getStudentDashboard = async (req, res) => {
  try {
    const student_id = req.user.student_id;

    // Get attendance percentage
    const totalClasses = await Attendance.count({ where: { student_id } });
    const presentClasses = await Attendance.count({ 
      where: { student_id, status: 'Present' } 
    });
    const attendancePercentage = totalClasses > 0 ? ((presentClasses / totalClasses) * 100).toFixed(2) : 0;

    // Get pending fees
    const admission = await Admission.findOne({ where: { student_id } });
    const pendingSchedules = await FeeSchedule.findAll({
      where: { admission_id: admission?.id, status: 'Pending' }
    });
    const pendingFees = pendingSchedules.reduce((sum, s) => sum + parseFloat(s.amount), 0);

    // Get pending assignments
    const sequelize = require('../config/database');
    const [assignments] = await sequelize.query(`
      SELECT COUNT(*) as pending_count
      FROM assignments a
      LEFT JOIN assignment_submissions s ON a.id = s.assignment_id AND s.student_id = ?
      WHERE a.is_active = TRUE AND s.id IS NULL
    `, { replacements: [student_id] });

    res.json({
      attendancePercentage,
      pendingFees,
      pendingAssignments: assignments[0].pending_count
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getStudentProfile = async (req, res) => {
  try {
    const student_id = req.user.student_id;
    const student = await Student.findByPk(student_id);
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json({ student });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getStudentAttendance = async (req, res) => {
  try {
    const student_id = req.user.student_id;
    const { start_date, end_date } = req.query;

    const where = { student_id };
    if (start_date && end_date) {
      where.created_at = { [Op.between]: [start_date, end_date] };
    }

    const attendance = await Attendance.findAll({
      where,
      order: [['created_at', 'DESC']],
      limit: 100
    });

    res.json({ attendance });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getStudentFees = async (req, res) => {
  try {
    const student_id = req.user.student_id;
    const admission = await Admission.findOne({ where: { student_id } });

    if (!admission) {
      return res.status(404).json({ message: 'Admission not found' });
    }

    const schedules = await FeeSchedule.findAll({
      where: { admission_id: admission.id },
      order: [['due_date', 'ASC']]
    });

    const payments = await FeePayment.findAll({
      where: { admission_id: admission.id },
      order: [['payment_date', 'DESC']]
    });

    const totalPaid = payments.reduce((sum, p) => sum + parseFloat(p.amount_paid), 0);
    const totalPending = schedules
      .filter(s => s.status === 'Pending')
      .reduce((sum, s) => sum + parseFloat(s.amount), 0);

    res.json({
      admission,
      schedules,
      payments,
      totalPaid,
      totalPending
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getStudentResults = async (req, res) => {
  try {
    const student_id = req.user.student_id;
    const results = await ExamAttempt.findAll({
      where: { student_id, status: 'Submitted' },
      order: [['created_at', 'DESC']]
    });

    res.json({ results });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Parent Portal
exports.getParentDashboard = async (req, res) => {
  try {
    const parent_id = req.user.id;
    
    // Get children linked to parent
    const sequelize = require('../config/database');
    const [children] = await sequelize.query(`
      SELECT s.* FROM students s
      JOIN parent_students ps ON s.id = ps.student_id
      WHERE ps.parent_id = ?
    `, { replacements: [parent_id] });

    res.json({ children });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getChildAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const attendance = await Attendance.findAll({
      where: { student_id: id },
      order: [['created_at', 'DESC']],
      limit: 30
    });

    const totalClasses = attendance.length;
    const presentClasses = attendance.filter(a => a.status === 'Present').length;
    const attendancePercentage = totalClasses > 0 ? ((presentClasses / totalClasses) * 100).toFixed(2) : 0;

    res.json({ attendance, attendancePercentage });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getChildFees = async (req, res) => {
  try {
    const { id } = req.params;
    const admission = await Admission.findOne({ where: { student_id: id } });

    if (!admission) {
      return res.status(404).json({ message: 'Admission not found' });
    }

    const schedules = await FeeSchedule.findAll({
      where: { admission_id: admission.id },
      order: [['due_date', 'ASC']]
    });

    const payments = await FeePayment.findAll({
      where: { admission_id: admission.id },
      order: [['payment_date', 'DESC']]
    });

    res.json({ admission, schedules, payments });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
