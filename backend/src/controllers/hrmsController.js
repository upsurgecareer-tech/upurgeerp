const { Employee, Leave, LeaveBalance, EmployeeDocument, User, Department, EmployeeExperience, EmployeeEducation, EmployeeStatusHistory } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

// ============ EMPLOYEE MANAGEMENT ============
exports.createEmployee = async (req, res) => {
  try {
    let { user_id, first_name, last_name, email, phone, mobile, password, role_id, department_id, designation, joining_date, employment_type, date_of_birth, gender, blood_group, address, emergency_contact_name, emergency_contact_phone, bank_name, bank_account_number, bank_ifsc, pan_number, aadhar_number } = req.body;
    const contactPhone = phone || mobile || '';

    let user;
    if (user_id && user_id !== '') {
      user = await User.findByPk(user_id);
      if (!user) return res.status(404).json({ message: 'Selected User not found' });
    } else if (email && first_name) {
      // Check if email already exists in User table
      user = await User.findOne({ where: { email } });
      if (!user) {
        const bcrypt = require('bcryptjs');
        const pwd = password || Math.random().toString(36).slice(-8);
        const password_hash = await bcrypt.hash(pwd, 12);
        // Use email as the username
        let username = email;
        user = await User.create({
          branch_id: req.user ? req.user.branch_id || 1 : 1,
          organization_id: req.user ? req.user.organization_id || 1 : 1,
          role_id: role_id || 3,
          username,
          first_name,
          last_name: last_name || '',
          email,
          phone: contactPhone,
          password_hash,
          status: 'active'
        });
      }
      user_id = user.id;
    } else {
      return res.status(400).json({ message: 'Please provide either an existing User selection OR First Name and Email to create an employee.' });
    }

    // Check if user is already an employee
    const existingEmployee = await Employee.findOne({ where: { user_id } });
    if (existingEmployee) {
      return res.status(400).json({ message: `Duplicate entry: This User (${user.email || user.username}) is already registered as an employee (ID: ${existingEmployee.employee_code}). Please select a different user or enter a new email address.` });
    }

    // Check if department exists (if provided)
    if (department_id) {
      const department = await Department.findByPk(department_id);
      if (!department) return res.status(404).json({ message: 'Department not found' });
      if (!department.is_active) return res.status(400).json({ message: 'Department is inactive' });
    }

    // Check if PAN already exists
    if (pan_number) {
      const panExists = await Employee.findOne({ where: { pan_number } });
      if (panExists) return res.status(400).json({ message: `Duplicate entry: PAN number '${pan_number}' is already registered with another employee (ID: ${panExists.employee_code}). Please enter a unique PAN.` });
    }

    // Check if Aadhar already exists
    if (aadhar_number) {
      const aadharExists = await Employee.findOne({ where: { aadhar_number } });
      if (aadharExists) return res.status(400).json({ message: `Duplicate entry: Aadhar number '${aadhar_number}' is already registered with another employee (ID: ${aadharExists.employee_code}). Please enter a unique Aadhar.` });
    }

    const employee_code = `EMP${Date.now()}`;

    const employee = await Employee.create({
      user_id, employee_code, department_id, designation, joining_date, employment_type, date_of_birth, gender, blood_group, address, emergency_contact_name, emergency_contact_phone, bank_name, bank_account_number, bank_ifsc, pan_number, aadhar_number, status: 'Active'
    });

    // Create leave balance for current year
    await LeaveBalance.create({ employee_id: employee.id, year: new Date().getFullYear() });

    res.status(201).json({ message: 'Employee created successfully', employee });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      const fields = error.errors ? error.errors.map(e => `${e.path} ('${e.value}')`).join(', ') : 'value';
      return res.status(400).json({ message: `Duplicate entry error: The ${fields} already exists in the system. Please use a unique value.` });
    }
    if (error.name === 'SequelizeValidationError') {
      const messages = error.errors ? error.errors.map(e => e.message).join(', ') : error.message;
      return res.status(400).json({ message: `Validation error: ${messages}` });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getEmployees = async (req, res) => {
  try {
    const { department_id, status, search } = req.query;
    const where = {};

    if (department_id) where.department_id = department_id;
    if (status) where.status = status;

    const include = [
      { model: User, as: 'user', attributes: ['id', 'first_name', 'last_name', 'email', 'phone'] },
      { model: Department, as: 'department', attributes: ['id', 'name'] }
    ];

    if (search) {
      where[Op.or] = [
        { employee_code: { [Op.like]: `%${search}%` } },
        { designation: { [Op.like]: `%${search}%` } },
        { '$user.first_name$': { [Op.like]: `%${search}%` } },
        { '$user.last_name$': { [Op.like]: `%${search}%` } },
        { '$user.email$': { [Op.like]: `%${search}%` } }
      ];
    }

    const employees = await Employee.findAll({
      where,
      include,
      order: [['created_at', 'DESC']]
    });

    res.json({ employees });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findByPk(req.params.id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'first_name', 'last_name', 'email', 'phone'] },
        { model: Department, as: 'department', attributes: ['id', 'name'] }
      ]
    });

    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    res.json({ employee });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByPk(req.params.id);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    const { department_id, pan_number, aadhar_number } = req.body;

    // Check if department exists and is active
    if (department_id) {
      const department = await Department.findByPk(department_id);
      if (!department) return res.status(404).json({ message: 'Department not found' });
      if (!department.is_active) return res.status(400).json({ message: 'Department is inactive' });
    }

    // Check if PAN already exists (excluding current employee)
    if (pan_number && pan_number !== employee.pan_number) {
      const panExists = await Employee.findOne({ where: { pan_number, id: { [Op.ne]: req.params.id } } });
      if (panExists) return res.status(400).json({ message: `Duplicate entry: PAN number '${pan_number}' is already registered with another employee (ID: ${panExists.employee_code}). Please enter a unique PAN.` });
    }

    // Check if Aadhar already exists (excluding current employee)
    if (aadhar_number && aadhar_number !== employee.aadhar_number) {
      const aadharExists = await Employee.findOne({ where: { aadhar_number, id: { [Op.ne]: req.params.id } } });
      if (aadharExists) return res.status(400).json({ message: `Duplicate entry: Aadhar number '${aadhar_number}' is already registered with another employee (ID: ${aadharExists.employee_code}). Please enter a unique Aadhar.` });
    }

    await employee.update(req.body);
    res.json({ message: 'Employee updated successfully', employee });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      const fields = error.errors ? error.errors.map(e => `${e.path} ('${e.value}')`).join(', ') : 'value';
      return res.status(400).json({ message: `Duplicate entry error: The ${fields} already exists in the system. Please use a unique value.` });
    }
    if (error.name === 'SequelizeValidationError') {
      const messages = error.errors ? error.errors.map(e => e.message).join(', ') : error.message;
      return res.status(400).json({ message: `Validation error: ${messages}` });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getSelfProfile = async (req, res) => {
  try {
    const employee = await Employee.findOne({ 
      where: { user_id: req.user.id },
      include: [
        { model: User, as: 'user', attributes: { exclude: ['password_hash'] } },
        { model: Department, as: 'department' }
      ]
    });
    if (!employee) return res.status(404).json({ message: 'Employee profile not found' });
    res.json({ employee });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateSelfProfile = async (req, res) => {
  try {
    const employee = await Employee.findOne({ where: { user_id: req.user.id } });
    if (!employee) return res.status(404).json({ message: 'Employee profile not found' });

    // Validate if PAN or Aadhar already exists for another employee
    if (req.body.pan_number && req.body.pan_number !== employee.pan_number) {
      const panExists = await Employee.findOne({ where: { pan_number: req.body.pan_number, id: { [Op.ne]: employee.id } } });
      if (panExists) return res.status(400).json({ message: `Duplicate entry: PAN number '${req.body.pan_number}' is already registered with another employee.` });
    }
    if (req.body.aadhar_number && req.body.aadhar_number !== employee.aadhar_number) {
      const aadharExists = await Employee.findOne({ where: { aadhar_number: req.body.aadhar_number, id: { [Op.ne]: employee.id } } });
      if (aadharExists) return res.status(400).json({ message: `Duplicate entry: Aadhar number '${req.body.aadhar_number}' is already registered with another employee.` });
    }

    // Prevent users from updating sensitive administrative fields
    const safeBody = { ...req.body };
    delete safeBody.salary;
    delete safeBody.designation;
    delete safeBody.department_id;
    delete safeBody.employee_code;
    delete safeBody.status;
    delete safeBody.joining_date;
    delete safeBody.employment_type;
    delete safeBody.user_id;

    await employee.update(safeBody);
    res.json({ message: 'Profile updated successfully', employee });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      const fields = error.errors ? error.errors.map(e => `${e.path} ('${e.value}')`).join(', ') : 'value';
      return res.status(400).json({ message: `Duplicate entry error: The ${fields} already exists in the system. Please use a unique value.` });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateEmployeeStatus = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { status, reason, remarks } = req.body;
    const employee = await Employee.findByPk(req.params.id, { transaction });
    if (!employee) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Employee not found' });
    }

    await employee.update({ status }, { transaction });

    // Create a status history record
    await EmployeeStatusHistory.create({
      employee_id: employee.id,
      status,
      changed_by: req.user.id,
      reason: reason || 'Status updated via API',
      remarks
    }, { transaction });

    await transaction.commit();
    res.json({ message: 'Employee status updated successfully', employee });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.bulkUpdateEmployeeStatus = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { employeeIds, status, reason, remarks } = req.body;
    
    if (!Array.isArray(employeeIds) || employeeIds.length === 0) {
      await transaction.rollback();
      return res.status(400).json({ message: 'employeeIds must be a non-empty array' });
    }
    
    if (!status || !['Active', 'Inactive', 'Resigned', 'Terminated'].includes(status)) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Valid status is required' });
    }

    await Employee.update({ status }, { 
      where: { id: { [Op.in]: employeeIds } },
      transaction 
    });

    const historyRecords = employeeIds.map(id => ({
      employee_id: id,
      status,
      changed_by: req.user.id,
      reason: reason || 'Bulk status update',
      remarks
    }));

    await EmployeeStatusHistory.bulkCreate(historyRecords, { transaction });

    await transaction.commit();
    res.json({ message: 'Employees status updated successfully' });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getEmployeeStatusHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const history = await EmployeeStatusHistory.findAll({
      where: { employee_id: id },
      include: [{ model: User, as: 'changer', attributes: ['first_name', 'last_name'] }],
      order: [['created_at', 'DESC']]
    });
    res.json({ history });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ============ LEAVE MANAGEMENT ============
exports.applyLeave = async (req, res) => {
  try {
    const { employee_id, leave_type, start_date, end_date, reason } = req.body;

    // Check if employee exists
    const employee = await Employee.findByPk(employee_id);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    if (employee.status !== 'Active') return res.status(400).json({ message: 'Only active employees can apply for leave' });

    const start = new Date(start_date);
    const end = new Date(end_date);
    // Use Math.round instead of Math.ceil to avoid floating point daylight savings errors
    const total_days = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;

    // Check if total days exceeds limit (e.g., max 30 days)
    if (total_days > 30) return res.status(400).json({ message: 'Leave duration cannot exceed 30 days' });

    // Check leave balance
    const balance = await LeaveBalance.findOne({
      where: { employee_id, year: new Date().getFullYear() }
    });

    if (balance) {
      // Only check balance for Sick, Casual, Earned - others (Maternity, Paternity, Unpaid) have no fixed limit
      const limitedTypes = ['sick', 'casual', 'earned'];
      const typeKey = leave_type.toLowerCase();
      if (limitedTypes.includes(typeKey)) {
        const usedField = `${typeKey}_leave_used`;
        const totalField = `${typeKey}_leave`;   // DB column: sick_leave, casual_leave, earned_leave
        const total = balance[totalField] || 0;
        const used = balance[usedField] || 0;
        const remaining = total - used;
        if (remaining < total_days) {
          return res.status(400).json({
            message: `Insufficient ${leave_type} leave balance. Available: ${remaining} days, Requested: ${total_days} days`
          });
        }
      }
    }

    // Check for overlapping leaves
    const overlapping = await Leave.findOne({
      where: {
        employee_id,
        status: { [Op.in]: ['Pending', 'Approved'] },
        [Op.or]: [
          { start_date: { [Op.between]: [start_date, end_date] } },
          { end_date: { [Op.between]: [start_date, end_date] } },
          {
            [Op.and]: [
              { start_date: { [Op.lte]: start_date } },
              { end_date: { [Op.gte]: end_date } }
            ]
          }
        ]
      }
    });

    if (overlapping) {
      return res.status(400).json({ message: 'Leave dates overlap with existing leave application' });
    }

    const leave = await Leave.create({
      employee_id, leave_type, start_date, end_date, total_days, reason, status: 'Pending'
    });

    res.status(201).json({ message: 'Leave applied successfully', leave });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getLeaves = async (req, res) => {
  try {
    const { employee_id, status, start_date, end_date } = req.query;
    const where = {};

    if (employee_id) where.employee_id = employee_id;
    if (status) where.status = status;
    if (start_date && end_date) {
      where.start_date = { [Op.between]: [start_date, end_date] };
    }

    const leaves = await Leave.findAll({
      where,
      include: [{ model: Employee, as: 'employee', include: [{ model: User, as: 'user' }] }],
      order: [['created_at', 'DESC']]
    });

    res.json({ leaves });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateLeaveStatus = async (req, res) => {
  try {
    const { status, remarks } = req.body;
    const leave = await Leave.findByPk(req.params.id);
    if (!leave) return res.status(404).json({ message: 'Leave not found' });

    // Only pending leaves can be approved/rejected
    if (leave.status !== 'Pending') {
      return res.status(400).json({ message: `Cannot update leave status. Current status: ${leave.status}` });
    }

    // Check leave balance again before approval
    if (status === 'Approved') {
      const balance = await LeaveBalance.findOne({
        where: { employee_id: leave.employee_id, year: new Date().getFullYear() }
      });

      if (balance) {
        const limitedTypes2 = ['sick', 'casual', 'earned'];
        const typeKey2 = leave.leave_type.toLowerCase();
        if (limitedTypes2.includes(typeKey2)) {
          const field = `${typeKey2}_leave_used`;
          const totalField = `${typeKey2}_leave`;
          const remaining = (balance[totalField] || 0) - (balance[field] || 0);
          if (remaining < leave.total_days) {
            return res.status(400).json({
              message: `Cannot approve. Insufficient leave balance. Available: ${remaining} days`
            });
          }
        }
      }
    }

    await leave.update({
      status,
      remarks,
      approved_by: req.user.id,
      approved_at: new Date()
    });

    // Update leave balance if approved
    if (status === 'Approved') {
      const balance = await LeaveBalance.findOne({
        where: { employee_id: leave.employee_id, year: new Date().getFullYear() }
      });

      if (balance) {
        const limitedTypes = ['sick', 'casual', 'earned'];
        const typeKey = leave.leave_type.toLowerCase();
        if (limitedTypes.includes(typeKey)) {
          const field = `${typeKey}_leave_used`;
          await balance.update({ [field]: (balance[field] || 0) + leave.total_days });
        }
      }
    }

    res.json({ message: 'Leave status updated successfully', leave });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getLeaveBalance = async (req, res) => {
  try {
    const { employee_id } = req.params;
    const year = req.query.year || new Date().getFullYear();

    let balance = await LeaveBalance.findOne({ where: { employee_id, year } });

    if (!balance) {
      balance = await LeaveBalance.create({ employee_id, year });
    }

    res.json({ balance });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ============ DOCUMENT MANAGEMENT ============
exports.uploadDocument = async (req, res) => {
  try {
    const { employee_id, document_type, document_name } = req.body;
    const file_path = req.file ? req.file.path : null;

    if (!file_path) return res.status(400).json({ message: 'File is required' });

    // Check if employee exists
    const employee = await Employee.findByPk(employee_id);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    // Validate file size (max 5MB)
    if (req.file.size > 5 * 1024 * 1024) {
      return res.status(400).json({ message: 'File size cannot exceed 5MB' });
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ message: 'Invalid file type. Allowed: PDF, JPG, PNG, DOC, DOCX' });
    }

    const document = await EmployeeDocument.create({
      employee_id, document_type, document_name, file_path, uploaded_by: req.user.id
    });

    res.status(201).json({ message: 'Document uploaded successfully', document });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getDocuments = async (req, res) => {
  try {
    const { employee_id } = req.params;

    const documents = await EmployeeDocument.findAll({
      where: { employee_id },
      order: [['created_at', 'DESC']]
    });

    res.json({ documents });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteDocument = async (req, res) => {
  try {
    const document = await EmployeeDocument.findByPk(req.params.id);
    if (!document) return res.status(404).json({ message: 'Document not found' });

    await document.destroy();
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ============ DEPARTMENTS ============
exports.createDepartment = async (req, res) => {
  try {
    const { name } = req.body;
    const branch_id = req.user.branch_id;

    // Check if department name already exists in this branch
    const existing = await Department.findOne({ where: { branch_id, name } });
    if (existing) return res.status(400).json({ message: 'Department name already exists' });

    const department = await Department.create({ branch_id, name, is_active: true });
    res.status(201).json({ message: 'Department created successfully', department });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getDepartments = async (req, res) => {
  try {
    const departments = await Department.findAll({
      where: { branch_id: req.user.branch_id },
      order: [['name', 'ASC']]
    });

    res.json({ departments });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ============ EXPERIENCE MANAGEMENT ============
exports.addExperience = async (req, res) => {
  try {
    const { id } = req.params;
    const { company_name, designation, start_date, end_date, description } = req.body;
    const experience = await EmployeeExperience.create({
      employee_id: id, company_name, designation, start_date, end_date, description
    });
    res.status(201).json({ message: 'Experience added successfully', experience });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getExperience = async (req, res) => {
  try {
    const { id } = req.params;
    const experience = await EmployeeExperience.findAll({
      where: { employee_id: id },
      order: [['start_date', 'DESC']]
    });
    res.json({ experience });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateExperience = async (req, res) => {
  try {
    const { exp_id } = req.params;
    const experience = await EmployeeExperience.findByPk(exp_id);
    if (!experience) return res.status(404).json({ message: 'Experience record not found' });
    await experience.update(req.body);
    res.json({ message: 'Experience updated successfully', experience });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteExperience = async (req, res) => {
  try {
    const { exp_id } = req.params;
    const experience = await EmployeeExperience.findByPk(exp_id);
    if (!experience) return res.status(404).json({ message: 'Experience record not found' });
    await experience.destroy();
    res.json({ message: 'Experience deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ============ EDUCATION MANAGEMENT ============
exports.addEducation = async (req, res) => {
  try {
    const { id } = req.params;
    const { degree, institution, year_of_passing, percentage } = req.body;
    const education = await EmployeeEducation.create({
      employee_id: id, degree, institution, year_of_passing, percentage
    });
    res.status(201).json({ message: 'Education added successfully', education });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getEducation = async (req, res) => {
  try {
    const { id } = req.params;
    const education = await EmployeeEducation.findAll({
      where: { employee_id: id },
      order: [['year_of_passing', 'DESC']]
    });
    res.json({ education });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateEducation = async (req, res) => {
  try {
    const { edu_id } = req.params;
    const education = await EmployeeEducation.findByPk(edu_id);
    if (!education) return res.status(404).json({ message: 'Education record not found' });
    await education.update(req.body);
    res.json({ message: 'Education updated successfully', education });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteEducation = async (req, res) => {
  try {
    const { edu_id } = req.params;
    const education = await EmployeeEducation.findByPk(edu_id);
    if (!education) return res.status(404).json({ message: 'Education record not found' });
    await education.destroy();
    res.json({ message: 'Education deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ============ EMPLOYEE REPORTS ============
exports.getEmployeeReports = async (req, res) => {
  try {
    const { type } = req.query; // 'overview', 'department', 'status', 'joining'

    if (type === 'overview') {
      const totalCount = await Employee.count();
      const activeCount = await Employee.count({ where: { status: 'Active' } });
      const maleCount = await Employee.count({ where: { gender: 'Male' } });
      const femaleCount = await Employee.count({ where: { gender: 'Female' } });
      const fullTimeCount = await Employee.count({ where: { employment_type: 'Full-Time' } });
      
      return res.json({
        total: totalCount,
        active: activeCount,
        newJoinings: 0, // Mock, needs joining date logic
        resignations: await Employee.count({ where: { status: 'Resigned' } }),
        genderDistribution: [
          { name: 'Male', value: maleCount },
          { name: 'Female', value: femaleCount }
        ],
        employmentType: [
          { name: 'Full-Time', value: fullTimeCount },
          { name: 'Part-Time', value: await Employee.count({ where: { employment_type: 'Part-Time' } }) },
          { name: 'Contract', value: await Employee.count({ where: { employment_type: 'Contract' } }) }
        ]
      });
    }

    if (type === 'department') {
      // Group by department_id and count
      const result = await Employee.findAll({
        attributes: [
          'department_id',
          [sequelize.fn('COUNT', sequelize.col('Employee.id')), 'total'],
          [sequelize.fn('SUM', sequelize.literal("CASE WHEN status = 'Active' THEN 1 ELSE 0 END")), 'activeCount']
        ],
        include: [{ model: Department, as: 'department', attributes: ['name'] }],
        group: ['department_id', 'department.id']
      });

      const formattedResult = result.map(r => ({
        name: r.department ? r.department.name : 'Unknown',
        total: parseInt(r.get('total')),
        active: parseInt(r.get('activeCount')) || 0
      }));

      return res.json({ data: formattedResult });
    }

    if (type === 'status') {
      const result = await Employee.findAll({
        attributes: [
          'status',
          [sequelize.fn('COUNT', sequelize.col('id')), 'value']
        ],
        group: ['status']
      });
      
      const formattedResult = result.map(r => ({
        name: r.status,
        value: parseInt(r.get('value'))
      }));

      return res.json({ data: formattedResult });
    }
    
    // Default mock response for other types until fully built out
    return res.json({ message: 'Report type not fully implemented yet' });
    
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ============ DOCUMENT MANAGEMENT ============
exports.uploadDocument = async (req, res) => {
  try {
    const { employee_id, document_type, document_name } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ message: 'File is required' });
    }

    const document = await EmployeeDocument.create({
      employee_id,
      document_type,
      document_name: document_name || req.file.originalname,
      file_path: req.file.path,
      uploaded_by: req.user.id
    });

    res.status(201).json({ message: 'Document uploaded successfully', document });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getAllDocuments = async (req, res) => {
  try {
    const documents = await EmployeeDocument.findAll({
      include: [
        {
          model: Employee,
          as: 'employee',
          include: [{ model: User, as: 'user', attributes: ['first_name', 'last_name'] }]
        }
      ],
      order: [['created_at', 'DESC']]
    });
    res.json({ documents });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getDocuments = async (req, res) => {
  try {
    const { employee_id } = req.params;
    const documents = await EmployeeDocument.findAll({
      where: { employee_id },
      order: [['created_at', 'DESC']]
    });
    res.json({ documents });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const document = await EmployeeDocument.findByPk(id);
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // In a real application, you would also delete the file from the filesystem/S3 here
    await document.destroy();
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
