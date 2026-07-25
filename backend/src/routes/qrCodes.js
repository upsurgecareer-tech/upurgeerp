const express = require('express');
const router = express.Router();
const qrCodeController = require('../controllers/qrCodeController');
const { authenticate } = require('../middlewares/authenticate');

// Generate QR Code for Student
router.post('/generate/:studentId', authenticate, qrCodeController.generateQRCode);

// Get QR Code for Student
router.get('/:studentId', authenticate, qrCodeController.getQRCode);

// Validate QR Token (Public - for Scanner)
router.get('/validate/:token', qrCodeController.validateQRToken);

// Mark Attendance via QR Scan
router.post('/scan', authenticate, qrCodeController.markAttendanceViaQR);

// Regenerate QR Code
router.post('/regenerate/:studentId', authenticate, qrCodeController.regenerateQRCode);

// Bulk Generate QR Codes for Batch
router.post('/bulk-generate', authenticate, qrCodeController.bulkGenerateQRCodes);

module.exports = router;
