const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Assignment = sequelize.define('Assignment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  branch_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'branches', key: 'id' }
  },
  batch_id: {
    type: DataTypes.INTEGER,
    references: { model: 'batches', key: 'id' }
  },
  course_package_id: {
    type: DataTypes.INTEGER,
    references: { model: 'course_packages', key: 'id' }
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  attachment_url: {
    type: DataTypes.STRING(500)
  },
  due_date: {
    type: DataTypes.DATE
  },
  total_marks: {
    type: DataTypes.INTEGER,
    defaultValue: 100
  },
  created_by: {
    type: DataTypes.INTEGER,
    references: { model: 'users', key: 'id' }
  },
  status: {
    type: DataTypes.ENUM('Active', 'Closed'),
    defaultValue: 'Active'
  }
}, {
  tableName: 'assignments',
  timestamps: true,
  underscored: true
});

module.exports = Assignment;
