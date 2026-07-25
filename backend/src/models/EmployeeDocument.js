const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const EmployeeDocument = sequelize.define('EmployeeDocument', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  employee_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'employees', key: 'id' }
  },
  document_type: {
    type: DataTypes.ENUM('Resume', 'ID Proof', 'Address Proof', 'Education', 'Experience', 'Other'),
    allowNull: false
  },
  document_name: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  file_path: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  uploaded_by: {
    type: DataTypes.INTEGER,
    references: { model: 'users', key: 'id' }
  }
}, {
  tableName: 'employee_documents',
  timestamps: true,
  underscored: true
});

module.exports = EmployeeDocument;
