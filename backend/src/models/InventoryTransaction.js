const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const InventoryTransaction = sequelize.define('InventoryTransaction', {
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
  item_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'inventory_items', key: 'id' }
  },
  transaction_type: {
    type: DataTypes.ENUM('Purchase', 'Issue', 'Return', 'Adjustment'),
    allowNull: false
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  transaction_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  reference_type: {
    type: DataTypes.STRING(50)
  },
  reference_id: {
    type: DataTypes.STRING(50)
  },
  remarks: {
    type: DataTypes.TEXT
  },
  created_by: {
    type: DataTypes.INTEGER,
    references: { model: 'users', key: 'id' }
  }
}, {
  tableName: 'inventory_transactions',
  timestamps: true,
  underscored: true
});

module.exports = InventoryTransaction;
