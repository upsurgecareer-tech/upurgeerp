const nodemailer = require('nodemailer');

// Initialize Email Transporter
let emailTransporter = null;

const initializeEmailService = () => {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (smtpHost && smtpPort && smtpUser && smtpPass) {
    emailTransporter = nodemailer.createTransport({
      host: smtpHost,
      port: parseInt(smtpPort),
      secure: smtpPort === '465', // true for 465, false for other ports
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    });
    console.log('✅ Email Service initialized');
  } else {
    console.warn('⚠️ Email credentials not configured. Email features will be disabled.');
  }
};

// Initialize on module load
initializeEmailService();

/**
 * Send Email to single recipient
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - Email HTML content
 * @param {string} text - Plain text content (optional)
 * @returns {Promise<object>} - Email delivery result
 */
const sendEmail = async (to, subject, html, text = null) => {
  try {
    if (!emailTransporter) {
      console.warn('Email not sent - SMTP not configured');
      return {
        success: false,
        error: 'Email service not configured',
        mock: true
      };
    }

    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: to,
      subject: subject,
      html: html,
      text: text || html.replace(/<[^>]*>/g, '') // Strip HTML tags for text version
    };

    const result = await emailTransporter.sendMail(mailOptions);

    console.log(`✅ Email sent to ${to}: ${result.messageId}`);

    return {
      success: true,
      messageId: result.messageId,
      to: to,
      sentAt: new Date()
    };
  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
    return {
      success: false,
      error: error.message,
      to: to
    };
  }
};

/**
 * Send bulk emails to multiple recipients
 * @param {Array<{email: string, subject: string, html: string}>} recipients
 * @returns {Promise<Array>} - Array of results
 */
const sendBulkEmail = async (recipients) => {
  try {
    if (!emailTransporter) {
      console.warn('Bulk email not sent - SMTP not configured');
      return recipients.map(r => ({
        email: r.email,
        success: false,
        error: 'Email service not configured',
        mock: true
      }));
    }

    const results = [];

    for (const recipient of recipients) {
      const result = await sendEmail(recipient.email, recipient.subject, recipient.html);
      results.push({
        email: recipient.email,
        ...result
      });

      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    const successCount = results.filter(r => r.success).length;
    console.log(`✅ Bulk Email: ${successCount}/${recipients.length} sent successfully`);

    return results;
  } catch (error) {
    console.error('❌ Bulk email failed:', error.message);
    throw error;
  }
};

/**
 * Send email with template variables
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} template - HTML template with {variables}
 * @param {object} variables - Object with variable values
 * @returns {Promise<object>} - Email delivery result
 */
const sendTemplateEmail = async (to, subject, template, variables) => {
  try {
    // Replace template variables
    let html = template;
    let finalSubject = subject;

    for (const [key, value] of Object.entries(variables)) {
      html = html.replace(new RegExp(`{${key}}`, 'g'), value);
      finalSubject = finalSubject.replace(new RegExp(`{${key}}`, 'g'), value);
    }

    return await sendEmail(to, finalSubject, html);
  } catch (error) {
    console.error('❌ Template email failed:', error.message);
    return {
      success: false,
      error: error.message,
      to: to
    };
  }
};

/**
 * Send Fee Receipt Email
 * @param {string} email - Student/Parent email
 * @param {object} data - Receipt data
 */
const sendFeeReceiptEmail = async (email, data) => {
  const subject = `Fee Receipt - ${data.receiptNo}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1976d2;">Fee Payment Receipt</h2>
      <p>Dear ${data.studentName},</p>
      <p>Thank you for your payment. Here are the details:</p>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr style="background-color: #f5f5f5;">
          <td style="padding: 10px; border: 1px solid #ddd;"><strong>Receipt No:</strong></td>
          <td style="padding: 10px; border: 1px solid #ddd;">${data.receiptNo}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd;"><strong>Date:</strong></td>
          <td style="padding: 10px; border: 1px solid #ddd;">${data.date}</td>
        </tr>
        <tr style="background-color: #f5f5f5;">
          <td style="padding: 10px; border: 1px solid #ddd;"><strong>Amount Paid:</strong></td>
          <td style="padding: 10px; border: 1px solid #ddd;">₹${data.amount}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd;"><strong>Payment Mode:</strong></td>
          <td style="padding: 10px; border: 1px solid #ddd;">${data.paymentMode}</td>
        </tr>
        <tr style="background-color: #f5f5f5;">
          <td style="padding: 10px; border: 1px solid #ddd;"><strong>Balance Due:</strong></td>
          <td style="padding: 10px; border: 1px solid #ddd;">₹${data.balanceDue || 0}</td>
        </tr>
      </table>
      <p>Thank you for your payment!</p>
      <p style="color: #666; font-size: 12px;">
        This is an auto-generated email. Please do not reply.<br>
        ${data.instituteName}
      </p>
    </div>
  `;
  return await sendEmail(email, subject, html);
};

/**
 * Send Fee Reminder Email
 * @param {string} email - Student/Parent email
 * @param {object} data - Fee reminder data
 */
const sendFeeReminderEmail = async (email, data) => {
  const subject = `Fee Payment Reminder - Due on ${data.dueDate}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #f44336;">Fee Payment Reminder</h2>
      <p>Dear ${data.studentName},</p>
      <p>This is a reminder that your fee payment of <strong>₹${data.amount}</strong> is due on <strong>${data.dueDate}</strong>.</p>
      <p>Please make the payment at the earliest to avoid any late fees.</p>
      <p>You can pay online or visit our office during working hours.</p>
      <p>Thank you!</p>
      <p style="color: #666; font-size: 12px;">
        ${data.instituteName}<br>
        Contact: ${data.institutePhone || ''}
      </p>
    </div>
  `;
  return await sendEmail(email, subject, html);
};

/**
 * Send Exam Reminder Email
 * @param {string} email - Student email
 * @param {object} data - Exam data
 */
const sendExamReminderEmail = async (email, data) => {
  const subject = `Exam Reminder - ${data.examName}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1976d2;">Exam Reminder</h2>
      <p>Dear ${data.studentName},</p>
      <p>This is a reminder for your upcoming exam:</p>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr style="background-color: #f5f5f5;">
          <td style="padding: 10px; border: 1px solid #ddd;"><strong>Exam:</strong></td>
          <td style="padding: 10px; border: 1px solid #ddd;">${data.examName}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd;"><strong>Date:</strong></td>
          <td style="padding: 10px; border: 1px solid #ddd;">${data.examDate}</td>
        </tr>
        <tr style="background-color: #f5f5f5;">
          <td style="padding: 10px; border: 1px solid #ddd;"><strong>Time:</strong></td>
          <td style="padding: 10px; border: 1px solid #ddd;">${data.examTime}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd;"><strong>Duration:</strong></td>
          <td style="padding: 10px; border: 1px solid #ddd;">${data.duration} minutes</td>
        </tr>
      </table>
      <p>All the best for your exam!</p>
      <p style="color: #666; font-size: 12px;">
        ${data.instituteName}
      </p>
    </div>
  `;
  return await sendEmail(email, subject, html);
};

/**
 * Send Admission Confirmation Email
 * @param {string} email - Student email
 * @param {object} data - Admission data
 */
const sendAdmissionConfirmationEmail = async (email, data) => {
  const subject = `Admission Confirmed - Welcome to ${data.instituteName}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4caf50;">🎉 Congratulations!</h2>
      <p>Dear ${data.studentName},</p>
      <p>Your admission has been confirmed. Welcome to ${data.instituteName}!</p>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr style="background-color: #f5f5f5;">
          <td style="padding: 10px; border: 1px solid #ddd;"><strong>Admission No:</strong></td>
          <td style="padding: 10px; border: 1px solid #ddd;">${data.admissionNo}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd;"><strong>Course:</strong></td>
          <td style="padding: 10px; border: 1px solid #ddd;">${data.courseName}</td>
        </tr>
        <tr style="background-color: #f5f5f5;">
          <td style="padding: 10px; border: 1px solid #ddd;"><strong>Batch:</strong></td>
          <td style="padding: 10px; border: 1px solid #ddd;">${data.batchName || 'TBA'}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd;"><strong>Start Date:</strong></td>
          <td style="padding: 10px; border: 1px solid #ddd;">${data.startDate || 'TBA'}</td>
        </tr>
      </table>
      <p>Please visit our office to complete the remaining formalities.</p>
      <p>We look forward to seeing you!</p>
      <p style="color: #666; font-size: 12px;">
        ${data.instituteName}<br>
        Contact: ${data.institutePhone || ''}
      </p>
    </div>
  `;
  return await sendEmail(email, subject, html);
};

/**
 * Send Result Notification Email
 * @param {string} email - Student email
 * @param {object} data - Result data
 */
const sendResultNotificationEmail = async (email, data) => {
  const subject = `Exam Results Published - ${data.examName}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1976d2;">Exam Results</h2>
      <p>Dear ${data.studentName},</p>
      <p>Your exam results for <strong>${data.examName}</strong> have been published.</p>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr style="background-color: #f5f5f5;">
          <td style="padding: 10px; border: 1px solid #ddd;"><strong>Marks Obtained:</strong></td>
          <td style="padding: 10px; border: 1px solid #ddd;">${data.marksObtained}/${data.totalMarks}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd;"><strong>Percentage:</strong></td>
          <td style="padding: 10px; border: 1px solid #ddd;">${data.percentage}%</td>
        </tr>
        <tr style="background-color: #f5f5f5;">
          <td style="padding: 10px; border: 1px solid #ddd;"><strong>Grade:</strong></td>
          <td style="padding: 10px; border: 1px solid #ddd;">${data.grade}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd;"><strong>Result:</strong></td>
          <td style="padding: 10px; border: 1px solid #ddd; color: ${data.result === 'Pass' ? '#4caf50' : '#f44336'};">
            <strong>${data.result}</strong>
          </td>
        </tr>
      </table>
      <p>Login to your portal to view detailed results.</p>
      <p style="color: #666; font-size: 12px;">
        ${data.instituteName}
      </p>
    </div>
  `;
  return await sendEmail(email, subject, html);
};

module.exports = {
  sendEmail,
  sendBulkEmail,
  sendTemplateEmail,
  sendFeeReceiptEmail,
  sendFeeReminderEmail,
  sendExamReminderEmail,
  sendAdmissionConfirmationEmail,
  sendResultNotificationEmail
};
