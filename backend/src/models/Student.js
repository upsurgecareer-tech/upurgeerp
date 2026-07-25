const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Student = sequelize.define('Student', {
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
  lead_id: {
    type: DataTypes.INTEGER,
    references: { model: 'leads', key: 'id' }
  },
  admission_no: {
    type: DataTypes.STRING(50),
    unique: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  dob: {
    type: DataTypes.DATEONLY
  },
  mobile: {
    type: DataTypes.STRING(15),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(100)
  },
  gender: {
    type: DataTypes.ENUM('Male', 'Female', 'Other'),
    allowNull: true
  },
  status: {
    type: DataTypes.STRING(20),
    defaultValue: 'Active'
  },
  address: {
    type: DataTypes.TEXT
  },
  parent_name: {
    type: DataTypes.STRING(100)
  },
  parent_mobile: {
    type: DataTypes.STRING(15)
  },
  photo_url: {
    type: DataTypes.STRING(255)
  }
}, {
  tableName: 'students',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['mobile'] },
    { fields: ['branch_id'] },
    { fields: ['admission_no'] }
  ]
});

module.exports = Student;
