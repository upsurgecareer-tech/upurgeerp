const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const StaffAttendance = sequelize.define('StaffAttendance', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'users', key: 'id' }
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  check_in: {
    type: DataTypes.TIME
  },
  check_out: {
    type: DataTypes.TIME
  },
  status: {
    type: DataTypes.ENUM('Present', 'Absent', 'Leave', 'Half Day'),
    defaultValue: 'Present'
  },
  remarks: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'staff_attendance',
  timestamps: true,
  underscored: true
});

module.exports = StaffAttendance;
