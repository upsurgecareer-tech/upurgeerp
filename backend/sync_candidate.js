const sequelize = require('./src/config/database');
const { Candidate } = require('./src/models');

async function sync() {
  try {
    await sequelize.authenticate();
    console.log('Connected to DB');
    await Candidate.sync({ alter: true });
    console.log('Candidate table altered successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

sync();
