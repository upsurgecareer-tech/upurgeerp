const { Op, fn, col, literal } = require('sequelize');
const sequelize = require('../config/database');

class AnalyticsService {
  // Student Growth Analytics
  static async getStudentGrowth(organizationId, startDate, endDate) {
    const { Student } = require('../models/Student');
    
    const growth = await Student.findAll({
      where: {
        organizationId,
        createdAt: { [Op.between]: [startDate, endDate] }
      },
      attributes: [
        [fn('DATE_FORMAT', col('created_at'), '%Y-%m'), 'month'],
        [fn('COUNT', col('id')), 'count']
      ],
      group: [literal('month')],
      order: [[literal('month'), 'ASC']]
    });

    return growth;
  }

  // Revenue Trends
  static async getRevenueTrends(organizationId, startDate, endDate) {
    const { FeePayment } = require('../models/Admission');
    
    const trends = await FeePayment.findAll({
      where: {
        organizationId,
        status: 'Completed',
        paymentDate: { [Op.between]: [startDate, endDate] }
      },
      attributes: [
        [fn('DATE_FORMAT', col('payment_date'), '%Y-%m'), 'month'],
        [fn('SUM', col('amount')), 'revenue'],
        [fn('COUNT', col('id')), 'transactions']
      ],
      group: [literal('month')],
      order: [[literal('month'), 'ASC']]
    });

    return trends;
  }

  // Attendance Trends
  static async getAttendanceTrends(organizationId, batchId, startDate, endDate) {
    const { Attendance } = require('../models/Batch');
    
    const where = {
      organizationId,
      date: { [Op.between]: [startDate, endDate] }
    };
    if (batchId) where.batchId = batchId;

    const trends = await Attendance.findAll({
      where,
      attributes: [
        [fn('DATE', col('date')), 'date'],
        'status',
        [fn('COUNT', col('id')), 'count']
      ],
      group: [literal('date'), 'status'],
      order: [[literal('date'), 'ASC']]
    });

    return trends;
  }

  // Lead Source Performance
  static async getLeadSourcePerformance(organizationId, startDate, endDate) {
    const { Lead } = require('../models/Lead');
    
    const where = { organizationId };
    if (startDate && endDate) {
      where.createdAt = { [Op.between]: [startDate, endDate] };
    }

    const performance = await Lead.findAll({
      where,
      attributes: [
        'sourceId',
        [fn('COUNT', col('id')), 'totalLeads'],
        [fn('SUM', literal("CASE WHEN stage = 'Converted' THEN 1 ELSE 0 END")), 'converted']
      ],
      group: ['sourceId'],
      include: [{ association: 'source', attributes: ['name'] }]
    });

    return performance;
  }

  // Course Popularity
  static async getCoursePopularity(organizationId) {
    const { CoursePackage } = require('../models/Admission');
    const { Admission } = require('../models/Admission');
    
    const popularity = await Admission.findAll({
      where: { organizationId },
      attributes: [
        'coursePackageId',
        [fn('COUNT', col('id')), 'enrollments']
      ],
      group: ['coursePackageId'],
      include: [{ model: CoursePackage, as: 'coursePackage', attributes: ['name', 'fees'] }],
      order: [[literal('enrollments'), 'DESC']]
    });

    return popularity;
  }

  // Staff Performance
  static async getStaffPerformance(organizationId, startDate, endDate) {
    const { User } = require('../models/User');
    const { Lead } = require('../models/Lead');
    
    const performance = await Lead.findAll({
      where: {
        organizationId,
        assignedTo: { [Op.ne]: null },
        ...(startDate && endDate && { createdAt: { [Op.between]: [startDate, endDate] } })
      },
      attributes: [
        'assignedTo',
        [fn('COUNT', col('id')), 'totalLeads'],
        [fn('SUM', literal("CASE WHEN stage = 'Converted' THEN 1 ELSE 0 END")), 'conversions']
      ],
      group: ['assignedTo'],
      include: [{ model: User, as: 'assignedUser', attributes: ['firstName', 'lastName'] }]
    });

    return performance;
  }

  // Financial Summary
  static async getFinancialSummary(organizationId, startDate, endDate) {
    const { FeePayment } = require('../models/Admission');
    const { Expense } = require('../models/Accounting');
    
    const [revenue, expenses] = await Promise.all([
      FeePayment.sum('amount', {
        where: {
          organizationId,
          status: 'Completed',
          paymentDate: { [Op.between]: [startDate, endDate] }
        }
      }),
      Expense.sum('amount', {
        where: {
          organizationId,
          status: 'Approved',
          expenseDate: { [Op.between]: [startDate, endDate] }
        }
      })
    ]);

    return {
      revenue: revenue || 0,
      expenses: expenses || 0,
      profit: (revenue || 0) - (expenses || 0),
      profitMargin: revenue > 0 ? (((revenue - (expenses || 0)) / revenue) * 100).toFixed(2) : 0
    };
  }

  // Batch Performance
  static async getBatchPerformance(organizationId) {
    const { Batch, BatchStudent } = require('../models/Batch');
    const { Attendance } = require('../models/Batch');
    
    const batches = await Batch.findAll({
      where: { organizationId, status: 'Active' },
      attributes: ['id', 'name']
    });

    const performance = await Promise.all(batches.map(async (batch) => {
      const [totalStudents, avgAttendance] = await Promise.all([
        BatchStudent.count({ where: { batchId: batch.id, status: 'Active' } }),
        Attendance.count({
          where: { batchId: batch.id, status: 'Present' }
        })
      ]);

      return {
        batchId: batch.id,
        batchName: batch.name,
        totalStudents,
        avgAttendance
      };
    }));

    return performance;
  }

  // Predictive Analytics - At Risk Students
  static async getAtRiskStudents(organizationId) {
    const { Student } = require('../models/Student');
    const { Attendance } = require('../models/Batch');
    const { FeePayment } = require('../models/Admission');
    
    const students = await Student.findAll({
      where: { organizationId, status: 'Active' },
      attributes: ['id', 'firstName', 'lastName']
    });

    const atRisk = await Promise.all(students.map(async (student) => {
      const [totalAttendance, presentCount, pendingFees] = await Promise.all([
        Attendance.count({ where: { studentId: student.id } }),
        Attendance.count({ where: { studentId: student.id, status: 'Present' } }),
        FeePayment.sum('amount', { where: { studentId: student.id, status: 'Pending' } })
      ]);

      const attendanceRate = totalAttendance > 0 ? (presentCount / totalAttendance) * 100 : 100;
      const isAtRisk = attendanceRate < 75 || (pendingFees || 0) > 0;

      if (isAtRisk) {
        return {
          studentId: student.id,
          studentName: `${student.firstName} ${student.lastName}`,
          attendanceRate: attendanceRate.toFixed(2),
          pendingFees: pendingFees || 0,
          riskLevel: attendanceRate < 50 ? 'High' : 'Medium'
        };
      }
      return null;
    }));

    return atRisk.filter(s => s !== null);
  }
}

module.exports = AnalyticsService;
