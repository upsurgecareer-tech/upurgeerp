const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const BatchStudent = sequelize.define('BatchStudent', {
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
  student_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'students', key: 'id' }
  },
  admission_id: {
    type: DataTypes.INTEGER,
    references: { model: 'admissions', key: 'id' }
  },
  joined_date: {
    type: DataTypes.DATEONLY,
    defaultValue: DataTypes.NOW
  },
  status: {
    type: DataTypes.ENUM('Active', 'Dropped'),
    defaultValue: 'Active'
  }
}, {
  tableName: 'batch_students',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['batch_id', 'student_id'], unique: true }
  ]
});

module.exports = BatchStudent;
