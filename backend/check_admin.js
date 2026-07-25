require('dotenv').config();
const sequelize = require('./src/config/database');
const bcrypt = require('bcryptjs');

async function checkAndCreateAdmin() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Check if admin exists
    const [users] = await sequelize.query(
      'SELECT id, email, first_name FROM users WHERE email = ?',
      { replacements: ['admin@upsurgeerp.com'] }
    );

    if (users.length > 0) {
      console.log('✅ Admin user already exists:', users[0]);
    } else {
      console.log('❌ Admin user not found. Creating...');
      
      const hashedPassword = await bcrypt.hash('admin123', 12);
      await sequelize.query(
        'INSERT INTO users (branch_id, role_id, username, email, password_hash, first_name, last_name, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
        {
          replacements: [1, 1, 'admin', 'admin@upsurgeerp.com', hashedPassword, 'Super', 'Admin', 'active']
        }
      );
      
      console.log('✅ Admin user created successfully!');
      console.log('Email: admin@upsurgeerp.com');
      console.log('Password: admin123');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkAndCreateAdmin();
