const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AssignmentSubmission = sequelize.define('AssignmentSubmission', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  assignment_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'assignments', key: 'id' }
  },
  student_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'students', key: 'id' }
  },
  submission_text: {
    type: DataTypes.TEXT
  },
  attachment_url: {
    type: DataTypes.STRING(500)
  },
  submitted_at: {
    type: DataTypes.DATE
  },
  marks_obtained: {
    type: DataTypes.INTEGER
  },
  feedback: {
    type: DataTypes.TEXT
  },
  graded_by: {
    type: DataTypes.INTEGER,
    references: { model: 'users', key: 'id' }
  },
  graded_at: {
    type: DataTypes.DATE
  },
  status: {
    type: DataTypes.ENUM('Pending', 'Submitted', 'Graded', 'Late'),
    defaultValue: 'Pending'
  }
}, {
  tableName: 'assignment_submissions',
  timestamps: true,
  underscored: true
});

module.exports = AssignmentSubmission;
