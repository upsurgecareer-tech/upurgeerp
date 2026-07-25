const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const StudyMaterial = sequelize.define('StudyMaterial', {
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
  batch_id: {
    type: DataTypes.INTEGER,
    references: { model: 'batches', key: 'id' }
  },
  course_package_id: {
    type: DataTypes.INTEGER,
    references: { model: 'course_packages', key: 'id' }
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  subject: {
    type: DataTypes.STRING(100)
  },
  file_url: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  file_type: {
    type: DataTypes.STRING(50),
    defaultValue: 'pdf'
  },
  uploaded_by: {
    type: DataTypes.INTEGER,
    references: { model: 'users', key: 'id' }
  },
  status: {
    type: DataTypes.ENUM('Draft', 'Published', 'Archived'),
    defaultValue: 'Published'
  }
}, {
  tableName: 'study_materials',
  timestamps: true,
  underscored: true
});

module.exports = StudyMaterial;
