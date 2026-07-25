const Task = require('../models/Task');
const Timesheet = require('../models/Timesheet');
const { Employee, User } = require('../models');

const getLocalTodayDate = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().split('T')[0];
};

// ─── Tasks ────────────────────────────────────────────────────────────────────

exports.getTasks = async (req, res) => {
  try {
    const { status, assigned_to, project } = req.query;
    const where = {};
    if (status) where.status = status;
    if (assigned_to) where.assigned_to = assigned_to;
    if (project) where.project = project;

    const tasks = await Task.findAll({
      where,
      include: [{
        model: Employee,
        as: 'assignee',
        attributes: ['id', 'designation'],
        include: [{ model: User, as: 'user', attributes: ['first_name', 'last_name'] }]
      }],
      order: [['created_at', 'DESC']]
    });
    res.json({ tasks });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.createTask = async (req, res) => {
  try {
    const { title, description, project, assigned_to, priority, due_date, estimated_hours } = req.body;
    if (!title) return res.status(400).json({ message: 'Task title is required' });

    const task = await Task.create({
      title, description, project, assigned_to, priority, due_date,
      estimated_hours, assigned_by: req.user.id, status: 'Todo'
    });
    res.status(201).json({ message: 'Task created', task });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (req.body.status === 'Done' && !task.completed_date) {
      req.body.completed_date = getLocalTodayDate();
    }
    await task.update(req.body);
    res.json({ message: 'Task updated', task });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    await task.destroy();
    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─── Timesheets ───────────────────────────────────────────────────────────────

exports.getTimesheets = async (req, res) => {
  try {
    const { user_id, month, year, status } = req.query;
    const where = {};
    const targetUserId = user_id || req.user.id;
    where.user_id = targetUserId;

    if (month && year) {
      const { Op } = require('sequelize');
      const formattedMonth = String(month).padStart(2, '0');
      const lastDay = new Date(year, month, 0).getDate();
      const startDateStr = `${year}-${formattedMonth}-01`;
      const endDateStr = `${year}-${formattedMonth}-${lastDay}`;
      where.date = { [Op.between]: [startDateStr, endDateStr] };
    }
    if (status) where.status = status;

    const timesheets = await Timesheet.findAll({
      where,
      include: [{ model: User, as: 'user', attributes: ['first_name', 'last_name'] }],
      order: [['date', 'DESC']]
    });

    const totalHours = timesheets.reduce((sum, t) => sum + parseFloat(t.hours_worked || 0), 0);
    res.json({ timesheets, totalHours });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.createTimesheet = async (req, res) => {
  try {
    const { date, hours_worked, task_description, project } = req.body;
    if (!date || !hours_worked) return res.status(400).json({ message: 'Date and hours are required' });

    const entry = await Timesheet.create({
      user_id: req.user.id, date, hours_worked, task_description, project, status: 'Draft'
    });
    res.status(201).json({ message: 'Timesheet entry added', entry });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateTimesheet = async (req, res) => {
  try {
    const entry = await Timesheet.findByPk(req.params.id);
    if (!entry) return res.status(404).json({ message: 'Timesheet entry not found' });
    if (req.user.role_id !== 1 && entry.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized to update this timesheet' });
    }
    await entry.update(req.body);
    res.json({ message: 'Timesheet updated', entry });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteTimesheet = async (req, res) => {
  try {
    const entry = await Timesheet.findByPk(req.params.id);
    if (!entry) return res.status(404).json({ message: 'Timesheet not found' });
    if (req.user.role_id !== 1 && entry.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized to delete this timesheet' });
    }
    await entry.destroy();
    res.json({ message: 'Timesheet deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.submitTimesheet = async (req, res) => {
  try {
    const entry = await Timesheet.findByPk(req.params.id);
    if (!entry) return res.status(404).json({ message: 'Timesheet not found' });
    if (req.user.role_id !== 1 && entry.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized to submit this timesheet' });
    }
    await entry.update({ status: 'Submitted' });
    res.json({ message: 'Timesheet submitted for approval', entry });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
