const Certificate = require('../models/Certificate');
const Student = require('../models/Student');
const CoursePackage = require('../models/CoursePackage');
const Admission = require('../models/Admission');
const { v4: uuidv4 } = require('uuid');
const { generateCertificatePDF } = require('../utils/certificateService');
const { sendEmail } = require('../utils/emailService');
const path = require('path');
const fs = require('fs');

exports.generateCertificate = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { course_package_id, grade, percentage } = req.body;

    // Get student details
    const student = await Student.findByPk(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Get course details
    const course = await CoursePackage.findByPk(course_package_id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Get admission details
    const admission = await Admission.findOne({
      where: { student_id: studentId, course_package_id }
    });

    // Check if certificate already exists
    const existingCert = await Certificate.findOne({
      where: { student_id: studentId, course_package_id }
    });

    if (existingCert) {
      return res.status(409).json({ 
        message: 'Certificate already exists for this course',
        certificate: existingCert
      });
    }

    // Generate certificate number
    const count = await Certificate.count();
    const certificate_no = `CERT${String(count + 1).padStart(6, '0')}`;
    const qr_token = uuidv4();

    // Prepare certificate data
    const certificateData = {
      certificateNo: certificate_no,
      studentName: student.name,
      courseName: course.name,
      issueDate: new Date(),
      completionDate: admission ? admission.created_at : new Date(),
      grade: grade || null,
      percentage: percentage || null,
      instituteName: process.env.INSTITUTE_NAME || 'UpsurgeERP Institute',
      instituteAddress: process.env.INSTITUTE_ADDRESS || 'Address Line 1, City, State',
      principalName: process.env.PRINCIPAL_NAME || 'Principal Name',
      qrToken: qr_token
    };

    // Generate PDF
    const certificateUrl = await generateCertificatePDF(certificateData);

    // Save certificate to database
    const certificate = await Certificate.create({
      student_id: studentId,
      course_package_id,
      certificate_no,
      issue_date: new Date(),
      certificate_url: certificateUrl,
      qr_token,
      issued_by: req.user.id
    });

    // Send certificate via email (if email exists)
    if (student.email) {
      try {
        const emailHtml = `
          <div style="font-family: Arial, sans-serif;">
            <h2>Congratulations ${student.name}!</h2>
            <p>Your course completion certificate is ready.</p>
            <p><strong>Course:</strong> ${course.name}</p>
            <p><strong>Certificate No:</strong> ${certificate_no}</p>
            <p>Please find your certificate attached or download it from the student portal.</p>
            <p>Certificate URL: ${process.env.APP_URL || 'http://localhost:3000'}${certificateUrl}</p>
            <p>Best Regards,<br>${process.env.INSTITUTE_NAME || 'UpsurgeERP Institute'}</p>
          </div>
        `;
        
        await sendEmail(
          student.email,
          `Certificate of Completion - ${course.name}`,
          emailHtml
        );
      } catch (emailError) {
        console.error('Failed to send certificate email:', emailError);
      }
    }

    res.status(201).json({ 
      message: 'Certificate generated successfully', 
      certificate,
      downloadUrl: certificateUrl
    });
  } catch (error) {
    console.error('Certificate generation error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getStudentCertificates = async (req, res) => {
  try {
    const { studentId } = req.params;
    const certificates = await Certificate.findAll({
      where: { student_id: studentId },
      order: [['created_at', 'DESC']]
    });
    res.json({ certificates });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.verifyCertificate = async (req, res) => {
  try {
    const { qrToken } = req.params;
    const certificate = await Certificate.findOne({ where: { qr_token: qrToken } });

    if (!certificate) {
      return res.status(404).json({ message: 'Certificate not found', valid: false });
    }

    const student = await Student.findByPk(certificate.student_id);
    const course = await CoursePackage.findByPk(certificate.course_package_id);

    res.json({
      valid: true,
      certificate_no: certificate.certificate_no,
      student_name: student.name,
      course_name: course.name,
      issue_date: certificate.issue_date
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.downloadCertificate = async (req, res) => {
  try {
    const certificate = await Certificate.findByPk(req.params.id);
    if (!certificate) {
      return res.status(404).json({ message: 'Certificate not found' });
    }

    if (!certificate.certificate_url) {
      return res.status(404).json({ message: 'Certificate PDF not found' });
    }

    const filePath = path.join(__dirname, '../../', certificate.certificate_url);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Certificate file not found on server' });
    }

    // Set headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Certificate_${certificate.certificate_no}.pdf"`);
    
    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Certificate download error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
