const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const sequelize = require('../config/database');

const migrationsPath = path.join(__dirname);
const migrationFiles = fs.readdirSync(migrationsPath)
  .filter(file => file.endsWith('.js') && file !== 'run.js')
  .sort();

const runMigrations = async () => {
  try {
    console.log('🔄 Starting database migrations...\n');
    
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connected\n');
    
    // Run each migration
    for (const file of migrationFiles) {
      console.log(`📝 Running migration: ${file}`);
      const migration = require(path.join(migrationsPath, file));
      
      try {
        await migration.up(sequelize.getQueryInterface(), sequelize.Sequelize);
        console.log(`✅ Completed: ${file}\n`);
      } catch (error) {
        console.error(`❌ Failed: ${file}`);
        console.error(`Error: ${error.message}\n`);
        throw error;
      }
    }
    
    console.log('🎉 All migrations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  }
};

runMigrations();
