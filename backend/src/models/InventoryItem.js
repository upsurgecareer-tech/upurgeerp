const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const InventoryItem = sequelize.define('InventoryItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  branch_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'branches', key: 'id' }
  },
  item_code: {
    type: DataTypes.STRING(50)
  },
  name: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  category: {
    type: DataTypes.STRING(100)
  },
  quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  unit: {
    type: DataTypes.STRING(50)
  },
  min_stock_level: {
    type: DataTypes.INTEGER,
    defaultValue: 10
  },
  unit_price: {
    type: DataTypes.DECIMAL(10, 2)
  },
  location: {
    type: DataTypes.STRING(100)
  },
  status: {
    type: DataTypes.ENUM('In Stock', 'Low Stock', 'Out of Stock'),
    defaultValue: 'In Stock'
  }
}, {
  tableName: 'inventory_items',
  timestamps: true,
  underscored: true
});

module.exports = InventoryItem;
