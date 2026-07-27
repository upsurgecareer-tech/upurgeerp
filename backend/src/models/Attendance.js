const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Attendance = sequelize.define('Attendance', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  session_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'attendance_sessions', key: 'id' }
  },
  student_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'students', key: 'id' }
  },
  batch_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'batches', key: 'id' }
  },
  status: {
    type: DataTypes.ENUM('Present', 'Absent', 'Leave'),
    defaultValue: 'Absent'
  },
  marked_by: {
    type: DataTypes.ENUM('QR', 'Biometric', 'Manual'),
    defaultValue: 'Manual'
  },
  marked_at: {
    type: DataTypes.DATE
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  }
}, {
  tableName: 'attendance',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['session_id', 'student_id'], unique: true },
    { fields: ['student_id'] }
  ]
});

module.exports = Attendance;
