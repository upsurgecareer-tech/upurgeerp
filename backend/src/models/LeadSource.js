const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const LeadSource = sequelize.define('LeadSource', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'lead_sources',
  timestamps: true,
  underscored: true
});

module.exports = LeadSource;
