// Shift is exported from models/index.js
const { Shift } = require('../models');

// GET /hrms/shifts
// Fetch all shifts
exports.getShifts = async (req, res) => {
  try {
    const shifts = await Shift.findAll({ order: [['created_at', 'DESC']] });
    res.json({ shifts });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// POST /hrms/shifts
// Create a new shift
exports.createShift = async (req, res) => {
  try {
    const { name, start_time, end_time, grace_period_minutes } = req.body;

    if (!name || !start_time || !end_time) {
      return res.status(400).json({ message: 'name, start_time, and end_time are required' });
    }

    const shift = await Shift.create({
      name,
      start_time,
      end_time,
      grace_period_minutes: grace_period_minutes !== undefined ? grace_period_minutes : 15
    });

    res.status(201).json({ message: 'Shift created successfully', shift });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// PUT /hrms/shifts/:id
// Update an existing shift
exports.updateShift = async (req, res) => {
  try {
    const shift = await Shift.findByPk(req.params.id);
    if (!shift) {
      return res.status(404).json({ message: 'Shift not found' });
    }

    const { name, start_time, end_time, grace_period_minutes, is_active } = req.body;

    await shift.update({
      name: name !== undefined ? name : shift.name,
      start_time: start_time !== undefined ? start_time : shift.start_time,
      end_time: end_time !== undefined ? end_time : shift.end_time,
      grace_period_minutes: grace_period_minutes !== undefined ? grace_period_minutes : shift.grace_period_minutes,
      is_active: is_active !== undefined ? is_active : shift.is_active
    });

    res.json({ message: 'Shift updated successfully', shift });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// DELETE /hrms/shifts/:id
// Delete a shift if it exists
exports.deleteShift = async (req, res) => {
  try {
    const shift = await Shift.findByPk(req.params.id);
    if (!shift) {
      return res.status(404).json({ message: 'Shift not found' });
    }

    await shift.destroy();
    res.json({ message: 'Shift deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// POST /hrms/shifts/assign
// Assign a shift to an employee (mocked response)
exports.assignShiftToEmployee = async (req, res) => {
  try {
    const { employee_id, shift_id } = req.body;

    if (!employee_id || !shift_id) {
      return res.status(400).json({ message: 'employee_id and shift_id are required' });
    }

    // Verify the shift exists
    const shift = await Shift.findByPk(shift_id);
    if (!shift) {
      return res.status(404).json({ message: 'Shift not found' });
    }

    res.json({ message: 'Shift assigned successfully', employee_id, shift_id });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
