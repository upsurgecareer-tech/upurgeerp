const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reportsController');
const { authenticate } = require('../middlewares/auth');

router.use(authenticate);

// Dashboard
router.get('/', reportsController.getDashboardStats);
router.get('/dashboard', reportsController.getDashboardStats);

// Reports
router.get('/students', reportsController.getStudentReport);
router.get('/fee-collection', reportsController.getFeeCollectionReport);
router.get('/attendance', reportsController.getAttendanceReport);
router.get('/lead-conversion', reportsController.getLeadConversionReport);
router.get('/revenue', reportsController.getRevenueReport);
router.get('/expenses', reportsController.getExpenseReport);
router.get('/library', reportsController.getLibraryReport);
router.get('/inventory', reportsController.getInventoryReport);

// Export
router.get('/export', reportsController.exportReport);

module.exports = router;
