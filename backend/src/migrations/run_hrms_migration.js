require('dotenv').config();
const migration = require('./018_create_hrms_tables');

async function runMigration() {
  try {
    console.log('🚀 Running HRMS migration...');
    await migration.up();
    console.log('✅ HRMS migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();
