require('dotenv').config();
const { Sequelize } = require('sequelize');
const bcrypt = require('bcryptjs');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false
  }
);

async function checkUser() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    const [users] = await sequelize.query(
      'SELECT id, email, password_hash, status FROM users WHERE email = "admin@upsurgeerp.com"'
    );

    if (users.length === 0) {
      console.log('❌ Admin user NOT found!');
      console.log('Creating admin user...');
      
      const hashedPassword = await bcrypt.hash('admin123', 12);
      await sequelize.query(
        'INSERT INTO users (organization_id, branch_id, role_id, username, email, password_hash, first_name, last_name, status, created_at, updated_at) VALUES (1, 1, 1, "admin", "admin@upsurgeerp.com", ?, "Super", "Admin", "active", NOW(), NOW())',
        { replacements: [hashedPassword] }
      );
      
      console.log('✅ Admin user created!');
    } else {
      const user = users[0];
      console.log('✅ Admin user found:');
      console.log('   ID:', user.id);
      console.log('   Email:', user.email);
      console.log('   Status:', user.status);
      console.log('   Password Hash:', user.password_hash.substring(0, 20) + '...');
      
      // Test password
      const isValid = await bcrypt.compare('admin123', user.password_hash);
      console.log('   Password Test:', isValid ? '✅ VALID' : '❌ INVALID');
      
      if (!isValid) {
        console.log('\n🔧 Fixing password...');
        const newHash = await bcrypt.hash('admin123', 12);
        await sequelize.query(
          'UPDATE users SET password_hash = ? WHERE email = "admin@upsurgeerp.com"',
          { replacements: [newHash] }
        );
        console.log('✅ Password updated!');
      }
    }

    await sequelize.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkUser();
