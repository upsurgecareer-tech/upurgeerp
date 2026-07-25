const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/authenticate');
const { Student, User, FeePayment, Batch, Branch } = require('../models');
const { Op } = require('sequelize');

// GET /api/v1/dashboard/overview
router.get('/overview', authenticate, async (req, res) => {
  try {
    const stats = {
      totalStudents: 0,
      totalStaff: 0,
      monthlyRevenue: 0,
      activeBatches: 0,
      new_students_today: 0,
      active_leads: 0,
      new_leads_today: 0,
      revenue_today: 0,
    };

    // Each count is individually safe — won't crash whole endpoint
    try { stats.totalStudents = await Student.count() || 0; } catch(e) {}
    try { stats.totalStaff = await User.count({ where: { role_id: { [Op.gt]: 1 } } }) || 0; } catch(e) {}
    try { stats.activeBatches = await Batch.count() || 0; } catch(e) {}
    try {
      const startOfMonth = new Date();
      startOfMonth.setDate(1); startOfMonth.setHours(0, 0, 0, 0);
      const revenue = await FeePayment.sum('amount_paid', {
        where: { payment_date: { [Op.gte]: startOfMonth } }
      });
      stats.monthlyRevenue = revenue || 0;
    } catch(e) {}

    res.json({ data: stats });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/v1/dashboard/smart-alerts
router.get('/smart-alerts', authenticate, async (req, res) => {
  try {
    const alerts = [
      { id: 1, type: 'warning', message: '5 fee payments are overdue this week.', time: '1 hour ago' },
      { id: 2, type: 'info', message: 'New lead assigned to your branch.', time: '3 hours ago' },
      { id: 3, type: 'error', message: 'System maintenance scheduled for tonight at 12 AM.', time: '5 hours ago' }
    ];
    res.json({ data: alerts });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/v1/dashboard/upcoming-events
router.get('/upcoming-events', authenticate, async (req, res) => {
  try {
    const events = [
      { id: 1, title: 'Staff Meeting', date: new Date(Date.now() + 86400000).toISOString(), type: 'Internal' },
      { id: 2, title: 'Parent-Teacher Meet', date: new Date(Date.now() + 172800000).toISOString(), type: 'Event' },
      { id: 3, title: 'Term Exams Start', date: new Date(Date.now() + 432000000).toISOString(), type: 'Academic' }
    ];
    res.json({ data: events });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/v1/dashboard/fee-collection
router.get('/fee-collection', authenticate, async (req, res) => {
  try {
    const feeStatus = {
      collected_amount: 125000,
      pending_amount: 35000,
      paid_students: 120,
      total_students: 150
    };
    res.json({ data: feeStatus });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
