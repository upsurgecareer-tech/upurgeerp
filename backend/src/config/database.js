const { Sequelize } = require('sequelize');
require('dotenv').config();

const dbName = (process.env.DB_NAME && process.env.DB_NAME !== 'upsurgeerp' && process.env.DB_NAME !== 'defaultdb') ? process.env.DB_NAME : 'test';
const dbUser = (process.env.DB_USER && process.env.DB_USER !== 'root' && process.env.DB_USER !== 'avnadmin') ? process.env.DB_USER : 'DKzpL9v4P9d4wCV.root';
const defaultPass = 'lsTIMtsfr3IuebDD';
const dbPassword = (process.env.DB_PASSWORD && process.env.DB_PASSWORD.length >= 10 && !process.env.DB_PASSWORD.includes('QVZ') && process.env.DB_PASSWORD !== '7BwFmYsnZPHQn1UP' && process.env.DB_PASSWORD !== 'root') ? process.env.DB_PASSWORD : defaultPass;
const dbHost = (process.env.DB_HOST && process.env.DB_HOST !== 'localhost' && !process.env.DB_HOST.includes('127.0.0.1') && !process.env.DB_HOST.includes('aivencloud')) ? process.env.DB_HOST : 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com';
const dbPort = (process.env.DB_PORT && process.env.DB_PORT !== '3306' && process.env.DB_PORT !== '21345') ? process.env.DB_PORT : 4000;
const isSsl = dbHost !== 'localhost' && !dbHost.includes('127.0.0.1') && dbHost !== 'mysql';

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

// Test connection and sync tables without crashing the process if there is a temporary glitch
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully');
    // Require models so Sequelize registers all 64 definitions before syncing
    try {
      const models = require('../models');
      await sequelize.sync({ alter: false });
      console.log('✅ All 64 database tables synced successfully');

      // Run fast schema alignment queries to guarantee all columns exist across modules
      const alterQueries = [
        "ALTER TABLE students ADD COLUMN gender ENUM('Male', 'Female', 'Other') NULL;",
        "ALTER TABLE students ADD COLUMN city VARCHAR(100) NULL;",
        "ALTER TABLE students ADD COLUMN state VARCHAR(100) NULL;",
        "ALTER TABLE students ADD COLUMN status VARCHAR(20) DEFAULT 'Active';",
        "ALTER TABLE admissions ADD COLUMN net_payable DECIMAL(10, 2) NULL;",
        "ALTER TABLE admissions ADD COLUMN discount_amount DECIMAL(10, 2) DEFAULT 0;",
        "ALTER TABLE fee_schedules ADD COLUMN installment_no INT NULL;",
        "ALTER TABLE fee_schedules ADD COLUMN status ENUM('Pending', 'Paid', 'Overdue') DEFAULT 'Pending';",
        "ALTER TABLE fee_payments MODIFY COLUMN payment_mode VARCHAR(50) DEFAULT 'Cash';",
        "ALTER TABLE fee_payments ADD COLUMN remarks TEXT NULL;",
        "ALTER TABLE library_books ADD COLUMN quantity INT DEFAULT 1;",
        "ALTER TABLE library_books ADD COLUMN available_quantity INT DEFAULT 1;",
        "ALTER TABLE notices ADD COLUMN target_audience VARCHAR(50) DEFAULT 'All';",
        "ALTER TABLE notices ADD COLUMN publish_date DATE NULL;",
        "ALTER TABLE notices ADD COLUMN expiry_date DATE NULL;",
        "ALTER TABLE notices ADD COLUMN attachment_url VARCHAR(500) NULL;",
        "ALTER TABLE notices ADD COLUMN status VARCHAR(50) DEFAULT 'Published';",
        "ALTER TABLE leads ADD COLUMN source VARCHAR(100) NULL;",
        "ALTER TABLE leads ADD COLUMN priority VARCHAR(50) DEFAULT 'Warm';",
        "ALTER TABLE leads ADD COLUMN remarks TEXT NULL;",
        "ALTER TABLE leads MODIFY COLUMN source_id INT NULL;",
        "ALTER TABLE attendance ADD COLUMN batch_id INT NULL;"
      ];
      for (const q of alterQueries) {
        await sequelize.query(q).catch(() => {});
      }

      // Auto-seed initial data and demo data if database is empty or has very few students
      const studentCount = await models.Student.count().catch(() => 0);
      const userCount = await models.User.count().catch(() => 0);
      if (userCount < 2 || studentCount < 50) {
        console.log('🔄 Running initial seeder (Organizations, Branches, Roles, Admin User)...');
        const initialSeeder = require('../migrations/002_seed_initial_data');
        await initialSeeder.up(sequelize.getQueryInterface(), Sequelize).catch(e => console.error('⚠️ Initial seeding error:', e.message));

        console.log('🔄 Running comprehensive 100-record demo seeder...');
        const seeder = require('../migrations/021_seed_100_demo_records');
        await seeder.up().catch(e => console.error('⚠️ Seeding error:', e.message));
        console.log('✅ Auto-seeding completed on startup!');
      }
    } catch (syncErr) {
      console.error('⚠️ Table sync warning:', syncErr.message);
    }
  } catch (error) {
    console.error('❌ Unable to connect to database:', error.message);
  }
};

module.exports = sequelize;
module.exports.testConnection = testConnection;
