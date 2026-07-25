const Payroll = require('../models/Payroll');
const SalaryStructure = require('../models/SalaryStructure');
const StaffAttendance = require('../models/StaffAttendance');
const User = require('../models/User');
const { Op } = require('sequelize');

exports.generatePayroll = async (req, res) => {
  try {
    const { month, year } = req.body;
    const branch_id = req.user.branch_id;

    // Get all active staff
    const staff = await User.findAll({ where: { branch_id, is_active: true } });

    const payrollRecords = [];

    for (const employee of staff) {
      // Get salary structure
      const salary = await SalaryStructure.findOne({
        where: { user_id: employee.id },
        order: [['effective_from', 'DESC']]
      });

      if (!salary) continue;

      // Calculate working days and present days
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      const working_days = endDate.getDate();

      const attendance = await StaffAttendance.count({
        where: {
          user_id: employee.id,
          date: { [Op.between]: [startDate, endDate] },
          status: { [Op.in]: ['Present', 'Half-Day'] }
        }
      });

      const present_days = attendance;

      // Calculate salary
      const basic_paid = (salary.basic_salary / working_days) * present_days;
      const total_allowances = parseFloat(salary.hra) + parseFloat(salary.other_allowances);
      const total_deductions = parseFloat(salary.pf_deduction) + parseFloat(salary.tds_deduction) + parseFloat(salary.other_deductions);
      const net_salary = basic_paid + total_allowances - total_deductions;

      const payroll = await Payroll.create({
        user_id: employee.id,
        month,
        year,
        working_days,
        present_days,
        basic_paid,
        total_allowances,
        total_deductions,
        net_salary,
        status: 'Draft'
      });

      payrollRecords.push(payroll);
    }

    res.status(201).json({ 
      message: 'Payroll generated successfully', 
      generated_count: payrollRecords.length 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getPayroll = async (req, res) => {
  try {
    const { month, year, status } = req.query;
    const where = {};

    if (month) where.month = month;
    if (year) where.year = year;
    if (status) where.status = status;

    const payroll = await Payroll.findAll({ where, order: [['created_at', 'DESC']] });
    res.json({ payroll });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getPayrollById = async (req, res) => {
  try {
    const payroll = await Payroll.findByPk(req.params.id);
    if (!payroll) {
      return res.status(404).json({ message: 'Payroll not found' });
    }
    res.json({ payroll });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.approvePayroll = async (req, res) => {
  try {
    const payroll = await Payroll.findByPk(req.params.id);
    if (!payroll) {
      return res.status(404).json({ message: 'Payroll not found' });
    }

    await payroll.update({ status: 'Approved' });

    // TODO: Generate payslip PDF
    // TODO: Send payslip via email

    res.json({ message: 'Payroll approved successfully', payroll });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getStaffPayroll = async (req, res) => {
  try {
    const { id } = req.params;
    const payroll = await Payroll.findAll({
      where: { user_id: id },
      order: [['year', 'DESC'], ['month', 'DESC']]
    });
    res.json({ payroll });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
