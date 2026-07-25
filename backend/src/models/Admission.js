const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Admission = sequelize.define('Admission', {
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
    allowNull: false,
    references: { model: 'course_packages', key: 'id' }
  },
  batch_id: {
    type: DataTypes.INTEGER,
    references: { model: 'batches', key: 'id' }
  },
  counsellor_id: {
    type: DataTypes.INTEGER,
    references: { model: 'users', key: 'id' }
  },
  admission_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  total_fee: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  discount_amount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  net_payable: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('Active', 'Inactive', 'Cancelled'),
    defaultValue: 'Active'
  }
}, {
  tableName: 'admissions',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['student_id'] },
    { fields: ['course_package_id'] },
    { fields: ['counsellor_id'] }
  ]
});

module.exports = Admission;
