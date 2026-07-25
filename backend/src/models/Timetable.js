const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Timetable = sequelize.define('Timetable', {
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
  day_of_week: {
    type: DataTypes.ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'),
    allowNull: false
  },
  start_time: {
    type: DataTypes.TIME,
    allowNull: false
  },
  end_time: {
    type: DataTypes.TIME,
    allowNull: false
  },
  room: {
    type: DataTypes.STRING(50)
  }
}, {
  tableName: 'timetable',
  timestamps: true,
  underscored: true
});

module.exports = Timetable;
