const User = require('../models/User');
const SalaryStructure = require('../models/SalaryStructure');
const Payroll = require('../models/Payroll');
const StaffAttendance = require('../models/StaffAttendance');
const Timesheet = require('../models/Timesheet');
const Role = require('../models/Role');
const Department = require('../models/Department');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

exports.createStaff = async (req, res) => {
  try {
    const { first_name, last_name, email, phone, role_id, department_id, designation, joining_date, salary } = req.body;
    const branch_id = req.user.branch_id;

    // Check if email already exists
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: `Duplicate entry: Email '${email}' already exists in the system. Please use a unique email address.` });
    }

    // Generate password
    const password = Math.random().toString(36).slice(-8);
    const password_hash = await bcrypt.hash(password, 12);

    // Use email as the username
    let username = email;

    const staff = await User.create({
      branch_id,
      organization_id: req.user.organization_id,
      role_id: role_id || 3,
      username,
      first_name,
      last_name: last_name || '',
      email,
      phone,
      password_hash,
      status: 'active'
    });

    // Create salary structure if provided
    if (salary) {
      await SalaryStructure.create({
        user_id: staff.id,
        basic_salary: salary,
        allowances: {},
        deductions: {},
        total_salary: salary,
        effective_from: joining_date || new Date()
      });
    }

    res.status(201).json({ 
      message: 'Staff created successfully', 
      staff,
      credentials: { email, password, username }
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      const fields = error.errors ? error.errors.map(e => `${e.path} ('${e.value}')`).join(', ') : 'value';
      return res.status(409).json({ message: `Duplicate entry error: The ${fields} already exists in the system. Please use a unique value.` });
    }
    if (error.name === 'SequelizeValidationError') {
      const messages = error.errors ? error.errors.map(e => e.message).join(', ') : error.message;
      return res.status(400).json({ message: `Validation error: ${messages}` });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getStaff = async (req, res) => {
  try {
    const { role_id, department_id, search, status } = req.query;
    const where = { branch_id: req.user.branch_id };

    if (role_id) where.role_id = role_id;
    if (status) where.status = status;
    if (search) {
      where[Op.or] = [
        { first_name: { [Op.like]: `%${search}%` } },
        { last_name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } }
      ];
    }

    const staff = await User.findAll({ 
      where, 
      order: [['created_at', 'DESC']],
      attributes: { exclude: ['password_hash'] }
    });
    
    res.json({ staff });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getStaffById = async (req, res) => {
  try {
    const staff = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password_hash'] }
    });
    
    if (!staff) {
      return res.status(404).json({ message: 'Staff not found' });
    }

    // Get salary structure
    const salary = await SalaryStructure.findOne({
      where: { user_id: staff.id },
      order: [['effective_from', 'DESC']]
    });

    res.json({ staff, salary });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateStaff = async (req, res) => {
  try {
    const staff = await User.findByPk(req.params.id);
    if (!staff) {
      return res.status(404).json({ message: 'Staff not found' });
    }

    const { password, ...updateData } = req.body;
    await staff.update(updateData);
    
    res.json({ message: 'Staff updated successfully', staff });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      const fields = error.errors ? error.errors.map(e => `${e.path} ('${e.value}')`).join(', ') : 'value';
      return res.status(409).json({ message: `Duplicate entry error: The ${fields} already exists in the system. Please use a unique value.` });
    }
    if (error.name === 'SequelizeValidationError') {
      const messages = error.errors ? error.errors.map(e => e.message).join(', ') : error.message;
      return res.status(400).json({ message: `Validation error: ${messages}` });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateStaffStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const staff = await User.findByPk(req.params.id);
    if (!staff) {
      return res.status(404).json({ message: 'Staff not found' });
    }

    await staff.update({ status });
    res.json({ message: 'Staff status updated successfully', staff });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const staff = await User.findByPk(req.params.id);
    if (!staff) {
      return res.status(404).json({ message: 'Staff not found' });
    }

    const newPassword = Math.random().toString(36).slice(-8);
    const password_hash = await bcrypt.hash(newPassword, 12);

    await staff.update({ password_hash });

    res.json({ message: 'Password reset successfully', newPassword });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.setSalary = async (req, res) => {
  try {
    const { id } = req.params;
    const { basic_salary, allowances, deductions, effective_from } = req.body;

    const total_salary = parseFloat(basic_salary) + 
                        (allowances ? Object.values(allowances).reduce((a, b) => a + parseFloat(b || 0), 0) : 0) -
                        (deductions ? Object.values(deductions).reduce((a, b) => a + parseFloat(b || 0), 0) : 0);

    const salary = await SalaryStructure.create({
      user_id: id,
      basic_salary,
      allowances: allowances || {},
      deductions: deductions || {},
      total_salary,
      effective_from: effective_from || new Date()
    });

    res.status(201).json({ message: 'Salary structure set successfully', salary });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getSalary = async (req, res) => {
  try {
    const { id } = req.params;
    const salary = await SalaryStructure.findOne({
      where: { user_id: id },
      order: [['effective_from', 'DESC']]
    });

    if (!salary) {
      return res.status(404).json({ message: 'Salary structure not found' });
    }

    res.json({ salary });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Staff Attendance
exports.markAttendance = async (req, res) => {
  try {
    const { user_id, date, check_in, check_out, status, remarks } = req.body;

    const existing = await StaffAttendance.findOne({ where: { user_id, date } });
    if (existing) {
      await existing.update({ check_in, check_out, status, remarks });
      return res.json({ message: 'Attendance updated successfully', attendance: existing });
    }

    const attendance = await StaffAttendance.create({
      user_id,
      date,
      check_in,
      check_out,
      status: status || 'Present',
      remarks
    });

    res.status(201).json({ message: 'Attendance marked successfully', attendance });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getAttendance = async (req, res) => {
  try {
    const { user_id, start_date, end_date } = req.query;
    const where = {};

    if (user_id) where.user_id = user_id;
    if (start_date && end_date) {
      where.date = { [Op.between]: [start_date, end_date] };
    }

    const attendance = await StaffAttendance.findAll({
      where,
      order: [['date', 'DESC']]
    });

    res.json({ attendance });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Payroll
exports.generatePayroll = async (req, res) => {
  try {
    const { user_id, month } = req.body;

    // Get salary structure
    const salary = await SalaryStructure.findOne({
      where: { user_id },
      order: [['effective_from', 'DESC']]
    });

    if (!salary) {
      return res.status(404).json({ message: 'Salary structure not found' });
    }

    // Check if payroll already exists
    const existing = await Payroll.findOne({ where: { user_id, month } });
    if (existing) {
      return res.status(409).json({ message: 'Payroll already generated for this month' });
    }

    const allowances = salary.allowances ? Object.values(salary.allowances).reduce((a, b) => a + parseFloat(b || 0), 0) : 0;
    const deductions = salary.deductions ? Object.values(salary.deductions).reduce((a, b) => a + parseFloat(b || 0), 0) : 0;
    const net_salary = parseFloat(salary.basic_salary) + allowances - deductions;

    const payroll = await Payroll.create({
      user_id,
      month,
      basic_salary: salary.basic_salary,
      allowances,
      deductions,
      net_salary,
      status: 'Pending'
    });

    res.status(201).json({ message: 'Payroll generated successfully', payroll });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getPayroll = async (req, res) => {
  try {
    const { user_id, month, status } = req.query;
    const where = {};

    if (user_id) where.user_id = user_id;
    if (month) where.month = month;
    if (status) where.status = status;

    const payroll = await Payroll.findAll({
      where,
      order: [['month', 'DESC']]
    });

    res.json({ payroll });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updatePayrollStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, payment_date, payment_mode } = req.body;

    const payroll = await Payroll.findByPk(id);
    if (!payroll) {
      return res.status(404).json({ message: 'Payroll not found' });
    }

    await payroll.update({ status, payment_date, payment_mode });
    res.json({ message: 'Payroll status updated successfully', payroll });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Timesheet
exports.createTimesheet = async (req, res) => {
  try {
    const { user_id, date, hours_worked, task_description, project } = req.body;

    const timesheet = await Timesheet.create({
      user_id,
      date,
      hours_worked,
      task_description,
      project,
      status: 'Draft'
    });

    res.status(201).json({ message: 'Timesheet created successfully', timesheet });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getTimesheets = async (req, res) => {
  try {
    const { user_id, start_date, end_date, status } = req.query;
    const where = {};

    if (user_id) where.user_id = user_id;
    if (status) where.status = status;
    if (start_date && end_date) {
      where.date = { [Op.between]: [start_date, end_date] };
    }

    const timesheets = await Timesheet.findAll({
      where,
      order: [['date', 'DESC']]
    });

    res.json({ timesheets });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateTimesheetStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const timesheet = await Timesheet.findByPk(id);
    if (!timesheet) {
      return res.status(404).json({ message: 'Timesheet not found' });
    }

    await timesheet.update({ status });
    res.json({ message: 'Timesheet status updated successfully', timesheet });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Staff Reports
exports.getStaffReport = async (req, res) => {
  try {
    const branch_id = req.user.branch_id;

    const [results] = await sequelize.query(`
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        u.status,
        r.name as role_name,
        COUNT(DISTINCT sa.id) as total_attendance,
        SUM(CASE WHEN sa.status = 'Present' THEN 1 ELSE 0 END) as present_days,
        ss.total_salary
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      LEFT JOIN staff_attendance sa ON u.id = sa.user_id
      LEFT JOIN salary_structures ss ON u.id = ss.user_id
      WHERE u.branch_id = ?
      GROUP BY u.id, u.first_name, u.last_name, u.email, u.phone, u.status, r.name, ss.total_salary
      ORDER BY u.created_at DESC
    `, { replacements: [branch_id] });

    res.json({ staff: results });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Generate Staff ID Card
exports.generateIDCard = async (req, res) => {
  try {
    const { id } = req.params;
    const staff = await User.findByPk(id);

    if (!staff) {
      return res.status(404).json({ message: 'Staff not found' });
    }

    // Generate employee ID if not exists
    let employeeId = `EMP${staff.branch_id}${String(staff.id).padStart(4, '0')}`;

    const idCardData = {
      employeeId,
      name: `${staff.first_name} ${staff.last_name || ''}`.trim(),
      email: staff.email,
      phone: staff.phone,
      designation: 'Staff Member'
    };

    res.status(201).json({
      message: 'Staff ID Card data generated successfully',
      idCardData
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
