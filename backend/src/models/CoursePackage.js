const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CoursePackage = sequelize.define('CoursePackage', {
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
  name: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  total_fee: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  duration_months: {
    type: DataTypes.INTEGER
  },
  description: {
    type: DataTypes.TEXT
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'course_packages',
  timestamps: true,
  underscored: true
});

module.exports = CoursePackage;
