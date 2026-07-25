const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { authenticate } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');
const { createAttendanceSessionSchema, markAttendanceQRSchema, markAttendanceManualSchema } = require('../validators/schemas');

router.post('/sessions', authenticate, validate(createAttendanceSessionSchema), attendanceController.createSession);
router.post('/qr', authenticate, validate(markAttendanceQRSchema), attendanceController.markAttendanceQR);
router.post('/manual', authenticate, validate(markAttendanceManualSchema), attendanceController.markAttendanceManual);

router.get('/batch/:batchId', authenticate, attendanceController.getBatchAttendance);
router.get('/student/:studentId', authenticate, attendanceController.getStudentAttendance);
router.get('/at-risk', authenticate, attendanceController.getAttendanceAnalytics);

router.post('/qr/generate/:studentId', authenticate, attendanceController.generateQRCode);
router.get('/qr/:studentId', authenticate, attendanceController.getQRCode);

module.exports = router;
