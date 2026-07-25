require('dotenv').config();
const migration = require('./020_seed_hrms_sample_data');

async function runMigration() {
  try {
    console.log('🚀 Running HRMS Sample Data Seeding...\n');
    await migration.up();
    console.log('✅ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();
