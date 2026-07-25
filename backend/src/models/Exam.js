const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Exam = sequelize.define('Exam', {
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
  name: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  exam_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  start_time: {
    type: DataTypes.TIME
  },
  end_time: {
    type: DataTypes.TIME
  },
  duration_minutes: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  total_marks: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  passing_marks: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  exam_type: {
    type: DataTypes.ENUM('Theory', 'Practical', 'Online', 'Assignment'),
    defaultValue: 'Theory'
  },
  status: {
    type: DataTypes.ENUM('Scheduled', 'Ongoing', 'Completed', 'Cancelled'),
    defaultValue: 'Scheduled'
  }
}, {
  tableName: 'exams',
  timestamps: true,
  underscored: true
});

module.exports = Exam;
