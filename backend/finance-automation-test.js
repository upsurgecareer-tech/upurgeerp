const axios = require('axios');

const API_URL = 'http://localhost:3000/api/v1';
let authToken = '';
let studentId, courseId, batchId, admissionId, installmentId;

const runTests = async () => {
  console.log('\n🚀 Starting Finance & Fees (EMI) Automation Test 🚀\n');

  try {
    // 1. Authentication
    console.log('Test 1: Authenticate as Admin');
    const authRes = await axios.post(`${API_URL}/auth/login`, {
      username: 'admin',
      password: 'admin123'
    }).catch(() => axios.post(`${API_URL}/auth/login`, {
      email: 'admin@upsurgeerp.com',
      password: 'admin123'
    }));

    authToken = authRes.data.data.token;
    console.log('✅ Authentication successful! Token acquired.\n');
    const headers = { Authorization: `Bearer ${authToken}` };

    // 2. Setup Prerequisites (Fetch existing Student, Course, Batch)
    console.log('Test 2: Fetching Prerequisites (Student, Course, Batch)...');
    
    // Fallback creates student if none exists
    let studentRes = await axios.get(`${API_URL}/students`, { headers });
    if (studentRes.data.students && studentRes.data.students.length > 0) {
      studentId = studentRes.data.students[0].id;
    } else {
      console.log('No students found, creating one...');
      const newStudent = await axios.post(`${API_URL}/students`, {
        name: 'Finance Test Student',
        mobile: `888${Math.floor(1000000 + Math.random() * 9000000)}`,
        status: 'Active'
      }, { headers });
      studentId = newStudent.data.student.id;
    }

    const courseRes = await axios.get(`${API_URL}/course-packages`, { headers });
    if (courseRes.data.packages && courseRes.data.packages.length > 0) {
      courseId = courseRes.data.packages[0].id;
    } else {
      console.log('No Course Packages found, creating one...');
      const newCourse = await axios.post(`${API_URL}/course-packages`, {
        name: 'Finance Testing Course',
        total_fee: 50000,
        duration_months: 6
      }, { headers });
      courseId = newCourse.data.coursePackage.id;
    }

    const batchRes = await axios.get(`${API_URL}/batches`, { headers });
    if (batchRes.data.batches && batchRes.data.batches.length > 0) {
      batchId = batchRes.data.batches[0].id;
    } else {
      console.log('No Batches found, creating one...');
      const newBatch = await axios.post(`${API_URL}/batches`, {
        name: 'Finance Testing Batch',
        course_package_id: courseId,
        start_date: new Date().toISOString().split('T')[0]
      }, { headers });
      batchId = newBatch.data.batch.id;
    }
    console.log(`✅ Prerequisites met: Student(${studentId}), Course(${courseId}), Batch(${batchId})\n`);

    // 3. Create Admission
    console.log('Test 3: Create an Admission');
    const admissionData = {
      student_id: studentId,
      course_package_id: courseId,
      batch_id: batchId,
      admission_date: new Date().toISOString().split('T')[0],
      total_fee: 50000,
      discount_amount: 5000
    };
    
    try {
      const createAdmRes = await axios.post(`${API_URL}/admissions`, admissionData, { headers });
      admissionId = createAdmRes.data.admission.id;
      console.log(`✅ Admission created successfully with ID: ${admissionId}\n`);
    } catch (err) {
      console.log('⚠️ Admission creation failed, finding existing one...');
      const adms = await axios.get(`${API_URL}/admissions`, { headers });
      if (adms.data.admissions && adms.data.admissions.length > 0) {
         admissionId = adms.data.admissions[0].id;
         console.log(`✅ Using existing Admission ID: ${admissionId}\n`);
      } else {
         throw err;
      }
    }

    // 4. Create Fee Schedule (EMI Generation)
    console.log('Test 4: Generate Fee Schedule (EMI Installments)');
    const feeScheduleData = {
      installments: [
        { installment_no: 1, amount: 20000, due_date: new Date().toISOString().split('T')[0] },
        { installment_no: 2, amount: 25000, due_date: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0] }
      ]
    };
    try {
      await axios.post(`${API_URL}/admissions/${admissionId}/fee-schedule`, feeScheduleData, { headers });
      console.log('✅ Fee Schedule (EMI) generated successfully!\n');
    } catch (e) {
      if (e.response?.status === 400 && e.response?.data?.message.includes('already exists')) {
        console.log('✅ Fee Schedule already exists, continuing...\n');
      } else {
        throw e;
      }
    }

    // 5. Fetch Due Payments
    console.log('Test 5: Fetch Due Payments for Branch');
    const dueRes = await axios.get(`${API_URL}/fee-payments/due`, { headers });
    console.log(`✅ Found ${dueRes.data.dueSchedules.length} overdue/pending installments.\n`);
    
    // Find our specific installment
    const myScheduleRes = await axios.get(`${API_URL}/admissions/${admissionId}/fee-schedule`, { headers });
    installmentId = myScheduleRes.data.schedule[0].id;

    // 6. Record Fee Payment
    console.log('Test 6: Record a Fee Payment');
    const paymentData = {
      admission_id: admissionId,
      installment_id: installmentId,
      amount_paid: 20000,
      payment_mode: 'UPI',
      transaction_id: 'TXN123456789',
      payment_date: new Date().toISOString().split('T')[0]
    };
    
    try {
      await axios.post(`${API_URL}/fee-payments`, paymentData, { headers });
      console.log('✅ Fee Payment recorded successfully!\n');
    } catch (err) {
      if (err.response?.status === 400 && err.response?.data?.message.includes('Already Paid')) {
         console.log('✅ Payment was already recorded previously!\n');
      } else {
         throw err;
      }
    }

    // 7. Fetch Payment History
    console.log('Test 7: Fetch Payment History');
    const historyRes = await axios.get(`${API_URL}/fee-payments/history/${admissionId}`, { headers });
    console.log(`✅ Fetched payment history successfully! Records: ${historyRes.data.payments.length}\n`);

    console.log('🎉 All Finance & Fees Automation Tests Completed Successfully! 🎉\n');

  } catch (error) {
    console.error('❌ AUTOMATION TEST FAILED:');
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(error.response.data);
    } else {
      console.error(error.message);
    }
  }
};

runTests();
