const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Notice = sequelize.define('Notice', {
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
  title: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  target_audience: {
    type: DataTypes.ENUM('All', 'Students', 'Staff', 'Parents', 'Specific'),
    defaultValue: 'All'
  },
  priority: {
    type: DataTypes.ENUM('Low', 'Medium', 'High', 'Urgent'),
    defaultValue: 'Medium'
  },
  publish_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  expiry_date: {
    type: DataTypes.DATEONLY
  },
  attachment_url: {
    type: DataTypes.STRING(500)
  },
  created_by: {
    type: DataTypes.INTEGER,
    references: { model: 'users', key: 'id' }
  },
  status: {
    type: DataTypes.ENUM('Draft', 'Published', 'Expired'),
    defaultValue: 'Draft'
  }
}, {
  tableName: 'notices',
  timestamps: true,
  underscored: true
});

module.exports = Notice;
