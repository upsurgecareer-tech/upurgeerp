const twilio = require('twilio');

// Initialize Twilio client
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_FROM_NUMBER;

let twilioClient = null;

// Check if Twilio credentials are configured
if (accountSid && authToken && fromNumber) {
  twilioClient = twilio(accountSid, authToken);
  console.log('✅ Twilio SMS Gateway initialized');
} else {
  console.warn('⚠️ Twilio credentials not configured. SMS features will be disabled.');
}

/**
 * Send SMS to single recipient
 * @param {string} to - Recipient phone number (with country code)
 * @param {string} message - SMS message text
 * @returns {Promise<object>} - SMS delivery result
 */
const sendSMS = async (to, message) => {
  try {
    if (!twilioClient) {
      console.warn('SMS not sent - Twilio not configured');
      return {
        success: false,
        error: 'SMS gateway not configured',
        mock: true
      };
    }

    // Format phone number (add +91 for India if not present)
    let formattedNumber = to;
    if (!to.startsWith('+')) {
      formattedNumber = `+91${to}`;
    }

    const result = await twilioClient.messages.create({
      body: message,
      from: fromNumber,
      to: formattedNumber
    });

    console.log(`✅ SMS sent to ${formattedNumber}: ${result.sid}`);

    return {
      success: true,
      messageId: result.sid,
      status: result.status,
      to: formattedNumber,
      sentAt: new Date()
    };
  } catch (error) {
    console.error('❌ SMS sending failed:', error.message);
    return {
      success: false,
      error: error.message,
      to: to
    };
  }
};

/**
 * Send bulk SMS to multiple recipients
 * @param {Array<{phone: string, message: string}>} recipients - Array of recipients
 * @returns {Promise<Array>} - Array of results
 */
const sendBulkSMS = async (recipients) => {
  try {
    if (!twilioClient) {
      console.warn('Bulk SMS not sent - Twilio not configured');
      return recipients.map(r => ({
        phone: r.phone,
        success: false,
        error: 'SMS gateway not configured',
        mock: true
      }));
    }

    const results = [];

    for (const recipient of recipients) {
      const result = await sendSMS(recipient.phone, recipient.message);
      results.push({
        phone: recipient.phone,
        ...result
      });

      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const successCount = results.filter(r => r.success).length;
    console.log(`✅ Bulk SMS: ${successCount}/${recipients.length} sent successfully`);

    return results;
  } catch (error) {
    console.error('❌ Bulk SMS failed:', error.message);
    throw error;
  }
};

/**
 * Send SMS with template variables
 * @param {string} to - Recipient phone number
 * @param {string} template - SMS template with {variables}
 * @param {object} variables - Object with variable values
 * @returns {Promise<object>} - SMS delivery result
 */
const sendTemplateSMS = async (to, template, variables) => {
  try {
    // Replace template variables
    let message = template;
    for (const [key, value] of Object.entries(variables)) {
      message = message.replace(new RegExp(`{${key}}`, 'g'), value);
    }

    return await sendSMS(to, message);
  } catch (error) {
    console.error('❌ Template SMS failed:', error.message);
    return {
      success: false,
      error: error.message,
      to: to
    };
  }
};

/**
 * Send Fee Reminder SMS
 * @param {string} phone - Student/Parent phone
 * @param {object} data - Fee reminder data
 */
const sendFeeReminderSMS = async (phone, data) => {
  const template = `Dear ${data.studentName}, Fee reminder: Rs.${data.amount} is due on ${data.dueDate}. Please pay at the earliest. - ${data.instituteName}`;
  return await sendSMS(phone, template);
};

/**
 * Send Exam Reminder SMS
 * @param {string} phone - Student phone
 * @param {object} data - Exam data
 */
const sendExamReminderSMS = async (phone, data) => {
  const template = `Dear ${data.studentName}, Exam reminder: ${data.examName} is scheduled on ${data.examDate} at ${data.examTime}. All the best! - ${data.instituteName}`;
  return await sendSMS(phone, template);
};

/**
 * Send Attendance Alert SMS
 * @param {string} phone - Parent phone
 * @param {object} data - Attendance data
 */
const sendAttendanceAlertSMS = async (phone, data) => {
  const template = `Dear Parent, Your ward ${data.studentName} was absent today (${data.date}). Please contact the institute if this is incorrect. - ${data.instituteName}`;
  return await sendSMS(phone, template);
};

/**
 * Send Admission Confirmation SMS
 * @param {string} phone - Student phone
 * @param {object} data - Admission data
 */
const sendAdmissionConfirmationSMS = async (phone, data) => {
  const template = `Congratulations ${data.studentName}! Your admission is confirmed. Admission No: ${data.admissionNo}. Course: ${data.courseName}. Welcome to ${data.instituteName}!`;
  return await sendSMS(phone, template);
};

/**
 * Send Fee Receipt SMS
 * @param {string} phone - Student/Parent phone
 * @param {object} data - Receipt data
 */
const sendFeeReceiptSMS = async (phone, data) => {
  const template = `Dear ${data.studentName}, Payment received: Rs.${data.amount} on ${data.date}. Receipt No: ${data.receiptNo}. Thank you! - ${data.instituteName}`;
  return await sendSMS(phone, template);
};

module.exports = {
  sendSMS,
  sendBulkSMS,
  sendTemplateSMS,
  sendFeeReminderSMS,
  sendExamReminderSMS,
  sendAttendanceAlertSMS,
  sendAdmissionConfirmationSMS,
  sendFeeReceiptSMS
};
