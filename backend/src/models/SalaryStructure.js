const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SalaryStructure = sequelize.define('SalaryStructure', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'users', key: 'id' }
  },
  basic_salary: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  allowances: {
    type: DataTypes.JSON
  },
  deductions: {
    type: DataTypes.JSON
  },
  total_salary: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  effective_from: {
    type: DataTypes.DATEONLY,
    allowNull: false
  }
}, {
  tableName: 'salary_structures',
  timestamps: true,
  underscored: true
});

module.exports = SalaryStructure;
