const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Task = sequelize.define('Task', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING(300), allowNull: false },
  description: { type: DataTypes.TEXT },
  project: { type: DataTypes.STRING(200) },
  assigned_to: { type: DataTypes.INTEGER, references: { model: 'employees', key: 'id' } },
  assigned_by: { type: DataTypes.INTEGER, references: { model: 'users', key: 'id' } },
  priority: {
    type: DataTypes.ENUM('Low', 'Medium', 'High', 'Critical'),
    defaultValue: 'Medium'
  },
  status: {
    type: DataTypes.ENUM('Todo', 'In Progress', 'Review', 'Done', 'Cancelled'),
    defaultValue: 'Todo'
  },
  due_date: { type: DataTypes.DATEONLY },
  completed_date: { type: DataTypes.DATEONLY },
  estimated_hours: { type: DataTypes.DECIMAL(6, 2) },
  actual_hours: { type: DataTypes.DECIMAL(6, 2) }
}, {
  tableName: 'tasks',
  timestamps: true,
  underscored: true
});

module.exports = Task;
