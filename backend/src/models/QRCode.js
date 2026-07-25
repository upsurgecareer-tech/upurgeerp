const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const QRCode = sequelize.define('QRCode', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  student_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: { model: 'students', key: 'id' }
  },
  qr_token: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  qr_image_url: {
    type: DataTypes.STRING(255)
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'qr_codes',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['qr_token'] },
    { fields: ['student_id'] }
  ]
});

// Define associations
QRCode.associate = (models) => {
  QRCode.belongsTo(models.Student, {
    foreignKey: 'student_id',
    as: 'student'
  });
};

module.exports = QRCode;
