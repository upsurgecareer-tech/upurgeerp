require('dotenv').config();
const migration = require('./019_seed_departments');

async function runMigration() {
  try {
    console.log('🚀 Running Department Seeding Migration...');
    await migration.up();
    console.log('✅ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();
