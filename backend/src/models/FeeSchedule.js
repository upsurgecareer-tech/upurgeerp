const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const FeeSchedule = sequelize.define('FeeSchedule', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  admission_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'admissions', key: 'id' }
  },
  installment_no: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  due_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('Pending', 'Paid', 'Overdue'),
    defaultValue: 'Pending'
  }
}, {
  tableName: 'fee_schedules',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['admission_id'] },
    { fields: ['due_date'] },
    { fields: ['status'] }
  ]
});

module.exports = FeeSchedule;
