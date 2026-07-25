const QRCode = require('../models/QRCode');
const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const AttendanceSession = require('../models/AttendanceSession');
const qrcode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

// Generate QR Code for Student
exports.generateQRCode = async (req, res) => {
  try {
    const { studentId } = req.params;

    // Check if student exists
    const student = await Student.findByPk(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check if QR already exists
    let qrRecord = await QRCode.findOne({ where: { student_id: studentId } });

    if (qrRecord && qrRecord.is_active) {
      return res.status(200).json({
        message: 'QR Code already exists',
        qrCode: qrRecord,
        qrImageUrl: `/uploads/qrcodes/${qrRecord.qr_token}.png`
      });
    }

    // Generate unique token
    const qrToken = uuidv4();

    // Create QR code data (JSON string)
    const qrData = JSON.stringify({
      student_id: studentId,
      token: qrToken,
      generated_at: new Date().toISOString()
    });

    // Generate QR code image
    const uploadsDir = path.join(__dirname, '../../uploads/qrcodes');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const qrImagePath = path.join(uploadsDir, `${qrToken}.png`);
    await qrcode.toFile(qrImagePath, qrData, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    // Save to database
    if (qrRecord) {
      // Update existing
      await qrRecord.update({
        qr_token: qrToken,
        qr_image_url: `/uploads/qrcodes/${qrToken}.png`,
        is_active: true
      });
    } else {
      // Create new
      qrRecord = await QRCode.create({
        student_id: studentId,
        qr_token: qrToken,
        qr_image_url: `/uploads/qrcodes/${qrToken}.png`,
        is_active: true
      });
    }

    res.status(201).json({
      message: 'QR Code generated successfully',
      qrCode: qrRecord,
      qrImageUrl: `/uploads/qrcodes/${qrToken}.png`
    });
  } catch (error) {
    console.error('QR Generation Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get QR Code for Student
exports.getQRCode = async (req, res) => {
  try {
    const { studentId } = req.params;

    const qrRecord = await QRCode.findOne({
      where: { student_id: studentId, is_active: true },
      include: [{ model: Student, as: 'student' }]
    });

    if (!qrRecord) {
      return res.status(404).json({ message: 'QR Code not found' });
    }

    res.json({
      qrCode: qrRecord,
      qrImageUrl: qrRecord.qr_image_url
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Validate QR Token (for Scanner)
exports.validateQRToken = async (req, res) => {
  try {
    const { token } = req.params;

    const qrRecord = await QRCode.findOne({
      where: { qr_token: token, is_active: true },
      include: [{ model: Student, as: 'student' }]
    });

    if (!qrRecord) {
      return res.status(404).json({ 
        valid: false,
        message: 'Invalid or expired QR Code' 
      });
    }

    res.json({
      valid: true,
      student: qrRecord.student,
      qrCode: qrRecord
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Mark Attendance via QR Scan
exports.markAttendanceViaQR = async (req, res) => {
  try {
    const { qr_token, session_id } = req.body;

    // Validate QR Token
    const qrRecord = await QRCode.findOne({
      where: { qr_token: qr_token, is_active: true }
    });

    if (!qrRecord) {
      return res.status(404).json({ message: 'Invalid QR Code' });
    }

    // Check if session exists
    const session = await AttendanceSession.findByPk(session_id);
    if (!session) {
      return res.status(404).json({ message: 'Attendance session not found' });
    }

    // Check if already marked
    const existingAttendance = await Attendance.findOne({
      where: {
        session_id: session_id,
        student_id: qrRecord.student_id
      }
    });

    if (existingAttendance) {
      return res.status(409).json({ 
        message: 'Attendance already marked for this session',
        attendance: existingAttendance
      });
    }

    // Mark attendance
    const attendance = await Attendance.create({
      session_id: session_id,
      student_id: qrRecord.student_id,
      status: 'Present',
      marked_by: 'QR',
      marked_at: new Date()
    });

    // Get student details
    const student = await Student.findByPk(qrRecord.student_id);

    res.status(201).json({
      message: 'Attendance marked successfully',
      attendance,
      student: {
        id: student.id,
        name: student.name,
        admission_no: student.admission_no
      }
    });
  } catch (error) {
    console.error('QR Attendance Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Regenerate QR Code
exports.regenerateQRCode = async (req, res) => {
  try {
    const { studentId } = req.params;

    // Deactivate old QR
    await QRCode.update(
      { is_active: false },
      { where: { student_id: studentId } }
    );

    // Generate new QR
    return exports.generateQRCode(req, res);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Bulk Generate QR Codes for Batch
exports.bulkGenerateQRCodes = async (req, res) => {
  try {
    const { batch_id } = req.body;

    // Get all students in batch
    const students = await Student.findAll({
      include: [{
        model: require('../models/Admission'),
        as: 'admissions',
        where: { batch_id: batch_id }
      }]
    });

    if (students.length === 0) {
      return res.status(404).json({ message: 'No students found in this batch' });
    }

    const results = [];
    const uploadsDir = path.join(__dirname, '../../uploads/qrcodes');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    for (const student of students) {
      try {
        // Check if QR already exists
        let qrRecord = await QRCode.findOne({ 
          where: { student_id: student.id } 
        });

        if (qrRecord && qrRecord.is_active) {
          results.push({
            student_id: student.id,
            student_name: student.name,
            status: 'Already exists',
            qr_image_url: qrRecord.qr_image_url
          });
          continue;
        }

        // Generate unique token
        const qrToken = uuidv4();

        // Create QR code data
        const qrData = JSON.stringify({
          student_id: student.id,
          token: qrToken,
          generated_at: new Date().toISOString()
        });

        // Generate QR code image
        const qrImagePath = path.join(uploadsDir, `${qrToken}.png`);
        await qrcode.toFile(qrImagePath, qrData, {
          width: 300,
          margin: 2
        });

        // Save to database
        if (qrRecord) {
          await qrRecord.update({
            qr_token: qrToken,
            qr_image_url: `/uploads/qrcodes/${qrToken}.png`,
            is_active: true
          });
        } else {
          qrRecord = await QRCode.create({
            student_id: student.id,
            qr_token: qrToken,
            qr_image_url: `/uploads/qrcodes/${qrToken}.png`,
            is_active: true
          });
        }

        results.push({
          student_id: student.id,
          student_name: student.name,
          status: 'Generated',
          qr_image_url: qrRecord.qr_image_url
        });
      } catch (err) {
        results.push({
          student_id: student.id,
          student_name: student.name,
          status: 'Failed',
          error: err.message
        });
      }
    }

    res.status(201).json({
      message: 'Bulk QR Code generation completed',
      total: students.length,
      results
    });
  } catch (error) {
    console.error('Bulk QR Generation Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = exports;
