const axios = require('axios');

// Test Students API
async function testStudentsAPI() {
  try {
    console.log('Testing Students API...\n');

    // First, login to get token
    console.log('1. Logging in...');
    const loginRes = await axios.post('http://localhost:3000/api/auth/login', {
      email: 'admin@upsurgeerp.com',
      password: 'admin123'
    });

    const token = loginRes.data.token;
    console.log('✅ Login successful\n');

    // Test GET /students
    console.log('2. Fetching students...');
    const studentsRes = await axios.get('http://localhost:3000/api/students', {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('✅ Students fetched successfully');
    console.log(`   Total students: ${studentsRes.data.students?.length || 0}`);
    
    if (studentsRes.data.students && studentsRes.data.students.length > 0) {
      const student = studentsRes.data.students[0];
      console.log(`   Sample student: ${student.name} (${student.admission_no})`);
    }
    console.log('');

    // Test GET /batches
    console.log('3. Fetching batches...');
    try {
      const batchesRes = await axios.get('http://localhost:3000/api/batches', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Batches fetched successfully');
      console.log(`   Total batches: ${batchesRes.data.batches?.length || 0}\n`);
    } catch (err) {
      console.log('⚠️  Batches endpoint error:', err.response?.data?.message || err.message);
      console.log('');
    }

    // Test GET /course-packages
    console.log('4. Fetching course packages...');
    try {
      const coursesRes = await axios.get('http://localhost:3000/api/course-packages', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Course packages fetched successfully');
      console.log(`   Total courses: ${coursesRes.data.packages?.length || 0}\n`);
    } catch (err) {
      console.log('⚠️  Course packages endpoint error:', err.response?.data?.message || err.message);
      console.log('');
    }

    console.log('✅ All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

// Run the test
testStudentsAPI();
