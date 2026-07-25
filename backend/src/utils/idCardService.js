const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const qrcode = require('qrcode');

/**
 * Generate Student ID Card PDF
 * @param {object} idCardData - ID card details
 * @returns {Promise<string>} - Path to generated PDF
 */
const generateStudentIDCard = async (idCardData) => {
  try {
    const {
      studentId,
      studentName,
      admissionNo,
      courseName,
      batchName,
      mobile,
      email,
      photoUrl,
      validUpto,
      qrToken,
      instituteName,
      instituteAddress,
      institutePhone
    } = idCardData;

    // Create ID cards directory
    const idCardsDir = path.join(__dirname, '../../uploads/idcards');
    if (!fs.existsSync(idCardsDir)) {
      fs.mkdirSync(idCardsDir, { recursive: true });
    }

    const fileName = `STUDENT_ID_${admissionNo}_${Date.now()}.pdf`;
    const filePath = path.join(idCardsDir, fileName);

    // Create PDF (ID card size: 85.6mm x 53.98mm = 242.65pt x 153pt)
    const doc = new PDFDocument({
      size: [242.65, 153],
      margins: { top: 5, bottom: 5, left: 5, right: 5 }
    });

    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // Background color
    doc.rect(0, 0, 242.65, 153).fill('#ffffff');

    // Header background
    doc.rect(0, 0, 242.65, 30).fill('#1976d2');

    // Institute name
    doc.fontSize(10)
       .fillColor('#ffffff')
       .font('Helvetica-Bold')
       .text(instituteName || 'UpsurgeERP Institute', 5, 8, {
         width: 232.65,
         align: 'center'
       });

    doc.fontSize(7)
       .fillColor('#ffffff')
       .font('Helvetica')
       .text('STUDENT ID CARD', 5, 20, {
         width: 232.65,
         align: 'center'
       });

    // Photo placeholder (if photo URL provided, you can add actual image)
    doc.rect(10, 35, 50, 60).stroke('#cccccc');
    doc.fontSize(8)
       .fillColor('#999999')
       .text('PHOTO', 15, 60, {
         width: 40,
         align: 'center'
       });

    // Student details
    const detailsX = 65;
    let detailsY = 38;

    doc.fontSize(9)
       .fillColor('#333333')
       .font('Helvetica-Bold')
       .text(studentName, detailsX, detailsY, { width: 165 });

    detailsY += 12;
    doc.fontSize(7)
       .font('Helvetica')
       .fillColor('#666666')
       .text(`ID: ${admissionNo}`, detailsX, detailsY);

    detailsY += 10;
    doc.text(`Course: ${courseName}`, detailsX, detailsY, { width: 165 });

    if (batchName) {
      detailsY += 10;
      doc.text(`Batch: ${batchName}`, detailsX, detailsY, { width: 165 });
    }

    detailsY += 10;
    doc.text(`Mobile: ${mobile}`, detailsX, detailsY);

    if (email) {
      detailsY += 10;
      doc.text(`Email: ${email}`, detailsX, detailsY, { width: 165 });
    }

    // QR Code for attendance
    if (qrToken) {
      const qrCodePath = path.join(idCardsDir, `qr_temp_${studentId}.png`);
      const qrData = JSON.stringify({
        student_id: studentId,
        token: qrToken,
        type: 'student_id'
      });

      await qrcode.toFile(qrCodePath, qrData, {
        width: 80,
        margin: 1
      });

      doc.image(qrCodePath, 10, 100, {
        width: 40,
        height: 40
      });

      // Delete temp QR file
      setTimeout(() => {
        if (fs.existsSync(qrCodePath)) {
          fs.unlinkSync(qrCodePath);
        }
      }, 1000);
    }

    // Valid upto
    doc.fontSize(6)
       .fillColor('#999999')
       .text(`Valid Upto: ${validUpto || 'N/A'}`, 55, 105);

    // Footer
    doc.fontSize(6)
       .fillColor('#666666')
       .text(instituteAddress || 'Institute Address', 55, 120, {
         width: 175,
         align: 'left'
       });

    doc.text(`Ph: ${institutePhone || 'N/A'}`, 55, 130, {
       width: 175,
       align: 'left'
    });

    // Border
    doc.rect(2, 2, 238.65, 149).stroke('#1976d2');

    doc.end();

    await new Promise((resolve, reject) => {
      stream.on('finish', resolve);
      stream.on('error', reject);
    });

    console.log(`✅ Student ID Card generated: ${fileName}`);

    return `/uploads/idcards/${fileName}`;
  } catch (error) {
    console.error('❌ Student ID Card generation failed:', error);
    throw error;
  }
};

/**
 * Generate Staff ID Card PDF
 * @param {object} idCardData - ID card details
 * @returns {Promise<string>} - Path to generated PDF
 */
const generateStaffIDCard = async (idCardData) => {
  try {
    const {
      userId,
      staffName,
      employeeId,
      designation,
      department,
      mobile,
      email,
      photoUrl,
      validUpto,
      qrToken,
      instituteName,
      instituteAddress,
      institutePhone
    } = idCardData;

    const idCardsDir = path.join(__dirname, '../../uploads/idcards');
    if (!fs.existsSync(idCardsDir)) {
      fs.mkdirSync(idCardsDir, { recursive: true });
    }

    const fileName = `STAFF_ID_${employeeId}_${Date.now()}.pdf`;
    const filePath = path.join(idCardsDir, fileName);

    const doc = new PDFDocument({
      size: [242.65, 153],
      margins: { top: 5, bottom: 5, left: 5, right: 5 }
    });

    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // Background
    doc.rect(0, 0, 242.65, 153).fill('#ffffff');

    // Header background (different color for staff)
    doc.rect(0, 0, 242.65, 30).fill('#4caf50');

    // Institute name
    doc.fontSize(10)
       .fillColor('#ffffff')
       .font('Helvetica-Bold')
       .text(instituteName || 'UpsurgeERP Institute', 5, 8, {
         width: 232.65,
         align: 'center'
       });

    doc.fontSize(7)
       .fillColor('#ffffff')
       .font('Helvetica')
       .text('STAFF ID CARD', 5, 20, {
         width: 232.65,
         align: 'center'
       });

    // Photo placeholder
    doc.rect(10, 35, 50, 60).stroke('#cccccc');
    doc.fontSize(8)
       .fillColor('#999999')
       .text('PHOTO', 15, 60, {
         width: 40,
         align: 'center'
       });

    // Staff details
    const detailsX = 65;
    let detailsY = 38;

    doc.fontSize(9)
       .fillColor('#333333')
       .font('Helvetica-Bold')
       .text(staffName, detailsX, detailsY, { width: 165 });

    detailsY += 12;
    doc.fontSize(7)
       .font('Helvetica')
       .fillColor('#666666')
       .text(`ID: ${employeeId}`, detailsX, detailsY);

    detailsY += 10;
    doc.text(`Designation: ${designation}`, detailsX, detailsY, { width: 165 });

    if (department) {
      detailsY += 10;
      doc.text(`Dept: ${department}`, detailsX, detailsY, { width: 165 });
    }

    detailsY += 10;
    doc.text(`Mobile: ${mobile}`, detailsX, detailsY);

    if (email) {
      detailsY += 10;
      doc.text(`Email: ${email}`, detailsX, detailsY, { width: 165 });
    }

    // QR Code
    if (qrToken) {
      const qrCodePath = path.join(idCardsDir, `qr_temp_staff_${userId}.png`);
      const qrData = JSON.stringify({
        user_id: userId,
        token: qrToken,
        type: 'staff_id'
      });

      await qrcode.toFile(qrCodePath, qrData, {
        width: 80,
        margin: 1
      });

      doc.image(qrCodePath, 10, 100, {
        width: 40,
        height: 40
      });

      setTimeout(() => {
        if (fs.existsSync(qrCodePath)) {
          fs.unlinkSync(qrCodePath);
        }
      }, 1000);
    }

    // Valid upto
    doc.fontSize(6)
       .fillColor('#999999')
       .text(`Valid Upto: ${validUpto || 'N/A'}`, 55, 105);

    // Footer
    doc.fontSize(6)
       .fillColor('#666666')
       .text(instituteAddress || 'Institute Address', 55, 120, {
         width: 175,
         align: 'left'
       });

    doc.text(`Ph: ${institutePhone || 'N/A'}`, 55, 130, {
       width: 175,
       align: 'left'
    });

    // Border
    doc.rect(2, 2, 238.65, 149).stroke('#4caf50');

    doc.end();

    await new Promise((resolve, reject) => {
      stream.on('finish', resolve);
      stream.on('error', reject);
    });

    console.log(`✅ Staff ID Card generated: ${fileName}`);

    return `/uploads/idcards/${fileName}`;
  } catch (error) {
    console.error('❌ Staff ID Card generation failed:', error);
    throw error;
  }
};

module.exports = {
  generateStudentIDCard,
  generateStaffIDCard
};
