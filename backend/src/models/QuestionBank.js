const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const QuestionBank = sequelize.define('QuestionBank', {
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
  course_package_id: {
    type: DataTypes.INTEGER,
    references: { model: 'course_packages', key: 'id' }
  },
  subject: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  question_text: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  question_type: {
    type: DataTypes.ENUM('MCQ', 'True/False', 'Short Answer', 'Long Answer'),
    allowNull: false
  },
  options: {
    type: DataTypes.JSON
  },
  correct_answer: {
    type: DataTypes.TEXT
  },
  marks: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  difficulty: {
    type: DataTypes.ENUM('Easy', 'Medium', 'Hard'),
    defaultValue: 'Medium'
  }
}, {
  tableName: 'question_bank',
  timestamps: true,
  underscored: true
});

module.exports = QuestionBank;
