const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const LiveClass = sequelize.define('LiveClass', {
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
  batch_id: {
    type: DataTypes.INTEGER,
    references: { model: 'batches', key: 'id' }
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  meeting_url: {
    type: DataTypes.STRING(500)
  },
  meeting_id: {
    type: DataTypes.STRING(100)
  },
  meeting_password: {
    type: DataTypes.STRING(100)
  },
  scheduled_at: {
    type: DataTypes.DATE,
    allowNull: false
  },
  duration_minutes: {
    type: DataTypes.INTEGER,
    defaultValue: 60
  },
  host_id: {
    type: DataTypes.INTEGER,
    references: { model: 'users', key: 'id' }
  },
  status: {
    type: DataTypes.ENUM('Scheduled', 'Live', 'Completed', 'Cancelled'),
    defaultValue: 'Scheduled'
  },
  recording_url: {
    type: DataTypes.STRING(500)
  }
}, {
  tableName: 'live_classes',
  timestamps: true,
  underscored: true
});

module.exports = LiveClass;
