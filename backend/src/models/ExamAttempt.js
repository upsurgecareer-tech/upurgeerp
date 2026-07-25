const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ExamAttempt = sequelize.define('ExamAttempt', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  exam_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'exams', key: 'id' }
  },
  student_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'students', key: 'id' }
  },
  marks_obtained: {
    type: DataTypes.DECIMAL(5, 2)
  },
  percentage: {
    type: DataTypes.DECIMAL(5, 2)
  },
  grade: {
    type: DataTypes.STRING(10)
  },
  result: {
    type: DataTypes.ENUM('Pass', 'Fail', 'Absent'),
    defaultValue: 'Absent'
  },
  attempt_number: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  submitted_at: {
    type: DataTypes.DATE
  }
}, {
  tableName: 'exam_attempts',
  timestamps: true,
  underscored: true
});

module.exports = ExamAttempt;
