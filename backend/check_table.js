require('dotenv').config();
const sequelize = require('./src/config/database');

async function checkTable() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected\n');

    const [columns] = await sequelize.query('DESCRIBE users');
    console.log('Users table structure:');
    console.table(columns);

    const [users] = await sequelize.query('SELECT * FROM users LIMIT 1');
    console.log('\nFirst user:');
    console.log(users[0]);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkTable();
