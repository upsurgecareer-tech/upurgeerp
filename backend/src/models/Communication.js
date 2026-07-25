const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Communication = sequelize.define('Communication', {
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
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  communication_type: {
    type: DataTypes.ENUM('Email', 'SMS', 'WhatsApp', 'Push'),
    allowNull: false
  },
  target_audience: {
    type: DataTypes.ENUM('All', 'Students', 'Staff', 'Parents', 'Specific'),
    defaultValue: 'All'
  },
  target_ids: {
    type: DataTypes.JSON
  },
  scheduled_at: {
    type: DataTypes.DATE
  },
  sent_at: {
    type: DataTypes.DATE
  },
  status: {
    type: DataTypes.ENUM('Draft', 'Scheduled', 'Sent', 'Failed'),
    defaultValue: 'Draft'
  },
  created_by: {
    type: DataTypes.INTEGER,
    references: { model: 'users', key: 'id' }
  }
}, {
  tableName: 'communications',
  timestamps: true,
  underscored: true
});

const CommunicationLog = sequelize.define('CommunicationLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  communication_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'communications', key: 'id' }
  },
  recipient_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  recipient_type: {
    type: DataTypes.ENUM('Student', 'Staff', 'Parent'),
    allowNull: false
  },
  recipient_contact: {
    type: DataTypes.STRING(100)
  },
  status: {
    type: DataTypes.ENUM('Pending', 'Sent', 'Delivered', 'Failed', 'Bounced'),
    defaultValue: 'Pending'
  },
  sent_at: {
    type: DataTypes.DATE
  },
  delivered_at: {
    type: DataTypes.DATE
  },
  error_message: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'communication_logs',
  timestamps: true,
  underscored: true
});

module.exports = { Communication, CommunicationLog };
