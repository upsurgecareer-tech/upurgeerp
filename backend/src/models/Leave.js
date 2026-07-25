const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Leave = sequelize.define('Leave', {
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
  leave_type: {
    type: DataTypes.ENUM('Sick', 'Casual', 'Earned', 'Maternity', 'Paternity', 'Unpaid'),
    allowNull: false
  },
  start_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  end_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  total_days: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('Pending', 'Approved', 'Rejected'),
    defaultValue: 'Pending'
  },
  approved_by: {
    type: DataTypes.INTEGER,
    references: { model: 'users', key: 'id' }
  },
  approved_at: DataTypes.DATE,
  remarks: DataTypes.TEXT
}, {
  tableName: 'leaves',
  timestamps: true,
  underscored: true
});

module.exports = Leave;
