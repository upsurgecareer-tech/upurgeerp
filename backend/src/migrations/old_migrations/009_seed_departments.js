const sequelize = require('../config/database');

async function up() {
  // Seed Departments
  await sequelize.query(`
    INSERT INTO departments (branch_id, name, is_active) VALUES
    (1, 'Teaching', TRUE),
    (1, 'Non-Teaching', TRUE),
    (1, 'Administration', TRUE),
    (1, 'Sales & Marketing', TRUE),
    (1, 'Accounts', TRUE)
    ON DUPLICATE KEY UPDATE name=name;
  `);

  console.log('✅ Departments seed data inserted successfully');
}

async function down() {
  await sequelize.query('DELETE FROM departments');
  console.log('✅ Departments seed data removed successfully');
}

module.exports = { up, down };
