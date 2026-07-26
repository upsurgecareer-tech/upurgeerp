const FeePayment = require('../models/FeePayment');
const FeeSchedule = require('../models/FeeSchedule');
const Admission = require('../models/Admission');

exports.recordPayment = async (req, res) => {
  try {
    const { fee_schedule_id, admission_id, amount_paid, payment_mode, payment_date, remarks } = req.body;

    // Validate Admission and IDOR
    const admission = await Admission.findByPk(admission_id, {
      include: [{ model: require('../models/Student'), as: 'student', attributes: ['branch_id'] }]
    });

    if (!admission) {
      return res.status(400).json({ message: 'Invalid admission_id: Admission not found' });
    }

    if (req.user.role_id !== 1 && admission.student && admission.student.branch_id !== req.user.branch_id) {
      return res.status(403).json({ message: 'Permission denied: Cannot process payment for a student in another branch' });
    }

    // Generate receipt number
    const count = await FeePayment.count();
    const receipt_no = `RCP${String(count + 1).padStart(6, '0')}`;

    const payment = await FeePayment.create({
      fee_schedule_id,
      admission_id,
      amount_paid,
      payment_mode,
      payment_date,
      receipt_no,
      received_by: req.user.id,
      remarks
    });

    // Update fee schedule status if fully paid
    if (fee_schedule_id) {
      const schedule = await FeeSchedule.findByPk(fee_schedule_id);
      if (schedule && amount_paid >= schedule.amount) {
        await schedule.update({ status: 'Paid' });
      }
    }

    res.status(201).json({ message: 'Payment recorded successfully', payment });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getPaymentHistory = async (req, res) => {
  try {
    const { id } = req.params;

    // IDOR Check
    const admission = await Admission.findByPk(id, {
      include: [{ model: require('../models/Student'), as: 'student', attributes: ['branch_id'] }]
    });

    if (!admission) {
      return res.status(404).json({ message: 'Admission not found' });
    }

    if (req.user.role_id !== 1 && admission.student && admission.student.branch_id !== req.user.branch_id) {
      return res.status(403).json({ message: 'Permission denied: Cannot view payment history for a student in another branch' });
    }

    const payments = await FeePayment.findAll({
      where: { admission_id: id },
      order: [['payment_date', 'DESC']]
    });
    res.json({ payments });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getPaymentReceipt = async (req, res) => {
  try {
    const payment = await FeePayment.findByPk(req.params.id);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // TODO: Generate PDF receipt
    res.json({ message: 'Receipt generation coming soon', payment });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getDuePayments = async (req, res) => {
  try {
    const { Op } = require('sequelize');
    const today = new Date();

    const whereClause = {
      status: 'Pending',
      due_date: { [Op.lte]: today }
    };

    const includeClause = [{
      model: Admission,
      as: 'admission',
      include: [{
        model: require('../models/Student'),
        as: 'student',
        where: req.user.role_id !== 1 ? { branch_id: req.user.branch_id } : {},
        attributes: ['id', 'name', 'branch_id']
      }]
    }];

    const dueSchedules = await FeeSchedule.findAll({
      where: whereClause,
      include: includeClause,
      order: [['due_date', 'ASC']],
      limit: 100
    });

    res.json({ dueSchedules });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getFeeCollectionReport = async (req, res) => {
  try {
    const { FeePayment, Admission, Student } = require('../models');
    const { Op, fn, col } = require('sequelize');
    const sequelize = require('../config/database');

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const payments = await FeePayment.findAll({
      attributes: [
        [fn('DATE_FORMAT', col('payment_date'), '%Y-%m'), 'month'],
        [fn('SUM', col('amount_paid')), 'total_collected'],
        [fn('COUNT', col('FeePayment.id')), 'payment_count']
      ],
      where: {
        payment_date: { [Op.gte]: sixMonthsAgo }
      },
      include: [{
        model: Admission,
        as: 'Admission',
        attributes: [],
        include: [{
          model: require('../models/Student'),
          as: 'Student',
          attributes: [],
          where: req.user.role_id !== 1 ? { branch_id: req.user.branch_id } : {}
        }]
      }],
      group: [fn('DATE_FORMAT', col('payment_date'), '%Y-%m')],
      order: [[fn('DATE_FORMAT', col('payment_date'), '%Y-%m'), 'DESC']],
      raw: true
    });

    res.json({ data: payments });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getAllPayments = async (req, res) => {
  try {
    const { FeePayment, Admission, Student, CoursePackage } = require('../models');
    const payments = await FeePayment.findAll({
      include: [
        {
          model: Admission,
          include: [
            { model: Student, attributes: ['id', 'name', 'mobile', 'email', 'admission_no'] },
            { model: CoursePackage, attributes: ['id', 'name'] }
          ]
        }
      ],
      order: [['payment_date', 'DESC'], ['id', 'DESC']],
      limit: 100
    });
    res.json({ status: 'success', data: payments, payments });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Server error', error: error.message });
  }
};
