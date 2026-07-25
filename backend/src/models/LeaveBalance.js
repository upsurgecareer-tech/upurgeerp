const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const LeaveBalance = sequelize.define('LeaveBalance', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  employee_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'employees', key: 'id' }
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  sick_leave: { type: DataTypes.INTEGER, defaultValue: 12 },
  casual_leave: { type: DataTypes.INTEGER, defaultValue: 12 },
  earned_leave: { type: DataTypes.INTEGER, defaultValue: 15 },
  sick_leave_used: { type: DataTypes.INTEGER, defaultValue: 0 },
  casual_leave_used: { type: DataTypes.INTEGER, defaultValue: 0 },
  earned_leave_used: { type: DataTypes.INTEGER, defaultValue: 0 }
}, {
  tableName: 'leave_balances',
  timestamps: true,
  underscored: true
});

module.exports = LeaveBalance;
