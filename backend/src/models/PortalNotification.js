const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PortalNotification = sequelize.define('PortalNotification', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'users', key: 'id' }
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  notification_type: {
    type: DataTypes.ENUM('Info', 'Warning', 'Success', 'Error'),
    defaultValue: 'Info'
  },
  is_read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  link_url: {
    type: DataTypes.STRING(500)
  }
}, {
  tableName: 'portal_notifications',
  timestamps: true,
  underscored: true
});

module.exports = PortalNotification;
