const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Performance = sequelize.define('Performance', {
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
  review_period: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  reviewer_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'users', key: 'id' }
  },
  technical_skills: { type: DataTypes.INTEGER, defaultValue: 0 },
  communication: { type: DataTypes.INTEGER, defaultValue: 0 },
  teamwork: { type: DataTypes.INTEGER, defaultValue: 0 },
  punctuality: { type: DataTypes.INTEGER, defaultValue: 0 },
  quality_of_work: { type: DataTypes.INTEGER, defaultValue: 0 },
  overall_rating: { type: DataTypes.DECIMAL(3, 2), defaultValue: 0 },
  strengths: DataTypes.TEXT,
  areas_of_improvement: DataTypes.TEXT,
  goals: DataTypes.TEXT,
  comments: DataTypes.TEXT,
  status: {
    type: DataTypes.ENUM('Draft', 'Submitted', 'Acknowledged'),
    defaultValue: 'Draft'
  }
}, {
  tableName: 'performances',
  timestamps: true,
  underscored: true
});

module.exports = Performance;
