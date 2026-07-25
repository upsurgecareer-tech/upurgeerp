const express = require('express');
const router = express.Router();
const communicationController = require('../controllers/communicationController');
const { authenticate } = require('../middlewares/auth');

router.use(authenticate);

// Email Templates
router.post('/email-templates', communicationController.createEmailTemplate);
router.get('/email-templates', communicationController.getEmailTemplates);

// SMS Templates
router.post('/sms-templates', communicationController.createSmsTemplate);
router.get('/sms-templates', communicationController.getSmsTemplates);

// Send Communications
router.post('/send-email', communicationController.sendEmail);
router.post('/send-sms', communicationController.sendSms);
router.post('/send-whatsapp', communicationController.sendWhatsApp);

// Logs
router.get('/logs', communicationController.getCommunicationLogs);

// Announcements
router.post('/announcements', communicationController.createAnnouncement);
router.get('/announcements', communicationController.getAnnouncements);

// Push Notifications
router.post('/push-token', communicationController.registerPushToken);
router.post('/send-push', communicationController.sendPushNotification);

module.exports = router;
