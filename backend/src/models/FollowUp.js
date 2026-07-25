const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const FollowUp = sequelize.define('FollowUp', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  lead_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'leads', key: 'id' }
  },
  counsellor_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'users', key: 'id' }
  },
  follow_up_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  follow_up_type: {
    type: DataTypes.ENUM('Call', 'Meeting', 'Demo', 'Email'),
    defaultValue: 'Call'
  },
  notes: {
    type: DataTypes.TEXT
  },
  status: {
    type: DataTypes.ENUM('Pending', 'Done', 'Cancelled'),
    defaultValue: 'Pending'
  }
}, {
  tableName: 'follow_ups',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['lead_id'] },
    { fields: ['counsellor_id'] },
    { fields: ['follow_up_date'] }
  ]
});

module.exports = FollowUp;
