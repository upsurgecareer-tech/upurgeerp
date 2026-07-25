const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Timesheet = sequelize.define('Timesheet', {
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
  hours_worked: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false
  },
  task_description: {
    type: DataTypes.TEXT
  },
  project: {
    type: DataTypes.STRING(100)
  },
  status: {
    type: DataTypes.ENUM('Draft', 'Submitted', 'Approved', 'Rejected'),
    defaultValue: 'Draft'
  }
}, {
  tableName: 'timesheets',
  timestamps: true,
  underscored: true
});

module.exports = Timesheet;
