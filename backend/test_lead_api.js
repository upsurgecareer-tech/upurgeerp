require('dotenv').config();
const axios = require('axios');

async function testLeadAPI() {
  try {
    console.log('🔍 Step 1: Login to get token...\n');
    
    const loginRes = await axios.post('http://localhost:3000/api/v1/auth/login', {
      email: 'admin@upsurgeerp.com',
      password: 'admin123'
    });

    const token = loginRes.data.data.token;
    console.log('✅ Login successful');
    console.log('Token:', token.substring(0, 50) + '...\n');

    console.log('🔍 Step 2: Creating lead with token...\n');

    const leadData = {
      name: 'Test Lead',
      email: 'test@example.com',
      mobile: '9876543210',
      course_interest: 'Web Development',
      source: 'Website',
      stage: 'New'
    };

    console.log('Lead data:', leadData);

    const createRes = await axios.post('http://localhost:3000/api/v1/leads', leadData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('\n✅ Lead created successfully!');
    console.log('Response:', createRes.data);

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error occurred:');
    console.error('Status:', error.response?.status);
    console.error('Message:', error.response?.data?.message || error.message);
    console.error('Full error:', error.response?.data);
    process.exit(1);
  }
}

testLeadAPI();
