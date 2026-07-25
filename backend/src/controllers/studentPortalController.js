const Student = require('../models/Student');
const User = require('../models/User');
const Admission = require('../models/Admission');
const Attendance = require('../models/Attendance');
const FeePayment = require('../models/FeePayment');
const Certificate = require('../models/Certificate');
const StudentDocument = require('../models/StudentDocument');
const CoursePackage = require('../models/CoursePackage');
const Batch = require('../models/Batch');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Student Login
exports.studentLogin = async (req, res) => {
  try {
    const { admission_no, password } = req.body;

    // Find student by admission number
    const student = await Student.findOne({ 
      where: { admission_no },
      include: [{ model: Admission, as: 'admissions', include: [
        { model: CoursePackage, as: 'coursePackage' },
        { model: Batch, as: 'batch' }
      ]}]
    });

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check if student has user account
    let user = await User.findOne({ where: { email: student.email } });
    
    if (!user) {
      // Create user account for student if not exists
      const hashedPassword = await bcrypt.hash(password || 'student123', 10);
      user = await User.create({
        first_name: student.name.split(' ')[0],
        last_name: student.name.split(' ').slice(1).join(' ') || '',
        email: student.email || `${admission_no}@student.com`,
        password: hashedPassword,
        role_id: 5, // Student role
        branch_id: student.branch_id,
        is_active: true
      });
    } else {
      // Verify password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: 'student', student_id: student.id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      student: {
        id: student.id,
        name: student.name,
        admission_no: student.admission_no,
        email: student.email,
        mobile: student.mobile,
        photo_url: student.photo_url,
        course: student.admissions?.[0]?.coursePackage?.name,
        batch: student.admissions?.[0]?.batch?.name
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Student Dashboard
exports.getStudentDashboard = async (req, res) => {
  try {
    const student_id = req.user.student_id;

    // Get student details
    const student = await Student.findByPk(student_id, {
      include: [{
        model: Admission,
        as: 'admissions',
        include: [
          { model: CoursePackage, as: 'coursePackage' },
          { model: Batch, as: 'batch' }
        ]
      }]
    });

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Get attendance summary
    const attendanceRecords = await Attendance.findAll({
      where: { student_id }
    });
    const totalClasses = attendanceRecords.length;
    const presentClasses = attendanceRecords.filter(a => a.status === 'Present').length;
    const attendancePercentage = totalClasses > 0 ? ((presentClasses / totalClasses) * 100).toFixed(2) : 0;

    // Get fee summary
    const feePayments = await FeePayment.findAll({
      where: { student_id }
    });
    const totalPaid = feePayments.reduce((sum, payment) => sum + parseFloat(payment.amount_paid || 0), 0);
    const totalFee = student.admissions?.[0]?.total_fee || 0;
    const pendingFee = totalFee - totalPaid;

    // Get certificates
    const certificates = await Certificate.count({
      where: { student_id }
    });

    // Get documents
    const documents = await StudentDocument.count({
      where: { student_id }
    });

    // Get recent attendance (last 10)
    const recentAttendance = await Attendance.findAll({
      where: { student_id },
      order: [['attendance_date', 'DESC']],
      limit: 10
    });

    res.json({
      student: {
        id: student.id,
        name: student.name,
        admission_no: student.admission_no,
        email: student.email,
        mobile: student.mobile,
        photo_url: student.photo_url,
        status: student.status,
        course: student.admissions?.[0]?.coursePackage?.name,
        batch: student.admissions?.[0]?.batch?.name
      },
      stats: {
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
        certificates,
        documents
      },
      recentAttendance
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get Student Attendance
exports.getStudentAttendance = async (req, res) => {
  try {
    const student_id = req.user.student_id;
    const { month, year } = req.query;

    const where = { student_id };

    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      where.attendance_date = {
        [require('sequelize').Op.between]: [startDate, endDate]
      };
    }

    const attendance = await Attendance.findAll({
      where,
      include: [{ model: Batch, as: 'batch' }],
      order: [['attendance_date', 'DESC']]
    });

    const totalClasses = attendance.length;
    const presentClasses = attendance.filter(a => a.status === 'Present').length;
    const absentClasses = attendance.filter(a => a.status === 'Absent').length;
    const lateClasses = attendance.filter(a => a.status === 'Late').length;
    const percentage = totalClasses > 0 ? ((presentClasses / totalClasses) * 100).toFixed(2) : 0;

    res.json({
      summary: {
        total: totalClasses,
        present: presentClasses,
        absent: absentClasses,
        late: lateClasses,
        percentage
      },
      attendance
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get Student Assignments
exports.getStudentAssignments = async (req, res) => {
  try {
    const student_id = req.user.student_id;

    // Get student's batch
    const student = await Student.findByPk(student_id, {
      include: [{
        model: Admission,
        as: 'admissions',
        include: [{ model: Batch, as: 'batch' }]
      }]
    });

    if (!student || !student.admissions?.[0]?.batch_id) {
      return res.json({ assignments: [] });
    }

    const batch_id = student.admissions[0].batch_id;

    // Get assignments for this batch (from LMS module)
    const Assignment = require('../models/Assignment');
    const AssignmentSubmission = require('../models/AssignmentSubmission');

    const assignments = await Assignment.findAll({
      where: { batch_id },
      order: [['due_date', 'DESC']]
    });

    // Get submission status for each assignment
    const assignmentsWithStatus = await Promise.all(assignments.map(async (assignment) => {
      const submission = await AssignmentSubmission.findOne({
        where: { assignment_id: assignment.id, student_id }
      });

      return {
        ...assignment.toJSON(),
        submitted: !!submission,
        submission_date: submission?.submitted_at,
        marks: submission?.marks,
        feedback: submission?.feedback
      };
    }));

    res.json({ assignments: assignmentsWithStatus });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Submit Assignment
exports.submitAssignment = async (req, res) => {
  try {
    const student_id = req.user.student_id;
    const { assignment_id, submission_text } = req.body;
    const file_url = req.file ? `/uploads/assignments/${req.file.filename}` : null;

    const AssignmentSubmission = require('../models/AssignmentSubmission');

    // Check if already submitted
    const existing = await AssignmentSubmission.findOne({
      where: { assignment_id, student_id }
    });

    if (existing) {
      return res.status(400).json({ message: 'Assignment already submitted' });
    }

    const submission = await AssignmentSubmission.create({
      assignment_id,
      student_id,
      submission_text,
      file_url,
      submitted_at: new Date()
    });

    res.status(201).json({
      message: 'Assignment submitted successfully',
      submission
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get Study Materials / Notes
exports.getStudyMaterials = async (req, res) => {
  try {
    const student_id = req.user.student_id;

    // Get student's course
    const student = await Student.findByPk(student_id, {
      include: [{
        model: Admission,
        as: 'admissions',
        include: [{ model: CoursePackage, as: 'coursePackage' }]
      }]
    });

    if (!student || !student.admissions?.[0]?.course_package_id) {
      return res.json({ materials: [] });
    }

    const course_id = student.admissions[0].course_package_id;

    // Get study materials (from LMS module)
    const StudyMaterial = require('../models/StudyMaterial');

    const materials = await StudyMaterial.findAll({
      where: { course_id },
      order: [['created_at', 'DESC']]
    });

    res.json({ materials });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get Exam Results
exports.getExamResults = async (req, res) => {
  try {
    const student_id = req.user.student_id;

    // Get exam results
    const ExamResult = require('../models/ExamResult');
    const Exam = require('../models/Exam');

    const results = await ExamResult.findAll({
      where: { student_id },
      include: [{ model: Exam, as: 'exam' }],
      order: [['created_at', 'DESC']]
    });

    res.json({ results });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update Student Profile
exports.updateStudentProfile = async (req, res) => {
  try {
    const student_id = req.user.student_id;
    const { email, mobile, address, parent_name, parent_mobile } = req.body;

    const student = await Student.findByPk(student_id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    await student.update({
      email: email || student.email,
      mobile: mobile || student.mobile,
      address: address || student.address,
      parent_name: parent_name || student.parent_name,
      parent_mobile: parent_mobile || student.parent_mobile
    });

    res.json({
      message: 'Profile updated successfully',
      student
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get Student Certificates
exports.getStudentCertificates = async (req, res) => {
  try {
    const student_id = req.user.student_id;

    const certificates = await Certificate.findAll({
      where: { student_id },
      order: [['issue_date', 'DESC']]
    });

    res.json({ certificates });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get Student Documents
exports.getStudentDocuments = async (req, res) => {
  try {
    const student_id = req.user.student_id;

    const documents = await StudentDocument.findAll({
      where: { student_id },
      order: [['created_at', 'DESC']]
    });

    res.json({ documents });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = exports;
