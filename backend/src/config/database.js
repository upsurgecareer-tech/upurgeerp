const { Sequelize } = require('sequelize');
require('dotenv').config();

const dbName = process.env.DB_NAME || 'defaultdb';
const dbUser = process.env.DB_USER || 'avnadmin';
const dbPassword = process.env.DB_PASSWORD;
const dbHost = (process.env.DB_HOST && process.env.DB_HOST !== 'localhost' && !process.env.DB_HOST.includes('127.0.0.1')) ? process.env.DB_HOST : 'mysql-b0c2561-upsurgecareer-ba86.i.aivencloud.com';
const dbPort = process.env.DB_PORT || 21345;
const isSsl = dbHost.includes('aivencloud') || process.env.DB_SSL === 'true';

const sequelize = new Sequelize(
  dbName,
  dbUser,
  dbPassword,
  {
    host: dbHost,
    port: dbPort,
    dialect: 'mysql',
    dialectOptions: isSsl ? {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    } : {},
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true
    },
    timezone: '+05:30'
  }
);

// Test connection without crashing the process if there is a temporary glitch
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully');
  } catch (error) {
    console.error('❌ Unable to connect to database:', error.message);
  }
};

module.exports = sequelize;
module.exports.testConnection = testConnection;
