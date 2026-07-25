require('dotenv').config();
const Lead = require('./src/models/Lead');

async function testLeadCreate() {
  try {
    console.log('Testing lead creation...\n');

    const testData = {
      branch_id: 1,
      name: 'Test Lead',
      mobile: '9999999999',
      email: 'test@test.com',
      course_interest: 'Web Development',
      source: 'Website',
      stage: 'New',
      status: 'Active'
    };

    console.log('Data to insert:', testData);

    const lead = await Lead.create(testData);
    console.log('\n✅ Lead created successfully!');
    console.log('Lead ID:', lead.id);

    // Delete test lead
    await lead.destroy();
    console.log('✅ Test lead deleted');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('Details:', error.errors || error);
    process.exit(1);
  }
}

testLeadCreate();
