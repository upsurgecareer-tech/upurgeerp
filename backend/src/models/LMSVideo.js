const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const LMSVideo = sequelize.define('LMSVideo', {
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
  course_package_id: {
    type: DataTypes.INTEGER,
    references: { model: 'course_packages', key: 'id' }
  },
  batch_id: {
    type: DataTypes.INTEGER,
    references: { model: 'batches', key: 'id' }
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  video_url: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  thumbnail_url: {
    type: DataTypes.STRING(500)
  },
  duration_seconds: {
    type: DataTypes.INTEGER
  },
  order_sequence: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  is_free: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  uploaded_by: {
    type: DataTypes.INTEGER,
    references: { model: 'users', key: 'id' }
  },
  status: {
    type: DataTypes.ENUM('Draft', 'Published', 'Archived'),
    defaultValue: 'Draft'
  }
}, {
  tableName: 'lms_videos',
  timestamps: true,
  underscored: true
});

module.exports = LMSVideo;
