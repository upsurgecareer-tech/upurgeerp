const { Employee, User, Department } = require('../models');
// SalaryStructure and Payroll are not exported from models/index.js — import directly
const SalaryStructure = require('../models/SalaryStructure');
const Payroll = require('../models/Payroll');

const getLocalTodayDate = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().split('T')[0];
};

// GET /hrms-payroll/employees
// Fetch all employees with user info, department name, and latest salary structure
exports.getEmployeesWithSalary = async (req, res) => {
  try {
    const employees = await Employee.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'first_name', 'last_name', 'email'],
          where: { branch_id: req.user.branch_id }
        },
        {
          model: Department,
          as: 'department',
          attributes: ['id', 'name']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    // Attach latest salary structure for each employee
    const result = await Promise.all(
      employees.map(async (emp) => {
        const salary = await SalaryStructure.findOne({
          where: { user_id: emp.user_id },
          order: [['effective_from', 'DESC']],
          attributes: ['basic_salary', 'total_salary', 'effective_from', 'allowances', 'deductions']
        });

        return {
          id: emp.id,
          employee_code: emp.employee_code,
          designation: emp.designation,
          employment_type: emp.employment_type,
          status: emp.status,
          joining_date: emp.joining_date,
          user: emp.user,
          department: emp.department,
          salary_structure: salary || null
        };
      })
    );

    res.json({ employees: result });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// POST /hrms-payroll/salary-structure
// Create or update salary structure for an employee
exports.createOrUpdateSalaryStructure = async (req, res) => {
  try {
    const {
      employee_user_id,
      basic_salary,
      allowances,
      deductions,
      total_salary,
      effective_from
    } = req.body;

    if (!employee_user_id || !basic_salary || !total_salary || !effective_from) {
      return res.status(400).json({
        message: 'employee_user_id, basic_salary, total_salary, and effective_from are required'
      });
    }

    // Check if the user belongs to the same branch
    const user = await User.findOne({ where: { id: employee_user_id, branch_id: req.user.branch_id } });
    if (!user) {
      return res.status(404).json({ message: 'Employee not found or unauthorized' });
    }

    // Upsert: update existing record for same user_id + effective_from, or create new
    const [salaryStructure, created] = await SalaryStructure.findOrCreate({
      where: { user_id: employee_user_id, effective_from },
      defaults: {
        user_id: employee_user_id,
        basic_salary,
        allowances: allowances || {},
        deductions: deductions || {},
        total_salary,
        effective_from
      }
    });

    if (!created) {
      await salaryStructure.update({
        basic_salary,
        allowances: allowances || salaryStructure.allowances,
        deductions: deductions || salaryStructure.deductions,
        total_salary
      });
    }

    res.status(created ? 201 : 200).json({
      message: created ? 'Salary structure created' : 'Salary structure updated',
      salary_structure: salaryStructure
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /hrms-payroll/salary-structure/:employee_id
// Get salary structure for an employee by employee.id
exports.getEmployeeSalaryStructure = async (req, res) => {
  try {
    const { employee_id } = req.params;

    const employee = await Employee.findByPk(employee_id, {
      include: [{ 
        model: User, 
        as: 'user', 
        attributes: ['id', 'first_name', 'last_name', 'email'],
        where: { branch_id: req.user.branch_id }
      }]
    });

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const salaryStructures = await SalaryStructure.findAll({
      where: { user_id: employee.user_id },
      order: [['effective_from', 'DESC']]
    });

    res.json({
      employee: {
        id: employee.id,
        employee_code: employee.employee_code,
        designation: employee.designation,
        user: employee.user
      },
      salary_structures: salaryStructures
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /hrms-payroll/
// Fetch payroll list joined with user info
exports.getPayrollList = async (req, res) => {
  try {
    const { month, year, status } = req.query;
    const where = {};
    if (month) where.month = month;
    if (status) where.status = status;

    const payrollRecords = await Payroll.findAll({
      where,
      order: [['created_at', 'DESC']]
    });

    // Attach user info for each payroll record, filtering out cross-branch
    const result = [];
    for (const record of payrollRecords) {
      const user = await User.findOne({
        where: { id: record.user_id, branch_id: req.user.branch_id },
        attributes: ['id', 'first_name', 'last_name', 'email']
      });

      if (!user) continue;

      result.push({
        id: record.id,
        month: record.month,
        basic_salary: record.basic_salary,
        allowances: record.allowances,
        deductions: record.deductions,
        net_salary: record.net_salary,
        payment_date: record.payment_date,
        payment_mode: record.payment_mode,
        status: record.status,
        created_at: record.created_at,
        employee: user
      });
    }

    res.json({ payroll: result });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// POST /hrms-payroll/generate
// Generate a payroll record for a specific employee
exports.generatePayrollForEmployee = async (req, res) => {
  try {
    const {
      employee_id,
      month,
      year,
      basic_salary,
      allowances,
      deductions,
      net_salary
    } = req.body;

    if (!employee_id || !month || !year || !basic_salary || net_salary === undefined) {
      return res.status(400).json({
        message: 'employee_id, month, year, basic_salary, and net_salary are required'
      });
    }

    const employee = await Employee.findOne({
      where: { id: employee_id },
      include: [{ model: User, as: 'user', where: { branch_id: req.user.branch_id } }]
    });
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found or unauthorized' });
    }

    // Format month as YYYY-MM string
    const monthStr = `${year}-${String(month).padStart(2, '0')}`;

    // Check for duplicate payroll
    const existingPayroll = await Payroll.findOne({
      where: { user_id: employee.user_id, month: monthStr }
    });
    if (existingPayroll) {
      return res.status(400).json({ message: `Payroll already generated for ${monthStr}` });
    }

    // Validate net salary calculation strictly
    const safeBasic = Number(basic_salary);
    const safeAllowances = Number(allowances) || 0;
    const safeDeductions = Number(deductions) || 0;
    const safeNet = Number(net_salary);

    if (isNaN(safeBasic) || isNaN(safeAllowances) || isNaN(safeDeductions) || isNaN(safeNet)) {
      return res.status(400).json({ message: 'Invalid numerical values for salary calculation' });
    }

    const calcNet = safeBasic + safeAllowances - safeDeductions;
    if (Math.abs(calcNet - safeNet) > 0.01) {
      return res.status(400).json({ message: 'Invalid net salary calculation. Expected: ' + calcNet });
    }

    const payroll = await Payroll.create({
      user_id: employee.user_id,
      month: monthStr,
      basic_salary,
      allowances: allowances || 0,
      deductions: deductions || 0,
      net_salary,
      status: 'Pending'
    });

    res.status(201).json({ message: 'Payroll generated successfully', payroll });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// PUT /hrms-payroll/:id/approve
// Mark payroll as Paid and set payment_date to today
exports.approvePayroll = async (req, res) => {
  try {
    const payroll = await Payroll.findByPk(req.params.id);
    if (!payroll) {
      return res.status(404).json({ message: 'Payroll record not found' });
    }

    const user = await User.findOne({ where: { id: payroll.user_id, branch_id: req.user.branch_id } });
    if (!user) {
      return res.status(404).json({ message: 'Payroll record not found or unauthorized' });
    }

    const today = getLocalTodayDate();
    await payroll.update({ status: 'Paid', payment_date: today });

    res.json({ message: 'Payroll approved and marked as Paid', payroll });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
