const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const LeadStage = sequelize.define('LeadStage', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  order_sequence: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  color_code: {
    type: DataTypes.STRING(20),
    defaultValue: '#1976d2'
  }
}, {
  tableName: 'lead_stages',
  timestamps: true,
  underscored: true
});

module.exports = LeadStage;
