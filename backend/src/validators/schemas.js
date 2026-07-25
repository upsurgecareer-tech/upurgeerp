const Joi = require('joi');

// Student validation
const createStudentSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().allow('', null),
  mobile: Joi.string().pattern(/^[0-9]{10}$/).required(),
  dob: Joi.date().max('now').allow(null),
  gender: Joi.string().valid('Male', 'Female', 'Other').allow(null),
  address: Joi.string().max(500).allow('', null),
  parent_name: Joi.string().max(100).allow('', null),
  parent_mobile: Joi.string().pattern(/^[0-9]{10}$/).allow('', null),
  lead_id: Joi.number().integer().positive().allow(null),
  admission_no: Joi.string().max(50).allow('', null)
});

const updateStudentSchema = Joi.object({
  name: Joi.string().min(2).max(100),
  email: Joi.string().email().allow('', null),
  mobile: Joi.string().pattern(/^[0-9]{10}$/),
  dob: Joi.date().max('now').allow(null),
  gender: Joi.string().valid('Male', 'Female', 'Other'),
  address: Joi.string().max(500).allow('', null),
  parent_name: Joi.string().max(100).allow('', null),
  parent_mobile: Joi.string().pattern(/^[0-9]{10}$/).allow('', null)
}).min(1);

// Fee payment validation
const createFeePaymentSchema = Joi.object({
  admission_id: Joi.number().integer().positive().required(),
  amount_paid: Joi.number().positive().required(),
  payment_mode: Joi.string().valid('Cash', 'Card', 'UPI', 'Bank Transfer', 'Cheque', 'Online').required(),
  payment_date: Joi.date().required(),
  gateway_txn_id: Joi.string().max(100).allow('', null),
  remarks: Joi.string().max(500).allow('', null),
  fee_schedule_id: Joi.number().integer().positive().allow(null),
  received_by: Joi.number().integer().positive().allow(null)
});

// Lead validation
const createLeadSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().allow('', null),
  mobile: Joi.string().pattern(/^[0-9]{10}$/).required(),
  course_interest: Joi.string().max(200).allow('', null),
  source: Joi.string().max(100).allow('', null),
  stage: Joi.string().max(50).allow('', null),
  source_id: Joi.number().integer().positive().allow(null),
  assigned_to: Joi.number().integer().positive().allow(null),
  remarks: Joi.string().max(1000).allow('', null)
});

// Notice validation
const createNoticeSchema = Joi.object({
  title: Joi.string().min(5).max(200).required(),
  content: Joi.string().min(10).required(),
  targetAudience: Joi.string().valid('All', 'Students', 'Staff', 'Parents', 'Specific').required(),
  priority: Joi.string().valid('Low', 'Medium', 'High', 'Urgent'),
  publishDate: Joi.date().required(),
  expiryDate: Joi.date().min(Joi.ref('publishDate')),
  attachments: Joi.array().items(Joi.string())
});

// Exam validation
const createExamSchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  courseId: Joi.number().integer().positive().required(),
  batchId: Joi.number().integer().positive().required(),
  examDate: Joi.date().min('now').required(),
  duration: Joi.number().integer().positive().required(),
  totalMarks: Joi.number().positive().required(),
  passingMarks: Joi.number().positive().required(),
  examType: Joi.string().valid('Theory', 'Practical', 'Online', 'Assignment')
});

// Book issue validation
const issueBookSchema = Joi.object({
  bookId: Joi.number().integer().positive().required(),
  studentId: Joi.number().integer().positive().required(),
  issueDate: Joi.date(),
  dueDate: Joi.date().min(Joi.ref('issueDate')).required()
});

// Transaction validation
const createTransactionSchema = Joi.object({
  transactionDate: Joi.date().required(),
  type: Joi.string().valid('Receipt', 'Payment', 'Journal', 'Contra').required(),
  description: Joi.string().max(500),
  entries: Joi.array().items(
    Joi.object({
      accountHeadId: Joi.number().integer().positive().required(),
      debit: Joi.number().min(0),
      credit: Joi.number().min(0),
      description: Joi.string().max(200)
    })
  ).min(2).required()
});

// Batch validation
const createBatchSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  course_package_id: Joi.number().integer().positive().allow(null),
  faculty_id: Joi.number().integer().positive().allow(null),
  start_date: Joi.date().required(),
  end_date: Joi.date().allow(null),
  timing: Joi.string().max(100).allow('', null),
  max_students: Joi.number().integer().positive().allow(null),
  status: Joi.string().valid('Upcoming', 'Active', 'Completed').allow(null)
});

const updateBatchSchema = Joi.object({
  name: Joi.string().min(2).max(100),
  course_package_id: Joi.number().integer().positive(),
  faculty_id: Joi.number().integer().positive().allow(null),
  start_date: Joi.date(),
  end_date: Joi.date(),
  timing: Joi.string().max(100).allow('', null),
  max_students: Joi.number().integer().positive(),
  status: Joi.string().valid('Upcoming', 'Active', 'Completed')
}).min(1);

const addStudentToBatchSchema = Joi.object({
  student_id: Joi.number().integer().positive().required(),
  admission_id: Joi.number().integer().positive().allow(null)
});

const createTimetableSchema = Joi.object({
  subject: Joi.string().min(2).max(100).required(),
  faculty_id: Joi.number().integer().positive().allow(null),
  day_of_week: Joi.string().valid('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday').required(),
  start_time: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/).required(),
  end_time: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/).required(),
  room: Joi.string().max(50).allow('', null)
});

// Staff validation
const createStaffSchema = Joi.object({
  first_name: Joi.string().min(2).max(50).required(),
  last_name: Joi.string().min(2).max(50).allow('', null),
  email: Joi.string().email().required(),
  username: Joi.string().min(3).max(50).required(),
  password: Joi.string().min(6).required(),
  phone: Joi.string().pattern(/^[0-9]{10}$/).required(),
  role_id: Joi.number().integer().positive().required(),
  department_id: Joi.number().integer().positive().allow(null),
  designation: Joi.string().max(100).allow('', null),
  joining_date: Joi.date().allow(null),
  salary: Joi.number().positive().allow(null)
});

const updateStaffSchema = Joi.object({
  first_name: Joi.string().min(2).max(50),
  last_name: Joi.string().min(2).max(50).allow('', null),
  email: Joi.string().email(),
  phone: Joi.string().pattern(/^[0-9]{10}$/),
  department_id: Joi.number().integer().positive().allow(null),
  designation: Joi.string().max(100).allow('', null),
  salary: Joi.number().positive().allow(null)
}).min(1);

// Follow-up validation
const createFollowUpSchema = Joi.object({
  lead_id: Joi.number().integer().positive().required(),
  follow_up_date: Joi.date().required(),
  follow_up_type: Joi.string().valid('Call', 'Email', 'Meeting', 'WhatsApp', 'SMS').required(),
  notes: Joi.string().max(1000).allow('', null),
  next_follow_up_date: Joi.date().allow(null),
  status: Joi.string().valid('Pending', 'Completed', 'Cancelled').allow(null)
});

// Course Package validation
const createCoursePackageSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  total_fee: Joi.number().positive().required(),
  duration_months: Joi.number().integer().positive().required(),
  description: Joi.string().max(1000).allow('', null),
  is_active: Joi.boolean().allow(null)
});

// Admission validation
const createAdmissionSchema = Joi.object({
  student_id: Joi.number().integer().positive().required(),
  course_package_id: Joi.number().integer().positive().required(),
  admission_date: Joi.date().required(),
  total_fee: Joi.number().positive().required(),
  discount_id: Joi.number().integer().positive().allow(null),
  discount_amount: Joi.number().min(0).allow(null),
  final_fee: Joi.number().positive().required(),
  payment_mode: Joi.string().valid('Full', 'Installment').required()
});

const updateLeadSchema = Joi.object({
  name: Joi.string().min(2).max(100),
  email: Joi.string().email().allow('', null),
  mobile: Joi.string().pattern(/^[0-9]{10}$/),
  course_interest: Joi.string().max(200).allow('', null),
  source: Joi.string().max(100).allow('', null),
  stage: Joi.string().max(50).allow('', null),
  source_id: Joi.number().integer().positive().allow(null),
  assigned_to: Joi.number().integer().positive().allow(null),
  remarks: Joi.string().max(1000).allow('', null),
  status: Joi.string().valid('Active', 'Converted', 'Lost').allow(null)
}).min(1);

// Attendance validation
const createAttendanceSessionSchema = Joi.object({
  batch_id: Joi.number().integer().positive().required(),
  subject: Joi.string().min(2).max(100).required(),
  faculty_id: Joi.number().integer().positive().allow(null),
  date: Joi.date().required(),
  start_time: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/).allow(null),
  end_time: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/).allow(null)
});

const markAttendanceQRSchema = Joi.object({
  qr_token: Joi.string().required(),
  session_id: Joi.number().integer().positive().required()
});

const markAttendanceManualSchema = Joi.object({
  session_id: Joi.number().integer().positive().required(),
  attendance: Joi.array().items(
    Joi.object({
      student_id: Joi.number().integer().positive().required(),
      status: Joi.string().valid('Present', 'Absent', 'Leave').required()
    })
  ).min(1).required()
});

// Payroll Validation
const salaryStructureSchema = Joi.object({
  employee_user_id: Joi.number().integer().positive().required(),
  basic_salary: Joi.number().min(0).required(),
  allowances: Joi.string().required(),
  deductions: Joi.string().required(),
  total_salary: Joi.number().min(0).required(),
  effective_from: Joi.date().required()
});

const generatePayrollSchema = Joi.object({
  employee_id: Joi.number().integer().positive().required(),
  month: Joi.number().integer().min(1).max(12).required(),
  year: Joi.number().integer().min(2000).max(2100).required(),
  basic_salary: Joi.number().min(0).required(),
  allowances: Joi.number().min(0).required(),
  deductions: Joi.number().min(0).required(),
  net_salary: Joi.number().min(0).required()
});

// Accounting Validation
const createAccountHeadSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  code: Joi.string().min(2).max(50).required(),
  type: Joi.string().valid('Asset', 'Liability', 'Equity', 'Revenue', 'Expense').required(),
  parentId: Joi.number().integer().positive().allow(null)
});

const createExpenseSchema = Joi.object({
  accountHeadId: Joi.number().integer().positive().required(),
  expenseDate: Joi.date().required(),
  amount: Joi.number().positive().required(),
  paymentMethod: Joi.string().valid('Cash', 'Card', 'UPI', 'Bank Transfer', 'Cheque').required(),
  description: Joi.string().max(500).allow('', null)
});

module.exports = {
  createStudentSchema,
  updateStudentSchema,
  createFeePaymentSchema,
  createLeadSchema,
  updateLeadSchema,
  createFollowUpSchema,
  createCoursePackageSchema,
  createAdmissionSchema,
  createNoticeSchema,
  createExamSchema,
  issueBookSchema,
  createTransactionSchema,
  createBatchSchema,
  updateBatchSchema,
  addStudentToBatchSchema,
  createTimetableSchema,
  createStaffSchema,
  updateStaffSchema,
  createAttendanceSessionSchema,
  markAttendanceQRSchema,
  markAttendanceManualSchema,
  salaryStructureSchema,
  generatePayrollSchema,
  createAccountHeadSchema,
  createExpenseSchema
};
