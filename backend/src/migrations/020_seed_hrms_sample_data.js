const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

async function up() {
  try {
    console.log('🚀 Starting HRMS sample data seeding...\n');

    // Get branch ID
    const [branches] = await sequelize.query('SELECT id FROM branches LIMIT 1');
    if (branches.length === 0) {
      console.log('❌ No branch found. Please create a branch first.');
      return;
    }
    const branch_id = branches[0].id;
    console.log(`✅ Using branch ID: ${branch_id}\n`);

    // Get organization ID
    const [orgs] = await sequelize.query('SELECT id FROM organizations LIMIT 1');
    const organization_id = orgs[0]?.id || 1;

    // Get role ID (default to 3 - Staff/Employee)
    const [roles] = await sequelize.query('SELECT id FROM roles WHERE name = "Staff" OR name = "Employee" LIMIT 1');
    const role_id = roles[0]?.id || 3;

    // Get departments
    const [departments] = await sequelize.query('SELECT id, name FROM departments WHERE branch_id = ?', { replacements: [branch_id] });
    console.log(`✅ Found ${departments.length} departments\n`);

    // Sample employees data
    const sampleEmployees = [
      {
        first_name: 'Rajesh',
        last_name: 'Kumar',
        email: 'rajesh.kumar@company.com',
        phone: '9876543210',
        department: 'HR',
        designation: 'HR Manager',
        employment_type: 'Full-Time',
        gender: 'Male',
        blood_group: 'O+',
        date_of_birth: '1990-05-15',
        joining_date: '2023-01-10'
      },
      {
        first_name: 'Priya',
        last_name: 'Sharma',
        email: 'priya.sharma@company.com',
        phone: '9876543211',
        department: 'Accountant',
        designation: 'Senior Accountant',
        employment_type: 'Full-Time',
        gender: 'Female',
        blood_group: 'A+',
        date_of_birth: '1992-08-20',
        joining_date: '2023-02-15'
      },
      {
        first_name: 'Amit',
        last_name: 'Patel',
        email: 'amit.patel@company.com',
        phone: '9876543212',
        department: 'Testing',
        designation: 'QA Engineer',
        employment_type: 'Full-Time',
        gender: 'Male',
        blood_group: 'B+',
        date_of_birth: '1995-03-10',
        joining_date: '2023-03-20'
      },
      {
        first_name: 'Sneha',
        last_name: 'Reddy',
        email: 'sneha.reddy@company.com',
        phone: '9876543213',
        department: 'Manager',
        designation: 'Project Manager',
        employment_type: 'Full-Time',
        gender: 'Female',
        blood_group: 'AB+',
        date_of_birth: '1988-11-25',
        joining_date: '2022-12-01'
      },
      {
        first_name: 'Vikram',
        last_name: 'Singh',
        email: 'vikram.singh@company.com',
        phone: '9876543214',
        department: 'Function',
        designation: 'Operations Executive',
        employment_type: 'Full-Time',
        gender: 'Male',
        blood_group: 'O-',
        date_of_birth: '1993-07-18',
        joining_date: '2023-04-05'
      }
    ];

    console.log('📝 Creating users and employees...\n');

    const createdEmployees = [];

    for (const emp of sampleEmployees) {
      // Find department
      const dept = departments.find(d => d.name === emp.department);
      const department_id = dept?.id || null;

      // Create user
      const password_hash = await bcrypt.hash('password123', 12);
      const username = emp.email.split('@')[0];

      const [userResult] = await sequelize.query(
        `INSERT INTO users (organization_id, branch_id, role_id, username, email, password_hash, first_name, last_name, phone, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', NOW(), NOW())`,
        { replacements: [organization_id, branch_id, role_id, username, emp.email, password_hash, emp.first_name, emp.last_name, emp.phone] }
      );

      const user_id = userResult;

      // Create employee
      const employee_code = `EMP${branch_id}${String(user_id).padStart(4, '0')}`;

      const [empResult] = await sequelize.query(
        `INSERT INTO employees (user_id, employee_code, department_id, designation, joining_date, employment_type, date_of_birth, gender, blood_group, address, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Active', NOW(), NOW())`,
        { replacements: [user_id, employee_code, department_id, emp.designation, emp.joining_date, emp.employment_type, emp.date_of_birth, emp.gender, emp.blood_group, 'Sample Address, City, State'] }
      );

      const employee_id = empResult;

      // Create leave balance
      await sequelize.query(
        `INSERT INTO leave_balances (employee_id, year, sick_leave, casual_leave, earned_leave, sick_leave_used, casual_leave_used, earned_leave_used, created_at, updated_at)
         VALUES (?, 2024, 12, 12, 15, 0, 0, 0, NOW(), NOW())`,
        { replacements: [employee_id] }
      );

      createdEmployees.push({ employee_id, user_id, name: `${emp.first_name} ${emp.last_name}` });

      console.log(`✅ Created: ${emp.first_name} ${emp.last_name} (${emp.designation})`);
    }

    console.log(`\n✅ Created ${createdEmployees.length} employees\n`);

    // Create sample leaves
    console.log('📅 Creating sample leave applications...\n');

    const leaveData = [
      { employee_idx: 0, leave_type: 'Casual', start_date: '2024-01-15', end_date: '2024-01-17', days: 3, reason: 'Family function', status: 'Approved' },
      { employee_idx: 1, leave_type: 'Sick', start_date: '2024-01-20', end_date: '2024-01-21', days: 2, reason: 'Fever and cold', status: 'Approved' },
      { employee_idx: 2, leave_type: 'Earned', start_date: '2024-02-05', end_date: '2024-02-09', days: 5, reason: 'Vacation', status: 'Pending' },
      { employee_idx: 3, leave_type: 'Casual', start_date: '2024-02-12', end_date: '2024-02-12', days: 1, reason: 'Personal work', status: 'Approved' },
      { employee_idx: 4, leave_type: 'Sick', start_date: '2024-01-25', end_date: '2024-01-26', days: 2, reason: 'Medical checkup', status: 'Rejected' }
    ];

    for (const leave of leaveData) {
      const employee_id = createdEmployees[leave.employee_idx].employee_id;
      const user_id = createdEmployees[0].user_id; // First user as approver

      await sequelize.query(
        `INSERT INTO leaves (employee_id, leave_type, start_date, end_date, total_days, reason, status, approved_by, approved_at, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), NOW())`,
        { replacements: [employee_id, leave.leave_type, leave.start_date, leave.end_date, leave.days, leave.reason, leave.status, user_id] }
      );

      // Update leave balance if approved
      if (leave.status === 'Approved') {
        const field = `${leave.leave_type.toLowerCase()}_leave_used`;
        await sequelize.query(
          `UPDATE leave_balances SET ${field} = ${field} + ? WHERE employee_id = ? AND year = 2024`,
          { replacements: [leave.days, employee_id] }
        );
      }

      console.log(`✅ Leave: ${createdEmployees[leave.employee_idx].name} - ${leave.leave_type} (${leave.status})`);
    }

    console.log(`\n✅ Created ${leaveData.length} leave applications\n`);

    // Create sample performance reviews
    console.log('📊 Creating sample performance reviews...\n');

    const performanceData = [
      { employee_idx: 0, period: 'Q4 2023', tech: 4, comm: 5, team: 4, punct: 5, quality: 4, strengths: 'Excellent communication and team management', improvements: 'Can improve technical skills', goals: 'Complete HR certification' },
      { employee_idx: 1, period: 'Q4 2023', tech: 5, comm: 4, team: 4, punct: 5, quality: 5, strengths: 'Strong accounting knowledge and accuracy', improvements: 'Can be more proactive', goals: 'Learn advanced Excel' },
      { employee_idx: 2, period: 'Q4 2023', tech: 5, comm: 3, team: 4, punct: 4, quality: 5, strengths: 'Excellent testing skills and attention to detail', improvements: 'Communication can be better', goals: 'Learn automation testing' },
      { employee_idx: 3, period: 'Q4 2023', tech: 4, comm: 5, team: 5, punct: 5, quality: 4, strengths: 'Great leadership and project management', improvements: 'Time management', goals: 'Complete PMP certification' }
    ];

    for (const perf of performanceData) {
      const employee_id = createdEmployees[perf.employee_idx].employee_id;
      const reviewer_id = createdEmployees[3].user_id; // Project Manager as reviewer
      const overall = ((perf.tech + perf.comm + perf.team + perf.punct + perf.quality) / 5).toFixed(2);

      await sequelize.query(
        `INSERT INTO performances (employee_id, review_period, reviewer_id, technical_skills, communication, teamwork, punctuality, quality_of_work, overall_rating, strengths, areas_of_improvement, goals, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Submitted', NOW(), NOW())`,
        { replacements: [employee_id, perf.period, reviewer_id, perf.tech, perf.comm, perf.team, perf.punct, perf.quality, overall, perf.strengths, perf.improvements, perf.goals] }
      );

      console.log(`✅ Performance: ${createdEmployees[perf.employee_idx].name} - ${perf.period} (${overall}/5)`);
    }

    console.log(`\n✅ Created ${performanceData.length} performance reviews\n`);

    // Summary
    console.log('═══════════════════════════════════════');
    console.log('✅ HRMS Sample Data Seeding Complete!');
    console.log('═══════════════════════════════════════');
    console.log(`📊 Summary:`);
    console.log(`   • ${createdEmployees.length} Employees created`);
    console.log(`   • ${leaveData.length} Leave applications created`);
    console.log(`   • ${performanceData.length} Performance reviews created`);
    console.log(`   • ${createdEmployees.length} Leave balances created`);
    console.log('═══════════════════════════════════════\n');

    console.log('🔑 Login Credentials:');
    console.log('   Email: rajesh.kumar@company.com');
    console.log('   Password: password123');
    console.log('   (Same password for all sample users)\n');

  } catch (error) {
    console.error('❌ Error seeding data:', error.message);
    throw error;
  }
}

async function down() {
  try {
    console.log('🗑️ Removing sample data...\n');

    // Delete in reverse order due to foreign keys
    await sequelize.query(`DELETE FROM performances WHERE id > 0`);
    await sequelize.query(`DELETE FROM leaves WHERE id > 0`);
    await sequelize.query(`DELETE FROM leave_balances WHERE id > 0`);
    await sequelize.query(`DELETE FROM employees WHERE employee_code LIKE 'EMP%'`);
    await sequelize.query(`DELETE FROM users WHERE email LIKE '%@company.com'`);

    console.log('✅ Sample data removed successfully!\n');
  } catch (error) {
    console.error('❌ Error removing data:', error.message);
    throw error;
  }
}

module.exports = { up, down };
