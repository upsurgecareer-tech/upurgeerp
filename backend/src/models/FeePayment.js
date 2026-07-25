const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const FeePayment = sequelize.define('FeePayment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  fee_schedule_id: {
    type: DataTypes.INTEGER,
    references: { model: 'fee_schedules', key: 'id' }
  },
  admission_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'admissions', key: 'id' }
  },
  amount_paid: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  payment_mode: {
    type: DataTypes.ENUM('Cash', 'Online', 'Cheque', 'Card'),
    defaultValue: 'Cash'
  },
  payment_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  receipt_no: {
    type: DataTypes.STRING(50),
    unique: true
  },
  received_by: {
    type: DataTypes.INTEGER,
    references: { model: 'users', key: 'id' }
  },
  gateway_txn_id: {
    type: DataTypes.STRING(100)
  },
  remarks: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'fee_payments',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['admission_id'] },
    { fields: ['receipt_no'] },
    { fields: ['payment_date'] }
  ]
});

module.exports = FeePayment;
