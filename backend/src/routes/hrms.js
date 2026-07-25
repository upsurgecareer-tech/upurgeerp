const express = require('express');
const router = express.Router();
const hrmsController = require('../controllers/hrmsController');
const employeeAttendanceController = require('../controllers/employeeAttendanceController');
const { authenticate } = require('../middlewares/authenticate');
const {
  validateCreateEmployee,
  validateUpdateEmployee,
  validateSelfUpdateEmployee,
  validateUpdateEmployeeStatus,
  validateApplyLeave,
  validateUpdateLeaveStatus,
  validateUploadDocument,
  validateCreateDepartment,
  validateCheckIn,
  validateBulkAttendance,
  validateJobPosting,
  validateCandidate,
  validateUpdateCandidate,
  validatePerformanceReview,
  validateTask,
  validateTimesheet,
  validateShift,
  validateAsset,
  validateAssignAsset,
  validateTrainingProgram,
  validateEmail,
  validateSms,
  validateAnnouncement,
  validateReportFilter
} = require('../middlewares/hrmsValidation');
const multer = require('multer');

const upload = multer({ dest: 'uploads/documents/' });

// Employee Management
router.post('/employees', authenticate, validateCreateEmployee, hrmsController.createEmployee);
router.get('/employees', authenticate, hrmsController.getEmployees);
router.get('/employees/self/profile', authenticate, hrmsController.getSelfProfile);
router.put('/employees/self/profile', authenticate, validateSelfUpdateEmployee, hrmsController.updateSelfProfile);
router.get('/employees/:id', authenticate, hrmsController.getEmployeeById);
router.put('/employees/:id', authenticate, validateUpdateEmployee, hrmsController.updateEmployee);
router.patch('/employees/:id/status', authenticate, validateUpdateEmployeeStatus, hrmsController.updateEmployeeStatus);

// Employee Reports
router.get('/reports/employees', authenticate, validateReportFilter, hrmsController.getEmployeeReports);

// Leave Management
router.post('/leaves', authenticate, validateApplyLeave, hrmsController.applyLeave);
router.get('/leaves', authenticate, hrmsController.getLeaves);
router.patch('/leaves/:id/status', authenticate, validateUpdateLeaveStatus, hrmsController.updateLeaveStatus);
router.get('/leaves/balance/:employee_id', authenticate, hrmsController.getLeaveBalance);

// Document Management
router.post('/documents', authenticate, upload.single('file'), validateUploadDocument, hrmsController.uploadDocument);
router.get('/documents', authenticate, hrmsController.getAllDocuments);
router.get('/documents/:employee_id', authenticate, hrmsController.getDocuments);
router.delete('/documents/:id', authenticate, hrmsController.deleteDocument);

// Department Management
router.post('/departments', authenticate, validateCreateDepartment, hrmsController.createDepartment);
router.get('/departments', authenticate, hrmsController.getDepartments);

// Status Management
router.post('/employees/bulk-status', authenticate, hrmsController.bulkUpdateEmployeeStatus);
router.get('/employees/:id/status-history', authenticate, hrmsController.getEmployeeStatusHistory);

// Experience Management
router.post('/employees/:id/experience', authenticate, hrmsController.addExperience);
router.get('/employees/:id/experience', authenticate, hrmsController.getExperience);
router.put('/employees/experience/:exp_id', authenticate, hrmsController.updateExperience);
router.delete('/employees/experience/:exp_id', authenticate, hrmsController.deleteExperience);

// Education Management
router.post('/employees/:id/education', authenticate, hrmsController.addEducation);
router.get('/employees/:id/education', authenticate, hrmsController.getEducation);
router.put('/employees/education/:edu_id', authenticate, hrmsController.updateEducation);
router.delete('/employees/education/:edu_id', authenticate, hrmsController.deleteEducation);

// Attendance Management
router.post('/attendance/check-in', authenticate, validateCheckIn, employeeAttendanceController.checkIn);
router.post('/attendance/check-out', authenticate, validateCheckIn, employeeAttendanceController.checkOut);
router.get('/attendance/my-today', authenticate, employeeAttendanceController.getMyTodayAttendance);
router.get('/attendance/daily', authenticate, employeeAttendanceController.getDailyAttendance);
router.get('/attendance/employee/:id', authenticate, employeeAttendanceController.getEmployeeAttendance);
router.post('/attendance/bulk', authenticate, validateBulkAttendance, employeeAttendanceController.bulkUpdateAttendance);

// Performance Management
const performanceController = require('../controllers/performanceController');
router.get('/performance', authenticate, performanceController.getReviews);
router.post('/performance', authenticate, validatePerformanceReview, performanceController.createReview);
router.put('/performance/:id', authenticate, validatePerformanceReview, performanceController.updateReview);
router.delete('/performance/:id', authenticate, performanceController.deleteReview);
router.patch('/performance/:id/acknowledge', authenticate, performanceController.acknowledgeReview);

// Shift Management
const shiftController = require('../controllers/shiftController');
router.get('/shifts', authenticate, shiftController.getShifts);
router.post('/shifts', authenticate, validateShift, shiftController.createShift);
router.put('/shifts/:id', authenticate, validateShift, shiftController.updateShift);
router.delete('/shifts/:id', authenticate, shiftController.deleteShift);
router.post('/shifts/assign', authenticate, shiftController.assignShiftToEmployee);

// Designations (aggregated from employees table)
router.get('/designations', authenticate, async (req, res) => {
  try {
    const { Employee, Department } = require('../models');
    const { Op } = require('sequelize');
    // Get unique designations from employees table
    const employees = await Employee.findAll({
      attributes: ['designation', 'department_id'],
      include: [{ model: Department, as: 'department', attributes: ['id', 'name'] }],
      where: { designation: { [Op.ne]: null } },
      group: ['designation', 'department_id', 'department.id']
    });
    const designations = employees.map((e, i) => ({
      id: i + 1,
      title: e.designation,
      department_id: e.department_id,
      department_name: e.department ? e.department.name : 'N/A'
    }));
    res.json({ designations });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Recruitment Management
const recruitmentController = require('../controllers/recruitmentController');
router.get('/recruitment/jobs', authenticate, recruitmentController.getJobPostings);
router.post('/recruitment/jobs', authenticate, validateJobPosting, recruitmentController.createJobPosting);
router.put('/recruitment/jobs/:id', authenticate, validateJobPosting, recruitmentController.updateJobPosting);
router.delete('/recruitment/jobs/:id', authenticate, recruitmentController.deleteJobPosting);
router.get('/recruitment/candidates', authenticate, recruitmentController.getCandidates);
router.post('/recruitment/candidates', authenticate, validateCandidate, recruitmentController.createCandidate);
router.put('/recruitment/candidates/:id', authenticate, validateUpdateCandidate, recruitmentController.updateCandidateStatus);
router.delete('/recruitment/candidates/:id', authenticate, recruitmentController.deleteCandidate);

// Training Management
const trainingController = require('../controllers/trainingController');
router.get('/training', authenticate, trainingController.getPrograms);
router.post('/training', authenticate, validateTrainingProgram, trainingController.createProgram);
router.put('/training/:id', authenticate, validateTrainingProgram, trainingController.updateProgram);
router.delete('/training/:id', authenticate, trainingController.deleteProgram);

// Asset Management
const assetController = require('../controllers/assetController');
router.get('/assets', authenticate, assetController.getAssets);
router.post('/assets', authenticate, validateAsset, assetController.createAsset);
router.put('/assets/:id', authenticate, validateAsset, assetController.updateAsset);
router.delete('/assets/:id', authenticate, assetController.deleteAsset);
router.post('/assets/:id/assign', authenticate, validateAssignAsset, assetController.assignAsset);
router.post('/assets/:id/return', authenticate, assetController.returnAsset);

// Communication Hub
const commController = require('../controllers/communicationController');
router.get('/communication/logs', authenticate, commController.getCommunicationLogs);
router.post('/communication/email', authenticate, validateEmail, commController.sendEmail);
router.post('/communication/sms', authenticate, validateSms, commController.sendSms);
router.post('/communication/whatsapp', authenticate, commController.sendWhatsApp);
router.post('/communication/announcements', authenticate, validateAnnouncement, commController.createAnnouncement);
router.get('/communication/announcements', authenticate, commController.getAnnouncements);

// Tasks & Timesheets
const taskController = require('../controllers/taskController');
router.get('/tasks', authenticate, taskController.getTasks);
router.post('/tasks', authenticate, validateTask, taskController.createTask);
router.put('/tasks/:id', authenticate, validateTask, taskController.updateTask);
router.delete('/tasks/:id', authenticate, taskController.deleteTask);
router.get('/timesheets', authenticate, taskController.getTimesheets);
router.post('/timesheets', authenticate, validateTimesheet, taskController.createTimesheet);
router.put('/timesheets/:id', authenticate, validateTimesheet, taskController.updateTimesheet);
router.delete('/timesheets/:id', authenticate, taskController.deleteTimesheet);
router.patch('/timesheets/:id/submit', authenticate, taskController.submitTimesheet);

module.exports = router;
