const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const BookIssue = sequelize.define('BookIssue', {
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
  book_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'library_books', key: 'id' }
  },
  student_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'students', key: 'id' }
  },
  issue_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  due_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  return_date: {
    type: DataTypes.DATE
  },
  fine_amount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  status: {
    type: DataTypes.ENUM('Issued', 'Returned', 'Lost'),
    defaultValue: 'Issued'
  },
  issued_by: {
    type: DataTypes.INTEGER,
    references: { model: 'users', key: 'id' }
  }
}, {
  tableName: 'book_issues',
  timestamps: true,
  underscored: true
});

module.exports = BookIssue;
