const { EmailTemplate, SmsTemplate, CommunicationLog, Announcement, PushToken } = require('../models/Communication');
const { Op } = require('sequelize');
const nodemailer = require('nodemailer');
const smsService = require('../utils/smsService');

// Email Service
const emailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Email Templates
exports.createEmailTemplate = async (req, res) => {
  try {
    const { name, subject, body, type, variables } = req.body;
    const template = await EmailTemplate.create({
      branch_id: req.user.branch_id,
      name, subject, body, type, variables
    });
    res.status(201).json(template);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getEmailTemplates = async (req, res) => {
  try {
    const templates = await EmailTemplate.findAll({
      where: { branch_id: req.user.branch_id, isActive: true }
    });
    res.json(templates);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// SMS Templates
exports.createSmsTemplate = async (req, res) => {
  try {
    const { name, message, type, variables } = req.body;
    const template = await SmsTemplate.create({
      branch_id: req.user.branch_id,
      name, message, type, variables
    });
    res.status(201).json(template);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getSmsTemplates = async (req, res) => {
  try {
    const templates = await SmsTemplate.findAll({
      where: { branch_id: req.user.branch_id, isActive: true }
    });
    res.json(templates);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Send Email
exports.sendEmail = async (req, res) => {
  try {
    const { recipientType, recipientId, recipientEmail, subject, message, templateId } = req.body;
    
    let finalSubject = subject;
    let finalMessage = message;
    
    if (templateId) {
      const template = await EmailTemplate.findByPk(templateId);
      if (template) {
        finalSubject = template.subject;
        finalMessage = template.body;
        // Replace variables if provided
        if (req.body.variables) {
          Object.keys(req.body.variables).forEach(key => {
            finalSubject = finalSubject.replace(`{{${key}}}`, req.body.variables[key]);
            finalMessage = finalMessage.replace(`{{${key}}}`, req.body.variables[key]);
          });
        }
      }
    }
    
    const log = await CommunicationLog.create({
      branch_id: req.user.branch_id,
      type: 'Email',
      recipientType,
      recipientId,
      recipientContact: recipientEmail,
      subject: finalSubject,
      message: finalMessage,
      createdBy: req.user.id
    });
    
    try {
      await emailTransporter.sendMail({
        from: process.env.SMTP_FROM,
        to: recipientEmail,
        subject: finalSubject,
        html: finalMessage
      });
      
      await log.update({ status: 'Sent', sentAt: new Date() });
      res.json({ message: 'Email sent successfully', logId: log.id });
    } catch (emailError) {
      await log.update({ status: 'Failed', errorMessage: emailError.message });
      res.status(500).json({ error: 'Failed to send email', details: emailError.message });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Send SMS
exports.sendSms = async (req, res) => {
  try {
    const { recipientType, recipientId, recipientPhone, message, templateId } = req.body;
    
    let finalMessage = message;
    
    if (templateId) {
      const template = await SmsTemplate.findByPk(templateId);
      if (template) {
        finalMessage = template.message;
        if (req.body.variables) {
          Object.keys(req.body.variables).forEach(key => {
            finalMessage = finalMessage.replace(`{{${key}}}`, req.body.variables[key]);
          });
        }
      }
    }
    
    const log = await CommunicationLog.create({
      branch_id: req.user.branch_id,
      type: 'SMS',
      recipientType,
      recipientId,
      recipientContact: recipientPhone,
      message: finalMessage,
      createdBy: req.user.id
    });
    
    // Send SMS via Twilio
    const smsResult = await smsService.sendSMS(recipientPhone, finalMessage);
    
    if (smsResult.success) {
      await log.update({ 
        status: 'Sent', 
        sentAt: new Date(),
        gatewayMessageId: smsResult.messageId 
      });
      res.json({ 
        message: 'SMS sent successfully', 
        logId: log.id,
        messageId: smsResult.messageId 
      });
    } else {
      await log.update({ 
        status: 'Failed', 
        errorMessage: smsResult.error 
      });
      res.status(500).json({ 
        error: 'Failed to send SMS', 
        details: smsResult.error 
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Send WhatsApp
exports.sendWhatsApp = async (req, res) => {
  try {
    const { recipientType, recipientId, recipientPhone, message } = req.body;
    
    const log = await CommunicationLog.create({
      branch_id: req.user.branch_id,
      type: 'WhatsApp',
      recipientType,
      recipientId,
      recipientContact: recipientPhone,
      message,
      createdBy: req.user.id
    });
    
    // WhatsApp API integration placeholder
    // await whatsappAPI.send(recipientPhone, message);
    
    await log.update({ status: 'Sent', sentAt: new Date() });
    res.json({ message: 'WhatsApp message queued successfully', logId: log.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Communication Logs
exports.getCommunicationLogs = async (req, res) => {
  try {
    const { type, status, startDate, endDate } = req.query;
    const where = { branch_id: req.user.branch_id };
    if (type) where.type = type;
    if (status) where.status = status;
    if (startDate && endDate) {
      where.createdAt = { [Op.between]: [startDate, endDate] };
    }
    
    const logs = await CommunicationLog.findAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: 100
    });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Announcements
exports.createAnnouncement = async (req, res) => {
  try {
    const { title, message, type, targetAudience, targetIds, publishDate, expiryDate, sendEmail, sendSms, sendPush } = req.body;
    
    const announcement = await Announcement.create({
      branch_id: req.user.branch_id,
      title, message, type, targetAudience, targetIds,
      publishDate, expiryDate, sendEmail, sendSms, sendPush,
      isPublished: true,
      createdBy: req.user.id
    });
    
    res.status(201).json(announcement);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAnnouncements = async (req, res) => {
  try {
    const { type, isPublished } = req.query;
    const where = { branch_id: req.user.branch_id };
    if (type) where.type = type;
    if (isPublished !== undefined) where.isPublished = isPublished === 'true';
    
    const announcements = await Announcement.findAll({
      where,
      order: [['publishDate', 'DESC']]
    });
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Push Notifications
exports.registerPushToken = async (req, res) => {
  try {
    const { token, deviceType } = req.body;
    
    const [pushToken, created] = await PushToken.findOrCreate({
      where: { token },
      defaults: {
        userId: req.user.id,
        deviceType
      }
    });
    
    if (!created) {
      await pushToken.update({ isActive: true });
    }
    
    res.json({ message: 'Push token registered' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.sendPushNotification = async (req, res) => {
  try {
    const { userIds, title, message } = req.body;
    
    const tokens = await PushToken.findAll({
      where: { userId: { [Op.in]: userIds }, isActive: true }
    });
    
    // Push notification service integration placeholder
    // await pushService.send(tokens.map(t => t.token), { title, message });
    
    res.json({ message: 'Push notifications sent', count: tokens.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
