const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');
const { authenticate } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');
const { createStaffSchema, updateStaffSchema } = require('../validators/schemas');

// Staff CRUD
router.post('/', authenticate, validate(createStaffSchema), staffController.createStaff);
router.get('/', authenticate, staffController.getStaff);
router.get('/report', authenticate, staffController.getStaffReport);
router.get('/:id', authenticate, staffController.getStaffById);
router.put('/:id', authenticate, validate(updateStaffSchema), staffController.updateStaff);
router.put('/:id/status', authenticate, staffController.updateStaffStatus);
router.put('/:id/reset-password', authenticate, staffController.resetPassword);

// Salary Management
router.post('/:id/salary', authenticate, staffController.setSalary);
router.get('/:id/salary', authenticate, staffController.getSalary);

// Attendance Management
router.post('/attendance', authenticate, staffController.markAttendance);
router.get('/attendance', authenticate, staffController.getAttendance);

// Payroll Management
router.post('/payroll', authenticate, staffController.generatePayroll);
router.get('/payroll', authenticate, staffController.getPayroll);
router.put('/payroll/:id', authenticate, staffController.updatePayrollStatus);

// Timesheet Management
router.post('/timesheets', authenticate, staffController.createTimesheet);
router.get('/timesheets', authenticate, staffController.getTimesheets);
router.put('/timesheets/:id', authenticate, staffController.updateTimesheetStatus);

// Generate Staff ID Card
router.post('/:id/generate-idcard', authenticate, staffController.generateIDCard);

module.exports = router;
