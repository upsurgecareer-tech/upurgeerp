const Joi = require('joi');

// ============ EMPLOYEE VALIDATION ============
const createEmployeeSchema = Joi.object({
  user_id: Joi.number().integer().positive().required().messages({
    'number.base': 'User ID must be a number',
    'number.positive': 'User ID must be positive',
    'any.required': 'User ID is required'
  }),
  department_id: Joi.number().integer().positive().required().messages({
    'number.base': 'Department ID must be a number',
    'number.positive': 'Department ID must be positive',
    'any.required': 'Department is required'
  }),
  designation: Joi.string().min(2).max(100).required().messages({
    'string.empty': 'Designation is required',
    'string.min': 'Designation must be at least 2 characters',
    'string.max': 'Designation cannot exceed 100 characters',
    'any.required': 'Designation is required'
  }),
  joining_date: Joi.date().max('now').required().messages({
    'date.base': 'Invalid joining date',
    'date.max': 'Joining date cannot be in future',
    'any.required': 'Joining date is required'
  }),
  employment_type: Joi.string().valid('Full-Time', 'Part-Time', 'Contract', 'Intern').required().messages({
    'any.only': 'Employment type must be Full-Time, Part-Time, Contract, or Intern',
    'any.required': 'Employment type is required'
  }),
  date_of_birth: Joi.date().max(Joi.ref('$today', { adjust: (value) => new Date(value.getTime() - 18 * 365 * 24 * 60 * 60 * 1000) })).required().messages({
    'date.base': 'Invalid date of birth',
    'date.max': 'Employee must be at least 18 years old',
    'any.required': 'Date of birth is required'
  }),
  gender: Joi.string().valid('Male', 'Female', 'Other').required().messages({
    'any.only': 'Gender must be Male, Female, or Other',
    'any.required': 'Gender is required'
  }),
  blood_group: Joi.string().valid('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-').optional().allow('', null),
  address: Joi.string().min(10).max(500).required().messages({
    'string.empty': 'Address is required',
    'string.min': 'Address must be at least 10 characters',
    'string.max': 'Address cannot exceed 500 characters',
    'any.required': 'Address is required'
  }),
  emergency_contact_name: Joi.string().min(2).max(100).required().messages({
    'string.empty': 'Emergency contact name is required',
    'string.min': 'Emergency contact name must be at least 2 characters',
    'any.required': 'Emergency contact name is required'
  }),
  emergency_contact_phone: Joi.string().pattern(/^[6-9]\d{9}$/).required().messages({
    'string.pattern.base': 'Emergency contact must be a valid 10-digit Indian mobile number',
    'any.required': 'Emergency contact phone is required'
  }),
  bank_name: Joi.string().min(2).max(100).optional().allow('', null),
  bank_account_number: Joi.string().pattern(/^\d{9,18}$/).optional().allow('', null).messages({
    'string.pattern.base': 'Bank account number must be 9-18 digits'
  }),
  bank_ifsc: Joi.string().pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/).optional().allow('', null).messages({
    'string.pattern.base': 'Invalid IFSC code format (e.g., SBIN0001234)'
  }),
  pan_number: Joi.string().pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/).optional().allow('', null).messages({
    'string.pattern.base': 'Invalid PAN format (e.g., ABCDE1234F)'
  }),
  aadhar_number: Joi.string().pattern(/^\d{12}$/).optional().allow('', null).messages({
    'string.pattern.base': 'Aadhar number must be exactly 12 digits'
  })
});

const updateEmployeeSchema = Joi.object({
  department_id: Joi.number().integer().positive().optional(),
  designation: Joi.string().min(2).max(100).optional(),
  joining_date: Joi.date().max('now').optional(),
  employment_type: Joi.string().valid('Full-Time', 'Part-Time', 'Contract', 'Intern').optional(),
  date_of_birth: Joi.date().optional(),
  gender: Joi.string().valid('Male', 'Female', 'Other').optional(),
  blood_group: Joi.string().valid('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-').optional().allow('', null),
  address: Joi.string().min(10).max(500).optional(),
  emergency_contact_name: Joi.string().min(2).max(100).optional(),
  emergency_contact_phone: Joi.string().pattern(/^[6-9]\d{9}$/).optional(),
  bank_name: Joi.string().min(2).max(100).optional().allow('', null),
  bank_account_number: Joi.string().pattern(/^\d{9,18}$/).optional().allow('', null),
  bank_ifsc: Joi.string().pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/).optional().allow('', null),
  pan_number: Joi.string().pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/).optional().allow('', null),
  aadhar_number: Joi.string().pattern(/^\d{12}$/).optional().allow('', null)
}).min(1);

const selfUpdateEmployeeSchema = Joi.object({
  department_id: Joi.number().integer().positive().optional().allow(null),
  designation: Joi.string().min(2).max(100).optional().allow('', null),
  joining_date: Joi.date().optional().allow(null),
  employment_type: Joi.string().valid('Full-Time', 'Part-Time', 'Contract', 'Intern').optional().allow('', null),
  date_of_birth: Joi.date().optional().allow(null),
  gender: Joi.string().valid('Male', 'Female', 'Other').optional().allow('', null),
  blood_group: Joi.string().valid('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-').optional().allow('', null),
  address: Joi.string().min(5).max(500).optional().allow('', null),
  emergency_contact_name: Joi.string().min(2).max(100).optional().allow('', null),
  emergency_contact_phone: Joi.string().pattern(/^[6-9]\d{9}$/).optional().allow('', null),
  bank_name: Joi.string().min(2).max(100).optional().allow('', null),
  bank_account_number: Joi.string().pattern(/^\d{9,18}$/).optional().allow('', null),
  bank_ifsc: Joi.string().pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/).optional().allow('', null),
  pan_number: Joi.string().pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/).optional().allow('', null),
  aadhar_number: Joi.string().pattern(/^\d{12}$/).optional().allow('', null)
}).min(1).messages({
  'object.unknown': 'You are not authorized to update these fields'
}).options({ stripUnknown: true, allowUnknown: true });

const updateEmployeeStatusSchema = Joi.object({
  status: Joi.string().valid('Active', 'Inactive', 'Terminated', 'Resigned').required().messages({
    'any.only': 'Status must be Active, Inactive, Terminated, or Resigned',
    'any.required': 'Status is required'
  })
});

// ============ LEAVE VALIDATION ============
const applyLeaveSchema = Joi.object({
  employee_id: Joi.number().integer().positive().required().messages({
    'number.base': 'Employee ID must be a number',
    'any.required': 'Employee ID is required'
  }),
  leave_type: Joi.string().valid('Sick', 'Casual', 'Earned', 'Maternity', 'Paternity', 'Unpaid').required().messages({
    'any.only': 'Leave type must be Sick, Casual, Earned, Maternity, Paternity, or Unpaid',
    'any.required': 'Leave type is required'
  }),
  start_date: Joi.date().required().messages({
    'date.base': 'Invalid start date',
    'any.required': 'Start date is required'
  }),
  end_date: Joi.date().min(Joi.ref('start_date')).required().messages({
    'date.base': 'Invalid end date',
    'date.min': 'End date must be after or equal to start date',
    'any.required': 'End date is required'
  }),
  reason: Joi.string().min(3).max(500).required().messages({
    'string.empty': 'Reason is required',
    'string.min': 'Reason must be at least 3 characters',
    'string.max': 'Reason cannot exceed 500 characters',
    'any.required': 'Reason is required'
  })
});

const updateLeaveStatusSchema = Joi.object({
  status: Joi.string().valid('Approved', 'Rejected').required().messages({
    'any.only': 'Status must be Approved or Rejected',
    'any.required': 'Status is required'
  }),
  remarks: Joi.string().max(500).optional().allow('', null).messages({
    'string.max': 'Remarks cannot exceed 500 characters'
  })
});

// ============ DOCUMENT VALIDATION ============
const uploadDocumentSchema = Joi.object({
  employee_id: Joi.number().integer().positive().required().messages({
    'number.base': 'Employee ID must be a number',
    'any.required': 'Employee ID is required'
  }),
  document_type: Joi.string().valid('Resume', 'ID Proof', 'Address Proof', 'Education Certificate', 'Experience Letter', 'Other').required().messages({
    'any.only': 'Invalid document type',
    'any.required': 'Document type is required'
  }),
  document_name: Joi.string().min(2).max(200).required().messages({
    'string.empty': 'Document name is required',
    'string.min': 'Document name must be at least 2 characters',
    'string.max': 'Document name cannot exceed 200 characters',
    'any.required': 'Document name is required'
  })
});

// ============ DEPARTMENT VALIDATION ============
const createDepartmentSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    'string.empty': 'Department name is required',
    'string.min': 'Department name must be at least 2 characters',
    'string.max': 'Department name cannot exceed 100 characters',
    'any.required': 'Department name is required'
  })
});

// ============ ATTENDANCE VALIDATION ============
const checkInSchema = Joi.object({
  location: Joi.string().max(200).optional().allow('', null),
  remarks: Joi.string().max(500).optional().allow('', null)
});

const bulkAttendanceSchema = Joi.object({
  records: Joi.array().items(
    Joi.object({
      employee_id: Joi.number().integer().positive().required(),
      date: Joi.date().iso().required(),
      status: Joi.string().valid('Present', 'Absent', 'Half Day', 'On Leave').required(),
      remarks: Joi.string().max(500).optional().allow('', null)
    })
  ).min(1).required().messages({
    'array.min': 'At least one record is required',
    'any.required': 'Records array is required'
  })
});

// ============ RECRUITMENT VALIDATION ============
const jobPostingSchema = Joi.object({
  title: Joi.string().min(3).max(150).required().messages({
    'string.empty': 'Job title is required',
    'string.min': 'Job title must be at least 3 characters',
    'any.required': 'Job title is required'
  }),
  department_id: Joi.number().integer().positive().optional(),
  description: Joi.string().optional().allow('', null),
  requirements: Joi.string().optional().allow('', null),
  location: Joi.string().optional().allow('', null),
  employment_type: Joi.string().valid('Full-Time', 'Part-Time', 'Contract', 'Intern').optional().allow('', null),
  min_salary: Joi.number().positive().optional().allow(null),
  max_salary: Joi.number().positive().min(Joi.ref('min_salary')).optional().allow(null).messages({
    'number.min': 'Max salary must be greater than or equal to min salary'
  }),
  openings: Joi.number().integer().positive().required().messages({
    'number.base': 'Openings must be a number',
    'any.required': 'Number of openings is required'
  }),
  deadline: Joi.date().min('now').optional().allow(null).messages({
    'date.min': 'Deadline must be in the future'
  }),
  status: Joi.string().valid('Open', 'Closed', 'Draft').optional()
});

const candidateSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    'string.empty': 'Candidate name is required',
    'any.required': 'Candidate name is required'
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Valid email is required',
    'any.required': 'Email is required'
  }),
  phone: Joi.string().pattern(/^[0-9]{10,15}$/).optional().allow('', null).messages({
    'string.pattern.base': 'Valid phone number is required (10-15 digits)'
  }),
  job_posting_id: Joi.number().integer().positive().required().messages({
    'any.required': 'Job posting selection is required'
  }),
  experience_years: Joi.number().min(0).optional().allow(null),
  current_salary: Joi.number().min(0).optional().allow(null),
  current_in_hand_salary: Joi.number().min(0).optional().allow(null),
  expected_salary: Joi.number().min(0).optional().allow(null),
  expected_in_hand_salary: Joi.number().min(0).optional().allow(null),
  notice_period_days: Joi.number().integer().min(0).optional().allow(null),
  application_date: Joi.date().optional().allow(null),
  notes: Joi.string().optional().allow('', null),
  status: Joi.string().valid('New', 'Applied', 'Screening', 'Interview Scheduled', 'Interviewed', 'Offered', 'Selected', 'Hired', 'Rejected', 'On Hold').optional()
});

const updateCandidateSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  email: Joi.string().email().optional(),
  phone: Joi.string().pattern(/^[0-9]{10,15}$/).optional().allow('', null),
  job_posting_id: Joi.number().integer().positive().optional(),
  experience_years: Joi.number().min(0).optional().allow(null),
  current_salary: Joi.number().min(0).optional().allow(null),
  current_in_hand_salary: Joi.number().min(0).optional().allow(null),
  expected_salary: Joi.number().min(0).optional().allow(null),
  expected_in_hand_salary: Joi.number().min(0).optional().allow(null),
  notice_period_days: Joi.number().integer().min(0).optional().allow(null),
  application_date: Joi.date().optional().allow(null),
  notes: Joi.string().optional().allow('', null),
  status: Joi.string().valid('New', 'Applied', 'Screening', 'Interview Scheduled', 'Interviewed', 'Offered', 'Selected', 'Hired', 'Rejected', 'On Hold').optional()
}).min(1);

const candidateStatusSchema = Joi.object({
  status: Joi.string().valid('New', 'Reviewed', 'Interviewing', 'Offered', 'Hired', 'Rejected').required()
});

// ============ PERFORMANCE VALIDATION ============
const performanceReviewSchema = Joi.object({
  employee_id: Joi.number().integer().positive().required(),
  reviewer_id: Joi.number().integer().positive().required(),
  review_period: Joi.string().required(),
  technical_skills: Joi.number().min(1).max(5).required().messages({
    'number.min': 'Technical skills rating must be between 1 and 5',
    'number.max': 'Technical skills rating must be between 1 and 5'
  }),
  communication: Joi.number().min(1).max(5).required().messages({
    'number.min': 'Communication rating must be between 1 and 5',
    'number.max': 'Communication rating must be between 1 and 5'
  }),
  teamwork: Joi.number().min(1).max(5).required().messages({
    'number.min': 'Teamwork rating must be between 1 and 5',
    'number.max': 'Teamwork rating must be between 1 and 5'
  }),
  punctuality: Joi.number().min(1).max(5).required().messages({
    'number.min': 'Punctuality rating must be between 1 and 5',
    'number.max': 'Punctuality rating must be between 1 and 5'
  }),
  quality_of_work: Joi.number().min(1).max(5).required().messages({
    'number.min': 'Quality of work rating must be between 1 and 5',
    'number.max': 'Quality of work rating must be between 1 and 5'
  }),
  strengths: Joi.string().min(5).required().messages({
    'string.empty': 'Strengths feedback is required',
    'any.required': 'Strengths feedback is required'
  }),
  areas_of_improvement: Joi.string().min(5).required().messages({
    'string.empty': 'Areas of improvement feedback is required',
    'any.required': 'Areas of improvement feedback is required'
  }),
  goals: Joi.string().optional().allow('', null),
  comments: Joi.string().min(5).required().messages({
    'string.empty': 'Overall comments are required',
    'any.required': 'Overall comments are required'
  }),
  status: Joi.string().valid('Draft', 'Submitted', 'Acknowledged').optional()
});

// ============ TASKS & TIMESHEETS VALIDATION ============
const taskSchema = Joi.object({
  title: Joi.string().min(3).max(150).required().messages({
    'string.empty': 'Task title is required',
    'any.required': 'Task title is required'
  }),
  description: Joi.string().optional().allow('', null),
  project: Joi.string().optional().allow('', null),
  assigned_to: Joi.number().integer().positive().required(),
  priority: Joi.string().valid('Low', 'Medium', 'High').optional(),
  due_date: Joi.date().min('now').optional().allow(null).messages({
    'date.min': 'Due date cannot be in the past'
  }),
  estimated_hours: Joi.number().min(0).optional().allow(null),
  status: Joi.string().valid('Todo', 'In Progress', 'Done', 'Blocked').optional()
});

const timesheetSchema = Joi.object({
  date: Joi.date().iso().max('now').required().messages({
    'date.max': 'Timesheet date cannot be in the future',
    'any.required': 'Date is required'
  }),
  hours_worked: Joi.number().positive().max(24).required().messages({
    'number.max': 'Hours worked cannot exceed 24 hours per day',
    'any.required': 'Hours worked are required'
  }),
  task_description: Joi.string().min(5).max(500).required().messages({
    'string.empty': 'Task description is required',
    'any.required': 'Task description is required'
  }),
  project: Joi.string().optional().allow('', null),
  status: Joi.string().valid('Draft', 'Submitted', 'Approved', 'Rejected').optional()
});

// ============ SHIFT VALIDATION ============
const shiftSchema = Joi.object({
  name: Joi.string().min(3).max(100).required().messages({
    'string.empty': 'Shift name is required',
    'any.required': 'Shift name is required'
  }),
  start_time: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/).required().messages({
    'string.pattern.base': 'Valid start time is required (HH:mm)',
    'any.required': 'Start time is required'
  }),
  end_time: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/).required().messages({
    'string.pattern.base': 'Valid end time is required (HH:mm)',
    'any.required': 'End time is required'
  }),
  grace_period_minutes: Joi.number().integer().min(0).optional().allow(null).messages({
    'number.min': 'Grace period must be non-negative'
  }),
  is_active: Joi.boolean().optional()
});

// ============ ASSET VALIDATION ============
const assetSchema = Joi.object({
  name: Joi.string().min(2).max(150).required().messages({
    'string.empty': 'Asset name is required',
    'any.required': 'Asset name is required'
  }),
  asset_code: Joi.string().optional().allow('', null),
  category: Joi.string().optional().allow('', null),
  brand: Joi.string().optional().allow('', null),
  model: Joi.string().optional().allow('', null),
  serial_number: Joi.string().optional().allow('', null),
  purchase_date: Joi.date().iso().max('now').optional().allow(null).messages({
    'date.max': 'Purchase date cannot be in the future'
  }),
  purchase_cost: Joi.number().min(0).optional().allow(null).messages({
    'number.min': 'Purchase cost must be a positive number'
  }),
  warranty_expiry: Joi.date().iso().optional().allow(null),
  location: Joi.string().optional().allow('', null),
  notes: Joi.string().optional().allow('', null),
  status: Joi.string().valid('Available', 'Assigned', 'Under Maintenance', 'Retired').optional()
});

const assignAssetSchema = Joi.object({
  employee_id: Joi.number().integer().positive().required().messages({
    'any.required': 'Employee ID is required for assignment'
  }),
  assigned_date: Joi.date().iso().max('now').required().messages({
    'date.max': 'Assigned date cannot be in the future',
    'any.required': 'Assigned date is required'
  })
});

// ============ TRAINING VALIDATION ============
const trainingProgramSchema = Joi.object({
  title: Joi.string().min(3).max(150).required().messages({
    'string.empty': 'Program title is required',
    'any.required': 'Program title is required'
  }),
  description: Joi.string().optional().allow('', null),
  category: Joi.string().optional().allow('', null),
  trainer_name: Joi.string().min(2).required().messages({
    'string.empty': 'Trainer name is required',
    'any.required': 'Trainer name is required'
  }),
  mode: Joi.string().valid('Online', 'In-Person', 'Hybrid').optional(),
  start_date: Joi.date().iso().required().messages({
    'any.required': 'Start date is required'
  }),
  end_date: Joi.date().iso().min(Joi.ref('start_date')).optional().allow(null).messages({
    'date.min': 'End date must be after or equal to start date'
  }),
  duration_hours: Joi.number().positive().optional().allow(null).messages({
    'number.positive': 'Duration must be a positive number'
  }),
  max_participants: Joi.number().integer().positive().optional().allow(null),
  department_id: Joi.number().integer().positive().optional().allow(null),
  status: Joi.string().valid('Upcoming', 'Ongoing', 'Completed', 'Cancelled').optional()
});

// ============ COMMUNICATION VALIDATION ============
const emailSchema = Joi.object({
  recipientType: Joi.string().optional(),
  recipientId: Joi.number().optional(),
  recipientEmail: Joi.string().email().required().messages({
    'string.email': 'A valid recipient email is required',
    'any.required': 'Recipient email is required'
  }),
  subject: Joi.string().when('templateId', { is: Joi.exist(), then: Joi.optional(), otherwise: Joi.required() }).messages({
    'any.required': 'Subject is required when no template is selected'
  }),
  message: Joi.string().when('templateId', { is: Joi.exist(), then: Joi.optional(), otherwise: Joi.required() }).messages({
    'any.required': 'Message body is required when no template is selected',
    'string.empty': 'Message body cannot be empty'
  }),
  templateId: Joi.number().optional(),
  variables: Joi.object().optional()
});

const smsSchema = Joi.object({
  recipientType: Joi.string().optional(),
  recipientId: Joi.number().optional(),
  recipientPhone: Joi.string().pattern(/^[0-9]{10,15}$/).required().messages({
    'string.pattern.base': 'A valid recipient phone number is required',
    'any.required': 'Recipient phone number is required'
  }),
  message: Joi.string().when('templateId', { is: Joi.exist(), then: Joi.optional(), otherwise: Joi.required() }).messages({
    'any.required': 'Message body is required when no template is selected',
    'string.empty': 'Message body cannot be empty'
  }),
  templateId: Joi.number().optional(),
  variables: Joi.object().optional()
});

const announcementSchema = Joi.object({
  title: Joi.string().min(3).required().messages({
    'any.required': 'Announcement title is required'
  }),
  message: Joi.string().required().messages({
    'any.required': 'Announcement message cannot be empty',
    'string.empty': 'Announcement message cannot be empty'
  }),
  type: Joi.string().optional(),
  targetAudience: Joi.string().valid('All', 'Department', 'Branch', 'Specific').required(),
  targetIds: Joi.array().items(Joi.number()).optional(),
  publishDate: Joi.date().iso().optional(),
  expiryDate: Joi.date().iso().optional(),
  sendEmail: Joi.boolean().optional(),
  sendSms: Joi.boolean().optional(),
  sendPush: Joi.boolean().optional()
});

const reportFilterSchema = Joi.object({
  type: Joi.string().optional(),
  dateRange: Joi.string().optional(),
  department: Joi.string().allow('', null).optional(),
  startDate: Joi.date().optional(),
  endDate: Joi.date().min(Joi.ref('startDate')).optional().messages({
    'date.min': 'End date must be greater than or equal to start date'
  })
});

// ============ VALIDATION MIDDLEWARE ============
const validate = (schema) => {
  return (req, res, next) => {
    const dataToValidate = req.method === 'GET' ? req.query : req.body;
    const { error } = schema.validate(dataToValidate, { abortEarly: false, context: { today: new Date() } });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      return res.status(400).json({
        message: 'Validation failed',
        errors
      });
    }
    
    next();
  };
};

module.exports = {
  validateCreateEmployee: validate(createEmployeeSchema),
  validateUpdateEmployee: validate(updateEmployeeSchema),
  validateSelfUpdateEmployee: validate(selfUpdateEmployeeSchema),
  validateUpdateEmployeeStatus: validate(updateEmployeeStatusSchema),
  validateApplyLeave: validate(applyLeaveSchema),
  validateUpdateLeaveStatus: validate(updateLeaveStatusSchema),
  validateUploadDocument: validate(uploadDocumentSchema),
  validateCreateDepartment: validate(createDepartmentSchema),
  validateCheckIn: validate(checkInSchema),
  validateBulkAttendance: validate(bulkAttendanceSchema),
  validateJobPosting: validate(jobPostingSchema),
  validateCandidate: validate(candidateSchema),
  validateUpdateCandidate: validate(updateCandidateSchema),
  validateCandidateStatus: validate(candidateStatusSchema),
  validatePerformanceReview: validate(performanceReviewSchema),
  validateTask: validate(taskSchema),
  validateTimesheet: validate(timesheetSchema),
  validateShift: validate(shiftSchema),
  validateAsset: validate(assetSchema),
  validateAssignAsset: validate(assignAssetSchema),
  validateTrainingProgram: validate(trainingProgramSchema),
  validateEmail: validate(emailSchema),
  validateSms: validate(smsSchema),
  validateAnnouncement: validate(announcementSchema),
  validateReportFilter: validate(reportFilterSchema)
};
