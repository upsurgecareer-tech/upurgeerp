const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const reportsController = require('../controllers/reportsController');
const { authenticate } = require('../middlewares/auth');

router.use(authenticate);

// Analytics Endpoints
router.get('/student-growth', reportsController.getStudentReport);
router.get('/revenue-trends', reportsController.getRevenueReport);
router.get('/attendance-trends', reportsController.getAttendanceReport);
router.get('/lead-source-performance', analyticsController.getLeadSourceAnalytics);
router.get('/course-popularity', reportsController.getStudentReport);
router.get('/staff-performance', reportsController.getDashboardStats);
router.get('/financial-summary', reportsController.getDashboardStats);
router.get('/batch-performance', reportsController.getDashboardStats);
router.get('/at-risk-students', reportsController.getDashboardStats);

module.exports = router;
