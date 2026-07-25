const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Employee = sequelize.define('Employee', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'users', key: 'id' }
  },
  employee_code: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: false
  },
  department_id: {
    type: DataTypes.INTEGER,
    references: { model: 'departments', key: 'id' }
  },
  designation: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  joining_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  employment_type: {
    type: DataTypes.ENUM('Full-Time', 'Part-Time', 'Contract', 'Intern'),
    defaultValue: 'Full-Time'
  },
  date_of_birth: DataTypes.DATE,
  gender: DataTypes.ENUM('Male', 'Female', 'Other'),
  blood_group: DataTypes.STRING(10),
  address: DataTypes.TEXT,
  emergency_contact_name: DataTypes.STRING(100),
  emergency_contact_phone: DataTypes.STRING(15),
  bank_name: DataTypes.STRING(100),
  bank_account_number: DataTypes.STRING(50),
  bank_ifsc: DataTypes.STRING(20),
  pan_number: DataTypes.STRING(20),
  aadhar_number: DataTypes.STRING(20),
  status: {
    type: DataTypes.ENUM('Active', 'Inactive', 'Resigned', 'Terminated'),
    defaultValue: 'Active'
  }
}, {
  tableName: 'employees',
  timestamps: true,
  underscored: true
});

module.exports = Employee;
