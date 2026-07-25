const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TrainingProgram = sequelize.define('TrainingProgram', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING(200), allowNull: false },
  description: { type: DataTypes.TEXT },
  category: { type: DataTypes.STRING(100) },
  trainer_name: { type: DataTypes.STRING(100) },
  mode: {
    type: DataTypes.ENUM('Online', 'Offline', 'Hybrid'),
    defaultValue: 'Online'
  },
  start_date: { type: DataTypes.DATEONLY },
  end_date: { type: DataTypes.DATEONLY },
  duration_hours: { type: DataTypes.INTEGER },
  max_participants: { type: DataTypes.INTEGER },
  status: {
    type: DataTypes.ENUM('Upcoming', 'Ongoing', 'Completed', 'Cancelled'),
    defaultValue: 'Upcoming'
  },
  department_id: { type: DataTypes.INTEGER, references: { model: 'departments', key: 'id' } },
  created_by: { type: DataTypes.INTEGER, references: { model: 'users', key: 'id' } }
}, {
  tableName: 'training_programs',
  timestamps: true,
  underscored: true
});

module.exports = TrainingProgram;
