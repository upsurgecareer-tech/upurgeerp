require('dotenv').config();
const User = require('./src/models/User');
const bcrypt = require('bcryptjs');
const { generateAccessToken } = require('./src/utils/jwt');

async function testLogin() {
  try {
    console.log('🔍 Testing login flow...\n');

    const email = 'admin@upsurgeerp.com';
    const password = 'admin123';

    // Step 1: Find user
    console.log('Step 1: Finding user...');
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      console.error('❌ User not found');
      process.exit(1);
    }
    console.log('✅ User found:', user.email);

    // Step 2: Check password
    console.log('\nStep 2: Checking password...');
    const isValid = await user.comparePassword(password);
    console.log('✅ Password valid:', isValid);

    if (!isValid) {
      console.error('❌ Invalid password');
      process.exit(1);
    }

    // Step 3: Check status
    console.log('\nStep 3: Checking status...');
    console.log('User status:', user.status);
    console.log('Is active:', user.status === 'active');

    // Step 4: Generate token
    console.log('\nStep 4: Generating token...');
    const token = generateAccessToken({
      id: user.id,
      email: user.email,
      role_id: user.role_id,
      branch_id: user.branch_id
    });
    console.log('✅ Token generated:', token.substring(0, 50) + '...');

    // Step 5: Update last login
    console.log('\nStep 5: Updating last login...');
    await user.update({ last_login: new Date() });
    console.log('✅ Last login updated');

    console.log('\n🎉 Login flow completed successfully!');
    console.log('\nResponse data:');
    console.log({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role_id: user.role_id,
        branch_id: user.branch_id
      },
      token: token.substring(0, 50) + '...'
    });

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

testLogin();
