const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const LibraryBook = sequelize.define('LibraryBook', {
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
  isbn: {
    type: DataTypes.STRING(50)
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  author: {
    type: DataTypes.STRING(100)
  },
  publisher: {
    type: DataTypes.STRING(100)
  },
  category: {
    type: DataTypes.STRING(100)
  },
  quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  available_quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  rack_number: {
    type: DataTypes.STRING(50)
  },
  price: {
    type: DataTypes.DECIMAL(10, 2)
  },
  purchase_date: {
    type: DataTypes.DATE
  },
  status: {
    type: DataTypes.ENUM('Available', 'Issued', 'Damaged', 'Lost'),
    defaultValue: 'Available'
  }
}, {
  tableName: 'library_books',
  timestamps: true,
  underscored: true
});

module.exports = LibraryBook;
