const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const JobPosting = sequelize.define('JobPosting', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING(200), allowNull: false },
  department_id: { type: DataTypes.INTEGER, references: { model: 'departments', key: 'id' } },
  description: { type: DataTypes.TEXT },
  requirements: { type: DataTypes.TEXT },
  location: { type: DataTypes.STRING(100) },
  employment_type: {
    type: DataTypes.ENUM('Full-time', 'Part-time', 'Contract', 'Internship'),
    defaultValue: 'Full-time'
  },
  min_salary: { type: DataTypes.DECIMAL(10, 2) },
  max_salary: { type: DataTypes.DECIMAL(10, 2) },
  openings: { type: DataTypes.INTEGER, defaultValue: 1 },
  status: {
    type: DataTypes.ENUM('Draft', 'Open', 'Closed', 'On Hold'),
    defaultValue: 'Open'
  },
  posted_by: { type: DataTypes.INTEGER, references: { model: 'users', key: 'id' } },
  deadline: { type: DataTypes.DATEONLY }
}, {
  tableName: 'job_postings',
  timestamps: true,
  underscored: true
});

module.exports = JobPosting;
