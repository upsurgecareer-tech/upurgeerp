const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Batch = sequelize.define('Batch', {
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
    allowNull: true,
    references: { model: 'course_packages', key: 'id' }
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  faculty_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'users', key: 'id' }
  },
  start_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  end_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  timing: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  max_students: {
    type: DataTypes.INTEGER,
    defaultValue: 30
  },
  status: {
    type: DataTypes.ENUM('Upcoming', 'Active', 'Completed'),
    defaultValue: 'Upcoming'
  }
}, {
  tableName: 'batches',
  timestamps: true,
  underscored: true
});

module.exports = Batch;
