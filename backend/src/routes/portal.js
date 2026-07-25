const express = require('express');
const router = express.Router();
const portalController = require('../controllers/portalController');
const { authenticate } = require('../middlewares/auth');

// Student Portal
router.get('/student/dashboard', authenticate, portalController.getStudentDashboard);
router.get('/student/profile', authenticate, portalController.getStudentProfile);
router.get('/student/attendance', authenticate, portalController.getStudentAttendance);
router.get('/student/fees', authenticate, portalController.getStudentFees);
router.get('/student/results', authenticate, portalController.getStudentResults);

// Parent Portal
router.get('/parent/dashboard', authenticate, portalController.getParentDashboard);
router.get('/parent/child/:id/attendance', authenticate, portalController.getChildAttendance);
router.get('/parent/child/:id/fees', authenticate, portalController.getChildFees);

module.exports = router;
