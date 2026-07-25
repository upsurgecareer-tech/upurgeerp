const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Certificate = sequelize.define('Certificate', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  student_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'students', key: 'id' }
  },
  course_package_id: {
    type: DataTypes.INTEGER,
    references: { model: 'course_packages', key: 'id' }
  },
  certificate_type: {
    type: DataTypes.ENUM('Course Completion', 'Merit', 'Participation', 'Achievement'),
    allowNull: false
  },
  certificate_number: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  issue_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  certificate_url: {
    type: DataTypes.STRING(255)
  },
  verification_code: {
    type: DataTypes.STRING(50),
    unique: true
  },
  issued_by: {
    type: DataTypes.INTEGER,
    references: { model: 'users', key: 'id' }
  },
  status: {
    type: DataTypes.ENUM('Active', 'Revoked'),
    defaultValue: 'Active'
  }
}, {
  tableName: 'certificates',
  timestamps: true,
  underscored: true
});

module.exports = Certificate;
