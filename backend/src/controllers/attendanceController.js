const Attendance = require('../models/Attendance');
const AttendanceSession = require('../models/AttendanceSession');
const QRCode = require('../models/QRCode');
const BatchStudent = require('../models/BatchStudent');
const Batch = require('../models/Batch');
const Student = require('../models/Student');
const { Op } = require('sequelize');

exports.createSession = async (req, res) => {
  try {
    const { batch_id, subject, faculty_id, date, start_time, end_time } = req.body;

    const batch = await Batch.findByPk(batch_id);
    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    const session = await AttendanceSession.create({
      batch_id,
      subject,
      faculty_id: faculty_id || req.user.id,
      date,
      start_time: start_time || null,
      end_time: end_time || null
    });

    res.status(201).json({ message: 'Attendance session created successfully', session });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.markAttendanceQR = async (req, res) => {
  try {
    const { qr_token, session_id } = req.body;

    const session = await AttendanceSession.findByPk(session_id);
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    const qrCode = await QRCode.findOne({ where: { qr_token, is_active: true } });
    if (!qrCode) {
      return res.status(404).json({ message: 'Invalid QR code' });
    }

    const existing = await Attendance.findOne({
      where: { session_id, student_id: qrCode.student_id }
    });
    if (existing) {
      return res.status(409).json({ message: 'Attendance already marked' });
    }

    const attendance = await Attendance.create({
      session_id,
      student_id: qrCode.student_id,
      status: 'Present',
      marked_by: 'QR',
      marked_at: new Date()
    });

    res.status(201).json({ message: 'Attendance marked successfully', attendance });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.markAttendanceManual = async (req, res) => {
  try {
    const { session_id, attendance } = req.body;

    const session = await AttendanceSession.findByPk(session_id);
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    const records = [];
    for (const record of attendance) {
      const existing = await Attendance.findOne({
        where: { session_id, student_id: record.student_id }
      });
      
      if (!existing) {
        const att = await Attendance.create({
          session_id,
          student_id: record.student_id,
          status: record.status,
          marked_by: 'Manual',
          marked_at: new Date()
        });
        records.push(att);
      }
    }

    res.status(201).json({ message: 'Attendance marked successfully', saved: records.length });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getBatchAttendance = async (req, res) => {
  try {
    const { batchId } = req.params;
    const { date } = req.query;

    const where = { batch_id: batchId };
    if (date) where.date = date;

    const sessions = await AttendanceSession.findAll({
      where,
      order: [['date', 'DESC']]
    });

    res.json({ sessions });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getStudentAttendance = async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const student = await Student.findByPk(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const attendance = await Attendance.findAll({
      where: { student_id: studentId },
      order: [['created_at', 'DESC']],
      limit: 100
    });

    res.json({ attendance });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getAttendanceAnalytics = async (req, res) => {
  try {
    const sequelize = require('../config/database');
    const [results] = await sequelize.query(`
      SELECT 
        s.id, s.name, s.admission_no,
        COUNT(a.id) as total_classes,
        SUM(CASE WHEN a.status = 'Present' THEN 1 ELSE 0 END) as present_count,
        ROUND((SUM(CASE WHEN a.status = 'Present' THEN 1 ELSE 0 END) / COUNT(a.id)) * 100, 2) as attendance_percentage
      FROM students s
      LEFT JOIN attendance a ON s.id = a.student_id
      WHERE s.branch_id = ?
      GROUP BY s.id, s.name, s.admission_no
      HAVING attendance_percentage < 75
      ORDER BY attendance_percentage ASC
    `, { replacements: [req.user.branch_id] });

    res.json({ atRiskStudents: results });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.generateQRCode = async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const student = await Student.findByPk(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const { v4: uuidv4 } = require('uuid');
    const qrcode = require('qrcode');

    const qr_token = uuidv4();
    const qr_image_url = await qrcode.toDataURL(qr_token);

    const qrCode = await QRCode.create({
      student_id: studentId,
      qr_token,
      qr_image_url,
      is_active: true
    });

    res.status(201).json({ message: 'QR code generated successfully', qrCode });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getQRCode = async (req, res) => {
  try {
    const { studentId } = req.params;
    const qrCode = await QRCode.findOne({ where: { student_id: studentId, is_active: true } });
    
    if (!qrCode) {
      return res.status(404).json({ message: 'QR code not found' });
    }

    res.json({ qrCode });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getAllAttendance = async (req, res) => {
  try {
    const { Attendance, Student, Batch } = require('../models');
    const records = await Attendance.findAll({
      include: [
        { model: Student, attributes: ['id', 'name', 'admission_no'] },
        { model: Batch, attributes: ['id', 'name'] }
      ],
      order: [['date', 'DESC']],
      limit: 100
    });
    res.json({ status: 'success', data: records, attendance: records });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Server error', error: error.message });
  }
};
