const { Op, fn, col, literal } = require('sequelize');
const sequelize = require('../config/database');
const Student = require('../models/Student');
const Lead = require('../models/Lead');
const FeePayment = require('../models/FeePayment');
const User = require('../models/User');

// Dashboard Analytics
exports.getDashboardStats = async (req, res) => {
  try {
    const branch_id = req.user.branch_id;

    const [totalStudents, totalLeads, totalRevenue, activeStaff] = await Promise.all([
      Student.count({ where: { branch_id } }),
      Lead.count({ where: { branch_id } }),
      FeePayment.sum('amount_paid', { where: {} }).then(sum => sum || 0),
      User.count({ where: { branch_id, status: 'active' } }),
    ]);

    res.json({
      totalStudents: totalStudents || 0,
      totalLeads: totalLeads || 0,
      totalRevenue: totalRevenue || 0,
      totalExpenses: 0,
      netProfit: totalRevenue || 0,
      activeStaff: activeStaff || 0,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Student Reports
exports.getStudentReport = async (req, res) => {
  try {
    const { search, status } = req.query;
    const where = { branch_id: req.user.branch_id };
    if (status) where.status = status;
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { mobile: { [Op.like]: `%${search}%` } },
      ];
    }
    const students = await Student.findAll({ where, order: [['created_at', 'DESC']] });
    res.json({ students });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Fee Collection Report
exports.getFeeCollectionReport = async (req, res) => {
  try {
    const [results] = await sequelize.query(`
      SELECT 
        DATE_FORMAT(payment_date, '%Y-%m') as month,
        SUM(amount_paid) as total_collected,
        COUNT(*) as payment_count
      FROM fee_payments
      WHERE payment_date >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(payment_date, '%Y-%m')
      ORDER BY month DESC
    `);
    res.json({ data: results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Attendance Report
exports.getAttendanceReport = async (req, res) => {
  try {
    const branch_id = req.user.branch_id;
    const [results] = await sequelize.query(`
      SELECT 
        a.status,
        COUNT(a.id) as count
      FROM attendance a
      JOIN students s ON a.student_id = s.id
      WHERE s.branch_id = ?
      GROUP BY a.status
    `, { replacements: [branch_id] });
    res.json({ data: results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Lead Conversion Report
exports.getLeadConversionReport = async (req, res) => {
  try {
    const branch_id = req.user.branch_id;
    const leads = await Lead.findAll({
      where: { branch_id },
      attributes: ['stage', [fn('COUNT', col('id')), 'count']],
      group: ['stage'],
    });
    const totalLeads = await Lead.count({ where: { branch_id } });
    const convertedLeads = await Lead.count({ where: { branch_id, stage: 'Converted' } });
    const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(2) : 0;
    res.json({ byStage: leads, totalLeads, convertedLeads, conversionRate: parseFloat(conversionRate) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Revenue Report
exports.getRevenueReport = async (req, res) => {
  try {
    const [results] = await sequelize.query(`
      SELECT 
        DATE_FORMAT(payment_date, '%Y-%m') as period,
        SUM(amount_paid) as total
      FROM fee_payments
      WHERE payment_date >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(payment_date, '%Y-%m')
      ORDER BY period ASC
    `);
    res.json({ data: results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Expense Report - placeholder (no expense model in minimal setup)
exports.getExpenseReport = async (req, res) => {
  res.json({ byCategory: [], totalExpenses: 0 });
};

// Library Report - placeholder
exports.getLibraryReport = async (req, res) => {
  res.json({ totalBooks: 0, issuedBooks: 0, overdueBooks: 0, availableBooks: 0 });
};

// Inventory Report - placeholder
exports.getInventoryReport = async (req, res) => {
  res.json({ byStatus: [], totalValue: 0 });
};

// Export Report
exports.exportReport = async (req, res) => {
  try {
    const { reportType } = req.query;
    let data = [];

    if (reportType === 'students') {
      data = await Student.findAll({
        where: { branch_id: req.user.branch_id },
        attributes: ['admission_no', 'name', 'email', 'mobile', 'status'],
      });
    } else if (reportType === 'leads') {
      data = await Lead.findAll({
        where: { branch_id: req.user.branch_id },
        attributes: ['name', 'email', 'mobile', 'stage', 'source', 'status'],
      });
    } else {
      return res.status(400).json({ error: 'Invalid report type' });
    }

    const rows = data.map(d => d.dataValues || d);
    if (rows.length === 0) return res.json([]);
    const headers = Object.keys(rows[0]);
    const csv = [headers.join(','), ...rows.map(r => headers.map(h => JSON.stringify(r[h] || '')).join(','))].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${reportType}_report.csv`);
    res.send(csv);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
