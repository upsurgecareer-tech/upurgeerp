require('dotenv').config();
const sequelize = require('./src/config/database');

async function fixLeadsTable() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected\n');

    console.log('Altering leads table...');
    await sequelize.query('ALTER TABLE leads MODIFY source_id INT NULL');
    console.log('✅ source_id is now nullable\n');

    const [columns] = await sequelize.query('DESCRIBE leads');
    const sourceIdCol = columns.find(c => c.Field === 'source_id');
    console.log('source_id column:', sourceIdCol);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixLeadsTable();
