const { Sequelize } = require('sequelize');
const bcrypt = require('bcryptjs');

const sequelize = new Sequelize('upsurgeerp', 'root', 'root', {
  host: 'localhost',
  dialect: 'mysql',
  logging: false
});

async function run() {
  try {
    const [roles] = await sequelize.query('SELECT * FROM roles;');
    console.log('Current Roles:', roles.map(r => r.name));

    if (!roles.find(r => r.name === 'HR Manager')) {
      await sequelize.query("INSERT INTO roles (name, description, permissions, created_at, updated_at) VALUES ('HR Manager', 'Manages Human Resources', '{\"hrms\":true}', NOW(), NOW())");
      console.log('HR Manager role added!');
    }

    const [hrRoles] = await sequelize.query("SELECT id FROM roles WHERE name='HR Manager'");
    const hrRoleId = hrRoles[0].id;

    const [users] = await sequelize.query("SELECT * FROM users WHERE role_id=" + hrRoleId);
    if (users.length === 0) {
      const hash = await bcrypt.hash('HR@123', 10);
      await sequelize.query(`
        INSERT INTO users (organization_id, branch_id, role_id, username, email, password_hash, first_name, last_name, phone, status, created_at, updated_at) 
        VALUES (1, 1, ${hrRoleId}, 'hr.manager', 'hr@upsurgeerp.com', '${hash}', 'Anjali', 'Sharma', '9876543210', 'active', NOW(), NOW())
      `);
      console.log('HR User created: hr@upsurgeerp.com / HR@123');
    } else {
      console.log('HR User already exists:', users[0].email);
    }
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}
run();
