const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const EmployeeStatusHistory = sequelize.define('EmployeeStatusHistory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  employee_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('Active', 'Inactive', 'On Leave', 'Suspended', 'Terminated', 'Resigned'),
    allowNull: false
  },
  changed_by: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  reason: {
    type: DataTypes.STRING,
    allowNull: false
  },
  remarks: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'employee_status_history',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at' // Optional, but good practice
});

module.exports = EmployeeStatusHistory;
