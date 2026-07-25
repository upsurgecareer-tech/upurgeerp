const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AttendanceSession = sequelize.define('AttendanceSession', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  batch_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'batches', key: 'id' }
  },
  subject: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  faculty_id: {
    type: DataTypes.INTEGER,
    references: { model: 'users', key: 'id' }
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  start_time: {
    type: DataTypes.TIME
  },
  end_time: {
    type: DataTypes.TIME
  }
}, {
  tableName: 'attendance_sessions',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['batch_id', 'date'] }
  ]
});

module.exports = AttendanceSession;
