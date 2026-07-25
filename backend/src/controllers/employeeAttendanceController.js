const { Employee, EmployeeAttendance, Department, User } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

// Helper to reliably get today's YYYY-MM-DD in the local timezone (prevents midnight UTC shifts)
const getLocalTodayDate = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().split('T')[0];
};

exports.getMyTodayAttendance = async (req, res) => {
  try {
    const employee = await Employee.findOne({ where: { user_id: req.user.id } });
    if (!employee) return res.status(404).json({ message: 'Employee not found for this user' });

    const today = getLocalTodayDate();
    const attendance = await EmployeeAttendance.findOne({
      where: { employee_id: employee.id, date: today }
    });

    res.json({ attendance: attendance || null, employee_id: employee.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch attendance', error: error.message });
  }
};

exports.checkIn = async (req, res) => {
  try {
    const { location, remarks } = req.body;
    // req.user has user info, we need employee info
    const employee = await Employee.findOne({ where: { user_id: req.user.id } });
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    const today = getLocalTodayDate();
    
    // Check if already checked in today
    let attendance = await EmployeeAttendance.findOne({
      where: { employee_id: employee.id, date: today }
    });

    if (attendance && attendance.check_in) {
      return res.status(400).json({ message: 'Already checked in today' });
    }

    const currentTime = new Date();
    let isLate = false;

    // Shift check logic (Assuming default shift is 09:00:00 to 18:00:00)
    const defaultShiftStart = new Date();
    defaultShiftStart.setHours(9, 0, 0, 0);
    const graceMinutes = 15;
    
    if (currentTime.getTime() > defaultShiftStart.getTime() + (graceMinutes * 60000)) {
      isLate = true;
    }

    if (attendance) {
      attendance.check_in = currentTime;
      attendance.location = location || attendance.location;
      attendance.remarks = remarks || attendance.remarks;
      attendance.is_late = isLate;
      attendance.status = 'Present';
      await attendance.save();
    } else {
      attendance = await EmployeeAttendance.create({
        employee_id: employee.id,
        date: today,
        status: 'Present',
        check_in: currentTime,
        is_late: isLate,
        location,
        remarks
      });
    }

    res.json({ message: 'Checked in successfully', attendance });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to check in', error: error.message });
  }
};

exports.checkOut = async (req, res) => {
  try {
    const employee = await Employee.findOne({ where: { user_id: req.user.id } });
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    const today = getLocalTodayDate();
    
    const attendance = await EmployeeAttendance.findOne({
      where: { employee_id: employee.id, date: today }
    });

    if (!attendance || !attendance.check_in) {
      return res.status(400).json({ message: 'You have not checked in today' });
    }

    if (attendance.check_out) {
      return res.status(400).json({ message: 'Already checked out today' });
    }

    const checkOutTime = new Date();
    const checkInTime = new Date(attendance.check_in);
    
    // Calculate total hours
    const diff = checkOutTime.getTime() - checkInTime.getTime();
    const totalHours = (diff / (1000 * 60 * 60)).toFixed(2);

    attendance.check_out = checkOutTime;
    attendance.total_hours = parseFloat(totalHours);
    
    // Auto mark Half Day if hours < 4 (just basic logic)
    if (attendance.total_hours < 4) {
      attendance.status = 'Half Day';
    }

    await attendance.save();

    res.json({ message: 'Checked out successfully', attendance });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to check out', error: error.message });
  }
};

exports.getDailyAttendance = async (req, res) => {
  try {
    const today = getLocalTodayDate();
    
    const records = await EmployeeAttendance.findAll({
      where: { date: today },
      include: [{
        model: Employee,
        as: 'employee',
        include: ['user', 'department']
      }]
    });

    res.json({ attendance: records });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch attendance records', error: error.message });
  }
};

exports.getEmployeeAttendance = async (req, res) => {
  try {
    const { id } = req.params; // Employee ID
    const { month, year } = req.query; // YYYY-MM

    let whereClause = { employee_id: id };
    
    if (month && year) {
      const paddedMonth = String(month).padStart(2, '0');
      const startDate = `${year}-${paddedMonth}-01`;
      // Calculate last day of month
      const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
      const endDate = `${year}-${paddedMonth}-${lastDay}`;
      
      whereClause.date = {
        [Op.between]: [startDate, endDate]
      };
    }

    const records = await EmployeeAttendance.findAll({
      where: whereClause,
      order: [['date', 'DESC']]
    });

    res.json({ attendance: records });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch attendance history', error: error.message });
  }
};

exports.bulkUpdateAttendance = async (req, res) => {
  try {
    const { records } = req.body; // Array of { employee_id, date, status, remarks }
    
    if (!Array.isArray(records)) {
      return res.status(400).json({ message: 'Invalid records format' });
    }

    const t = await sequelize.transaction();
    try {
      for (const record of records) {
        const [att, created] = await EmployeeAttendance.findOrCreate({
          where: { employee_id: record.employee_id, date: record.date },
          defaults: { ...record },
          transaction: t
        });

        if (!created) {
          await att.update(record, { transaction: t });
        }
      }
      await t.commit();
      res.json({ message: 'Bulk attendance updated successfully' });
    } catch (err) {
      await t.rollback();
      throw err;
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update attendance', error: error.message });
  }
};
