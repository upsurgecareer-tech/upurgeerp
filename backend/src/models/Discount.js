const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Discount = sequelize.define('Discount', {
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
  discount_type: {
    type: DataTypes.ENUM('Amount', 'Percentage'),
    allowNull: false
  },
  discount_value: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  reason: {
    type: DataTypes.TEXT
  },
  approved_by: {
    type: DataTypes.INTEGER,
    references: { model: 'users', key: 'id' }
  }
}, {
  tableName: 'discounts',
  timestamps: true,
  underscored: true
});

module.exports = Discount;
