require('dotenv').config();
const sequelize = require('./src/config/database');

async function checkLeadsTable() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected\n');

    const [columns] = await sequelize.query('DESCRIBE leads');
    console.log('Leads table structure:');
    console.table(columns);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkLeadsTable();
