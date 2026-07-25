require('dotenv').config();
const sequelize = require('./src/config/database');

async function checkLeads() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected\n');

    const [leads] = await sequelize.query('SELECT COUNT(*) as total, COUNT(CASE WHEN DATE(created_at) = CURDATE() THEN 1 END) as today FROM leads');
    console.log('Total Leads:', leads[0].total);
    console.log('Today Leads:', leads[0].today);

    const [recent] = await sequelize.query('SELECT id, name, email, stage, DATE(created_at) as date FROM leads ORDER BY created_at DESC LIMIT 5');
    console.log('\nRecent Leads:');
    console.table(recent);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkLeads();
