const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Candidate = sequelize.define('Candidate', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  job_posting_id: { type: DataTypes.INTEGER, references: { model: 'job_postings', key: 'id' } },
  name: { type: DataTypes.STRING(100), allowNull: false },
  email: { type: DataTypes.STRING(150), allowNull: false },
  phone: { type: DataTypes.STRING(20) },
  resume_url: { type: DataTypes.STRING(500) },
  experience_years: { type: DataTypes.DECIMAL(4, 1) },
  current_salary: { type: DataTypes.DECIMAL(10, 2) },
  current_in_hand_salary: { type: DataTypes.DECIMAL(10, 2) },
  expected_salary: { type: DataTypes.DECIMAL(10, 2) },
  expected_in_hand_salary: { type: DataTypes.DECIMAL(10, 2) },
  notice_period_days: { type: DataTypes.INTEGER },
  application_date: { type: DataTypes.DATEONLY },
  status: {
    type: DataTypes.ENUM('Applied', 'Screening', 'Interview Scheduled', 'Interviewed', 'Selected', 'Rejected', 'On Hold'),
    defaultValue: 'Applied'
  },
  interview_date: { type: DataTypes.DATE },
  notes: { type: DataTypes.TEXT },
  rating: { type: DataTypes.INTEGER } // 1-5
}, {
  tableName: 'candidates',
  timestamps: true,
  underscored: true
});

module.exports = Candidate;
