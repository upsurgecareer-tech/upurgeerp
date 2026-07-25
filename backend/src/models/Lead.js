const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Lead = sequelize.define('Lead', {
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
  source_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'lead_sources', key: 'id' }
  },
  source: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  assigned_to: {
    type: DataTypes.INTEGER,
    references: { model: 'users', key: 'id' }
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(100)
  },
  mobile: {
    type: DataTypes.STRING(15),
    allowNull: false
  },
  course_interest: {
    type: DataTypes.STRING(200)
  },
  stage: {
    type: DataTypes.STRING(50),
    defaultValue: 'New'
  },
  priority: {
    type: DataTypes.ENUM('Hot', 'Warm', 'Cold'),
    defaultValue: 'Warm'
  },
  status: {
    type: DataTypes.ENUM('Active', 'Converted', 'Lost'),
    defaultValue: 'Active'
  },
  remarks: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'leads',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['mobile'] },
    { fields: ['branch_id'] },
    { fields: ['assigned_to'] }
  ]
});

module.exports = Lead;
