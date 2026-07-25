const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const qrcode = require('qrcode');

/**
 * Generate Certificate PDF
 * @param {object} certificateData - Certificate details
 * @returns {Promise<string>} - Path to generated PDF
 */
const generateCertificatePDF = async (certificateData) => {
  try {
    const {
      certificateNo,
      studentName,
      courseName,
      issueDate,
      completionDate,
      grade,
      percentage,
      instituteName,
      instituteAddress,
      principalName,
      qrToken
    } = certificateData;

    // Create certificates directory if not exists
    const certificatesDir = path.join(__dirname, '../../uploads/certificates');
    if (!fs.existsSync(certificatesDir)) {
      fs.mkdirSync(certificatesDir, { recursive: true });
    }

    const fileName = `CERT_${certificateNo}_${Date.now()}.pdf`;
    const filePath = path.join(certificatesDir, fileName);

    // Create PDF document (A4 landscape)
    const doc = new PDFDocument({
      size: 'A4',
      layout: 'landscape',
      margins: { top: 50, bottom: 50, left: 50, right: 50 }
    });

    // Pipe to file
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // Add decorative border
    doc.lineWidth(3);
    doc.strokeColor('#1976d2');
    doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).stroke();

    doc.lineWidth(1);
    doc.strokeColor('#1976d2');
    doc.rect(30, 30, doc.page.width - 60, doc.page.height - 60).stroke();

    // Add decorative corners
    const cornerSize = 30;
    doc.lineWidth(2);
    doc.strokeColor('#ffc107');
    
    // Top-left corner
    doc.moveTo(40, 40).lineTo(40 + cornerSize, 40).stroke();
    doc.moveTo(40, 40).lineTo(40, 40 + cornerSize).stroke();
    
    // Top-right corner
    doc.moveTo(doc.page.width - 40, 40).lineTo(doc.page.width - 40 - cornerSize, 40).stroke();
    doc.moveTo(doc.page.width - 40, 40).lineTo(doc.page.width - 40, 40 + cornerSize).stroke();
    
    // Bottom-left corner
    doc.moveTo(40, doc.page.height - 40).lineTo(40 + cornerSize, doc.page.height - 40).stroke();
    doc.moveTo(40, doc.page.height - 40).lineTo(40, doc.page.height - 40 - cornerSize).stroke();
    
    // Bottom-right corner
    doc.moveTo(doc.page.width - 40, doc.page.height - 40).lineTo(doc.page.width - 40 - cornerSize, doc.page.height - 40).stroke();
    doc.moveTo(doc.page.width - 40, doc.page.height - 40).lineTo(doc.page.width - 40, doc.page.height - 40 - cornerSize).stroke();

    // Add Institute Logo (placeholder - you can add actual logo)
    // doc.image('path/to/logo.png', doc.page.width / 2 - 40, 60, { width: 80 });

    // Add Institute Name
    doc.fontSize(24)
       .fillColor('#1976d2')
       .font('Helvetica-Bold')
       .text(instituteName || 'UpsurgeERP Institute', 50, 80, {
         align: 'center',
         width: doc.page.width - 100
       });

    // Add Institute Address
    doc.fontSize(10)
       .fillColor('#666666')
       .font('Helvetica')
       .text(instituteAddress || 'Address Line 1, City, State - PIN', 50, 110, {
         align: 'center',
         width: doc.page.width - 100
       });

    // Add "CERTIFICATE OF COMPLETION" heading
    doc.fontSize(32)
       .fillColor('#1976d2')
       .font('Helvetica-Bold')
       .text('CERTIFICATE', 50, 150, {
         align: 'center',
         width: doc.page.width - 100
       });

    doc.fontSize(20)
       .fillColor('#666666')
       .font('Helvetica')
       .text('OF COMPLETION', 50, 190, {
         align: 'center',
         width: doc.page.width - 100
       });

    // Add decorative line
    doc.moveTo(doc.page.width / 2 - 100, 220)
       .lineTo(doc.page.width / 2 + 100, 220)
       .strokeColor('#ffc107')
       .lineWidth(2)
       .stroke();

    // Add "This is to certify that"
    doc.fontSize(14)
       .fillColor('#333333')
       .font('Helvetica')
       .text('This is to certify that', 50, 240, {
         align: 'center',
         width: doc.page.width - 100
       });

    // Add Student Name (highlighted)
    doc.fontSize(28)
       .fillColor('#1976d2')
       .font('Helvetica-Bold')
       .text(studentName, 50, 270, {
         align: 'center',
         width: doc.page.width - 100
       });

    // Add underline for name
    const nameWidth = doc.widthOfString(studentName);
    doc.moveTo(doc.page.width / 2 - nameWidth / 2, 305)
       .lineTo(doc.page.width / 2 + nameWidth / 2, 305)
       .strokeColor('#1976d2')
       .lineWidth(1)
       .stroke();

    // Add completion text
    doc.fontSize(14)
       .fillColor('#333333')
       .font('Helvetica')
       .text('has successfully completed the course', 50, 320, {
         align: 'center',
         width: doc.page.width - 100
       });

    // Add Course Name
    doc.fontSize(20)
       .fillColor('#1976d2')
       .font('Helvetica-Bold')
       .text(courseName, 50, 350, {
         align: 'center',
         width: doc.page.width - 100
       });

    // Add Grade and Percentage (if provided)
    if (grade || percentage) {
      let gradeText = '';
      if (grade && percentage) {
        gradeText = `with Grade: ${grade} (${percentage}%)`;
      } else if (grade) {
        gradeText = `with Grade: ${grade}`;
      } else if (percentage) {
        gradeText = `with ${percentage}%`;
      }

      doc.fontSize(14)
         .fillColor('#4caf50')
         .font('Helvetica-Bold')
         .text(gradeText, 50, 385, {
           align: 'center',
           width: doc.page.width - 100
         });
    }

    // Add Date
    const formattedDate = new Date(issueDate).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });

    doc.fontSize(12)
       .fillColor('#666666')
       .font('Helvetica')
       .text(`Date of Issue: ${formattedDate}`, 50, 420, {
         align: 'center',
         width: doc.page.width - 100
       });

    // Add Certificate Number
    doc.fontSize(10)
       .fillColor('#999999')
       .font('Helvetica')
       .text(`Certificate No: ${certificateNo}`, 50, 440, {
         align: 'center',
         width: doc.page.width - 100
       });

    // Add QR Code for verification
    if (qrToken) {
      const qrCodePath = path.join(certificatesDir, `qr_${certificateNo}.png`);
      const verificationUrl = `${process.env.APP_URL || 'https://app.upsurgeerp.com'}/verify-certificate/${qrToken}`;
      
      await qrcode.toFile(qrCodePath, verificationUrl, {
        width: 100,
        margin: 1
      });

      doc.image(qrCodePath, doc.page.width - 130, doc.page.height - 130, {
        width: 80,
        height: 80
      });

      doc.fontSize(8)
         .fillColor('#999999')
         .text('Scan to Verify', doc.page.width - 130, doc.page.height - 45, {
           width: 80,
           align: 'center'
         });

      // Delete temporary QR code file
      setTimeout(() => {
        if (fs.existsSync(qrCodePath)) {
          fs.unlinkSync(qrCodePath);
        }
      }, 1000);
    }

    // Add Signature Section
    const signatureY = doc.page.height - 120;

    // Principal Signature
    doc.fontSize(10)
       .fillColor('#333333')
       .font('Helvetica')
       .text('_____________________', 150, signatureY, {
         width: 150,
         align: 'center'
       });

    doc.fontSize(12)
       .fillColor('#333333')
       .font('Helvetica-Bold')
       .text(principalName || 'Principal', 150, signatureY + 20, {
         width: 150,
         align: 'center'
       });

    doc.fontSize(10)
       .fillColor('#666666')
       .font('Helvetica')
       .text('Principal/Director', 150, signatureY + 40, {
         width: 150,
         align: 'center'
       });

    // Institute Seal (placeholder)
    doc.fontSize(10)
       .fillColor('#333333')
       .font('Helvetica')
       .text('_____________________', doc.page.width - 300, signatureY, {
         width: 150,
         align: 'center'
       });

    doc.fontSize(12)
       .fillColor('#333333')
       .font('Helvetica-Bold')
       .text('Institute Seal', doc.page.width - 300, signatureY + 20, {
         width: 150,
         align: 'center'
       });

    // Add footer
    doc.fontSize(8)
       .fillColor('#999999')
       .font('Helvetica')
       .text('This is a computer-generated certificate and does not require a physical signature.', 50, doc.page.height - 30, {
         align: 'center',
         width: doc.page.width - 100
       });

    // Finalize PDF
    doc.end();

    // Wait for stream to finish
    await new Promise((resolve, reject) => {
      stream.on('finish', resolve);
      stream.on('error', reject);
    });

    console.log(`✅ Certificate PDF generated: ${fileName}`);

    return `/uploads/certificates/${fileName}`;
  } catch (error) {
    console.error('❌ Certificate PDF generation failed:', error);
    throw error;
  }
};

/**
 * Generate Marksheet PDF
 * @param {object} marksheetData - Marksheet details
 * @returns {Promise<string>} - Path to generated PDF
 */
const generateMarksheetPDF = async (marksheetData) => {
  try {
    const {
      studentName,
      admissionNo,
      courseName,
      examName,
      examDate,
      subjects,
      totalMarks,
      marksObtained,
      percentage,
      grade,
      result,
      instituteName
    } = marksheetData;

    const certificatesDir = path.join(__dirname, '../../uploads/certificates');
    if (!fs.existsSync(certificatesDir)) {
      fs.mkdirSync(certificatesDir, { recursive: true });
    }

    const fileName = `MARKSHEET_${admissionNo}_${Date.now()}.pdf`;
    const filePath = path.join(certificatesDir, fileName);

    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 50, bottom: 50, left: 50, right: 50 }
    });

    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // Header
    doc.fontSize(20)
       .fillColor('#1976d2')
       .font('Helvetica-Bold')
       .text(instituteName || 'UpsurgeERP Institute', { align: 'center' });

    doc.fontSize(16)
       .fillColor('#333333')
       .text('MARKSHEET', { align: 'center' });

    doc.moveDown();

    // Student Details
    doc.fontSize(12)
       .fillColor('#333333')
       .font('Helvetica')
       .text(`Student Name: ${studentName}`, 50, 150);

    doc.text(`Admission No: ${admissionNo}`, 50, 170);
    doc.text(`Course: ${courseName}`, 50, 190);
    doc.text(`Exam: ${examName}`, 50, 210);
    doc.text(`Date: ${new Date(examDate).toLocaleDateString('en-IN')}`, 50, 230);

    doc.moveDown(2);

    // Marks Table
    const tableTop = 270;
    const tableLeft = 50;
    const colWidths = [200, 100, 100, 100];

    // Table Header
    doc.fontSize(11)
       .font('Helvetica-Bold')
       .fillColor('#ffffff')
       .rect(tableLeft, tableTop, colWidths.reduce((a, b) => a + b), 25)
       .fill('#1976d2');

    doc.fillColor('#ffffff')
       .text('Subject', tableLeft + 5, tableTop + 7, { width: colWidths[0] })
       .text('Max Marks', tableLeft + colWidths[0] + 5, tableTop + 7, { width: colWidths[1] })
       .text('Obtained', tableLeft + colWidths[0] + colWidths[1] + 5, tableTop + 7, { width: colWidths[2] })
       .text('Grade', tableLeft + colWidths[0] + colWidths[1] + colWidths[2] + 5, tableTop + 7, { width: colWidths[3] });

    // Table Rows
    let currentY = tableTop + 25;
    doc.font('Helvetica').fillColor('#333333');

    subjects.forEach((subject, index) => {
      const bgColor = index % 2 === 0 ? '#f5f5f5' : '#ffffff';
      doc.rect(tableLeft, currentY, colWidths.reduce((a, b) => a + b), 25).fill(bgColor);

      doc.fillColor('#333333')
         .text(subject.name, tableLeft + 5, currentY + 7, { width: colWidths[0] })
         .text(subject.maxMarks.toString(), tableLeft + colWidths[0] + 5, currentY + 7, { width: colWidths[1] })
         .text(subject.obtained.toString(), tableLeft + colWidths[0] + colWidths[1] + 5, currentY + 7, { width: colWidths[2] })
         .text(subject.grade || '-', tableLeft + colWidths[0] + colWidths[1] + colWidths[2] + 5, currentY + 7, { width: colWidths[3] });

      currentY += 25;
    });

    // Total Row
    doc.rect(tableLeft, currentY, colWidths.reduce((a, b) => a + b), 25).fill('#e3f2fd');
    doc.font('Helvetica-Bold')
       .fillColor('#1976d2')
       .text('TOTAL', tableLeft + 5, currentY + 7, { width: colWidths[0] })
       .text(totalMarks.toString(), tableLeft + colWidths[0] + 5, currentY + 7, { width: colWidths[1] })
       .text(marksObtained.toString(), tableLeft + colWidths[0] + colWidths[1] + 5, currentY + 7, { width: colWidths[2] });

    currentY += 40;

    // Result Summary
    doc.fontSize(12)
       .font('Helvetica')
       .fillColor('#333333')
       .text(`Percentage: ${percentage}%`, tableLeft, currentY);

    doc.text(`Grade: ${grade}`, tableLeft, currentY + 20);

    const resultColor = result === 'Pass' ? '#4caf50' : '#f44336';
    doc.fillColor(resultColor)
       .font('Helvetica-Bold')
       .text(`Result: ${result}`, tableLeft, currentY + 40);

    // Footer
    doc.fontSize(10)
       .fillColor('#999999')
       .font('Helvetica')
       .text('This is a computer-generated marksheet.', 50, doc.page.height - 50, {
         align: 'center',
         width: doc.page.width - 100
       });

    doc.end();

    await new Promise((resolve, reject) => {
      stream.on('finish', resolve);
      stream.on('error', reject);
    });

    console.log(`✅ Marksheet PDF generated: ${fileName}`);

    return `/uploads/certificates/${fileName}`;
  } catch (error) {
    console.error('❌ Marksheet PDF generation failed:', error);
    throw error;
  }
};

module.exports = {
  generateCertificatePDF,
  generateMarksheetPDF
};
