const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const sequelize = require('../config/database');

const migrationsPath = path.join(__dirname);
const migrationFiles = fs.readdirSync(migrationsPath)
  .filter(file => file.endsWith('.js') && /^\d+/.test(file))
  .sort();

const runMigrations = async () => {
  try {
    console.log('🔄 Starting database migrations...\n');
    
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connected\n');
    
    const qi = sequelize.getQueryInterface();
    const origAddIndex = qi.addIndex.bind(qi);
    qi.addIndex = async (...args) => {
      try {
        return await origAddIndex(...args);
      } catch (err) {
        if (err.message.includes('Duplicate') || err.message.includes('already exists') || err.message.includes("doesn't exist in table") || err.message.includes('Key column')) {
          console.log(`  ⚠️ Skipped index: ${err.message}`);
        } else {
          throw err;
        }
      }
    };
    
    // Override removeIndex as well
    const origRemoveIndex = qi.removeIndex.bind(qi);
    qi.removeIndex = async (...args) => {
      try {
        return await origRemoveIndex(...args);
      } catch (err) { /* ignore */ }
    };
    
    // Override bulkInsert to ignore duplicates
    const origBulkInsert = qi.bulkInsert.bind(qi);
    qi.bulkInsert = async (...args) => {
      try {
        return await origBulkInsert(...args);
      } catch (err) {
        if (err.message.includes('Duplicate') || err.message.includes('Validation error') || err.message.includes('already exists')) {
          console.log(`  ⚠️ Skipped duplicate seed data in bulkInsert: ${err.message}`);
        } else {
          throw err;
        }
      }
    };
    
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
