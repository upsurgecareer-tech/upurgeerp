const Student = require('../models/Student');
const StudentDocument = require('../models/StudentDocument');
const Admission = require('../models/Admission');
const CoursePackage = require('../models/CoursePackage');
const Batch = require('../models/Batch');
const QRCode = require('../models/QRCode');
const { Op } = require('sequelize');
const sequelize = require('../config/database');
const { generateStudentIDCard } = require('../utils/idCardService');
const { v4: uuidv4 } = require('uuid');

exports.createStudent = async (req, res) => {
  try {
    const { name, dob, mobile, email, gender, address, parent_name, parent_mobile, lead_id } = req.body;
    const branch_id = req.user.branch_id;

    // Generate admission number
    const count = await Student.count({ where: { branch_id } });
    const admission_no = `ADM${branch_id}${String(count + 1).padStart(5, '0')}`;

    const student = await Student.create({
      branch_id,
      lead_id,
      admission_no,
      name,
      dob,
      mobile,
      email,
      gender,
      address,
      parent_name,
      parent_mobile
    });

    res.status(201).json({ message: 'Student registered successfully', student });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getStudents = async (req, res) => {
  try {
    const { search, status, batch_id, course_id, fee_status, attendance_filter } = req.query;
    const where = { branch_id: req.user.branch_id };

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { mobile: { [Op.like]: `%${search}%` } },
        { admission_no: { [Op.like]: `%${search}%` } }
      ];
    }

    if (status) {
      where.status = status;
    }

    const students = await Student.findAll({
      where,
      include: [
        {
          model: Admission,
          as: 'admissions',
          include: [
            { model: CoursePackage, as: 'coursePackage' },
            { model: Batch, as: 'batch' }
          ],
          where: batch_id || course_id ? {
            ...(batch_id && { batch_id }),
            ...(course_id && { course_package_id: course_id })
          } : undefined,
          required: false // Changed to false to include students without admissions
        }
      ],
      order: [['created_at', 'DESC']]
    });

    // Add attendance and fee info to each student
    const Attendance = require('../models/Attendance');
    const FeePayment = require('../models/FeePayment');

    const studentsWithDetails = await Promise.all(students.map(async (student) => {
      try {
        const studentData = student.toJSON();

        // Get attendance
        const attendanceRecords = await Attendance.findAll({
          where: { student_id: student.id }
        });
        const totalClasses = attendanceRecords.length;
        const presentClasses = attendanceRecords.filter(a => a.status === 'Present').length;
        const attendancePercentage = totalClasses > 0 ? ((presentClasses / totalClasses) * 100).toFixed(2) : 0;

        // Get fee info
        const feePayments = await FeePayment.findAll({
          where: { student_id: student.id }
        });
        const totalPaid = feePayments.reduce((sum, payment) => sum + parseFloat(payment.amount_paid || 0), 0);
        const totalFee = studentData.admissions?.[0]?.total_fee || 0;
        const pendingFee = totalFee - totalPaid;

        return {
          ...studentData,
          attendance_percentage: attendancePercentage,
          fee_status: pendingFee > 0 ? 'Pending' : 'Paid',
          pending_fee: pendingFee
        };
      } catch (err) {
        console.error(`Error processing student ${student.id}:`, err);
        return student.toJSON();
      }
    }));

    // Apply additional filters
    let filteredStudents = studentsWithDetails;

    if (fee_status) {
      filteredStudents = filteredStudents.filter(s => s.fee_status === fee_status);
    }

    if (attendance_filter === 'below_75') {
      filteredStudents = filteredStudents.filter(s => parseFloat(s.attendance_percentage || 0) < 75);
    } else if (attendance_filter === 'above_90') {
      filteredStudents = filteredStudents.filter(s => parseFloat(s.attendance_percentage || 0) >= 90);
    }

    res.json({ students: filteredStudents });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getStudentById = async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id, {
      include: [
        {
          model: Admission,
          as: 'admissions',
          include: [
            { model: CoursePackage, as: 'coursePackage' },
            { model: Batch, as: 'batch' }
          ]
        }
      ]
    });
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Get attendance summary
    const Attendance = require('../models/Attendance');
    const attendanceRecords = await Attendance.findAll({
      where: { student_id: req.params.id }
    });
    
    const totalClasses = attendanceRecords.length;
    const presentClasses = attendanceRecords.filter(a => a.status === 'Present').length;
    const attendancePercentage = totalClasses > 0 ? ((presentClasses / totalClasses) * 100).toFixed(2) : 0;

    // Get fee summary
    const FeePayment = require('../models/FeePayment');
    const feePayments = await FeePayment.findAll({
      where: { student_id: req.params.id }
    });
    
    const totalPaid = feePayments.reduce((sum, payment) => sum + parseFloat(payment.amount_paid || 0), 0);
    const totalFee = student.admissions?.[0]?.total_fee || 0;
    const pendingFee = totalFee - totalPaid;

    // Get documents count
    const documentsCount = await StudentDocument.count({
      where: { student_id: req.params.id }
    });

    // Get certificates
    const Certificate = require('../models/Certificate');
    const certificates = await Certificate.findAll({
      where: { student_id: req.params.id }
    });

    res.json({
      student,
      attendance: {
        total: totalClasses,
        present: presentClasses,
        percentage: attendancePercentage
      },
      fees: {
        total: totalFee,
        paid: totalPaid,
        pending: pendingFee,
        status: pendingFee > 0 ? 'Pending' : 'Paid'
      },
      documents: documentsCount,
      certificates: certificates.length,
      certificateEligible: attendancePercentage >= 75 && pendingFee <= 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateStudent = async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    await student.update(req.body);
    res.json({ message: 'Student updated successfully', student });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    await student.destroy();
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.uploadDocument = async (req, res) => {
  try {
    const { student_id } = req.params;
    const { document_type } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const document = await StudentDocument.create({
      student_id,
      document_type,
      file_url: `/uploads/documents/${req.file.filename}`,
      uploaded_by: req.user.id
    });

    res.status(201).json({ message: 'Document uploaded successfully', document });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getDocuments = async (req, res) => {
  try {
    const { student_id } = req.params;
    const documents = await StudentDocument.findAll({ where: { student_id } });
    res.json({ documents });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteDocument = async (req, res) => {
  try {
    const document = await StudentDocument.findByPk(req.params.docId);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    await document.destroy();
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Generate Student ID Card
exports.generateIDCard = async (req, res) => {
  try {
    const { id } = req.params;

    // Get student details
    const student = await Student.findByPk(id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Get admission and course details
    const admission = await Admission.findOne({
      where: { student_id: id },
      include: [
        { model: CoursePackage, as: 'coursePackage' },
        { model: Batch, as: 'batch' }
      ],
      order: [['created_at', 'DESC']]
    });

    // Get or create QR code
    let qrRecord = await QRCode.findOne({ where: { student_id: id } });
    if (!qrRecord) {
      const qrToken = uuidv4();
      qrRecord = await QRCode.create({
        student_id: id,
        qr_token: qrToken,
        is_active: true
      });
    }

    // Prepare ID card data
    const idCardData = {
      studentId: student.id,
      studentName: student.name,
      admissionNo: student.admission_no,
      courseName: admission?.coursePackage?.name || 'N/A',
      batchName: admission?.batch?.name || null,
      mobile: student.mobile,
      email: student.email,
      photoUrl: student.photo_url,
      validUpto: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toLocaleDateString('en-IN'),
      qrToken: qrRecord.qr_token,
      instituteName: process.env.INSTITUTE_NAME || 'UpsurgeERP Institute',
      instituteAddress: process.env.INSTITUTE_ADDRESS || 'Address Line 1, City, State',
      institutePhone: process.env.INSTITUTE_PHONE || 'N/A'
    };

    // Generate ID card PDF
    const idCardUrl = await generateStudentIDCard(idCardData);

    res.status(201).json({
      message: 'ID Card generated successfully',
      idCardUrl,
      downloadUrl: `${process.env.APP_URL || 'http://localhost:3000'}${idCardUrl}`
    });
  } catch (error) {
    console.error('ID Card generation error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Bulk Import Students from CSV
exports.bulkImport = async (req, res) => {
  try {
    const { students } = req.body; // Array of student objects
    const branch_id = req.user.branch_id;

    if (!students || !Array.isArray(students) || students.length === 0) {
      return res.status(400).json({ message: 'No students data provided' });
    }

    const results = {
      success: [],
      failed: []
    };

    for (const studentData of students) {
      try {
        // Validate required fields
        if (!studentData.name || !studentData.mobile) {
          results.failed.push({
            data: studentData,
            error: 'Name and mobile are required'
          });
          continue;
        }

        // Check if mobile already exists
        const existing = await Student.findOne({
          where: { mobile: studentData.mobile, branch_id }
        });

        if (existing) {
          results.failed.push({
            data: studentData,
            error: 'Mobile number already exists'
          });
          continue;
        }

        // Generate admission number
        const count = await Student.count({ where: { branch_id } });
        const admission_no = `ADM${branch_id}${String(count + 1).padStart(5, '0')}`;

        // Create student
        const student = await Student.create({
          branch_id,
          admission_no,
          name: studentData.name,
          mobile: studentData.mobile,
          email: studentData.email || null,
          dob: studentData.dob || null,
          gender: studentData.gender || 'Male',
          address: studentData.address || null,
          parent_name: studentData.parent_name || null,
          parent_mobile: studentData.parent_mobile || null,
          status: 'Active'
        });

        results.success.push(student);
      } catch (error) {
        results.failed.push({
          data: studentData,
          error: error.message
        });
      }
    }

    res.status(201).json({
      message: `Bulk import completed. Success: ${results.success.length}, Failed: ${results.failed.length}`,
      results
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get Student Statistics
exports.getStudentStats = async (req, res) => {
  try {
    const branch_id = req.user.branch_id;

    const totalStudents = await Student.count({ where: { branch_id } });
    const activeStudents = await Student.count({ where: { branch_id, status: 'Active' } });
    const maleStudents = await Student.count({ where: { branch_id, gender: 'Male' } });
    const femaleStudents = await Student.count({ where: { branch_id, gender: 'Female' } });

    // Get course-wise enrollment
    const Admission = require('../models/Admission');
    const CoursePackage = require('../models/CoursePackage');
    
    const courseEnrollment = await Admission.findAll({
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('Admission.id')), 'count']
      ],
      include: [{
        model: CoursePackage,
        as: 'coursePackage',
        attributes: ['id', 'name']
      }],
      group: ['coursePackage.id']
    });

    res.json({
      total: totalStudents,
      active: activeStudents,
      male: maleStudents,
      female: femaleStudents,
      courseEnrollment
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
