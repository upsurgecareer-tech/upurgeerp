const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Asset = sequelize.define('Asset', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(200), allowNull: false },
  asset_code: { type: DataTypes.STRING(50), unique: true },
  category: {
    type: DataTypes.ENUM('Laptop', 'Desktop', 'Mobile', 'Vehicle', 'Furniture', 'Software', 'Other'),
    defaultValue: 'Other'
  },
  brand: { type: DataTypes.STRING(100) },
  model: { type: DataTypes.STRING(100) },
  serial_number: { type: DataTypes.STRING(100) },
  purchase_date: { type: DataTypes.DATEONLY },
  purchase_cost: { type: DataTypes.DECIMAL(10, 2) },
  warranty_expiry: { type: DataTypes.DATEONLY },
  status: {
    type: DataTypes.ENUM('Available', 'Assigned', 'Under Repair', 'Retired'),
    defaultValue: 'Available'
  },
  assigned_to: { type: DataTypes.INTEGER, references: { model: 'employees', key: 'id' } },
  assigned_date: { type: DataTypes.DATEONLY },
  location: { type: DataTypes.STRING(200) },
  notes: { type: DataTypes.TEXT }
}, {
  tableName: 'assets',
  timestamps: true,
  underscored: true
});

module.exports = Asset;
