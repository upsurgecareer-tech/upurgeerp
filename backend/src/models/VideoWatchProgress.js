const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const VideoWatchProgress = sequelize.define('VideoWatchProgress', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  video_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'lms_videos', key: 'id' }
  },
  student_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'students', key: 'id' }
  },
  watched_seconds: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  completed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  last_watched_at: {
    type: DataTypes.DATE
  }
}, {
  tableName: 'video_watch_progress',
  timestamps: true,
  underscored: true
});

module.exports = VideoWatchProgress;
