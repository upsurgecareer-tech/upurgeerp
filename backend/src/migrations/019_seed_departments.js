const sequelize = require('../config/database');

async function up() {
  try {
    // Get all branches
    const [branches] = await sequelize.query('SELECT id FROM branches');
    
    if (branches.length === 0) {
      console.log('⚠️ No branches found. Please create a branch first.');
      return;
    }

    // Departments to add
    const departments = [
      'HR',
      'Accountant',
      'Manager',
      'Testing',
      'Function'
    ];

    // Add departments for each branch
    for (const branch of branches) {
      for (const deptName of departments) {
        // Check if department already exists
        const [existing] = await sequelize.query(
          'SELECT id FROM departments WHERE branch_id = ? AND name = ?',
          { replacements: [branch.id, deptName] }
        );

        if (existing.length === 0) {
          await sequelize.query(
            'INSERT INTO departments (branch_id, name, is_active, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())',
            { replacements: [branch.id, deptName, true] }
          );
          console.log(`✅ Added department: ${deptName} for branch ${branch.id}`);
        } else {
          console.log(`⚠️ Department ${deptName} already exists for branch ${branch.id}`);
        }
      }
    }

    console.log('✅ Department seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding departments:', error.message);
    throw error;
  }
}

async function down() {
  try {
    const departments = ['HR', 'Accountant', 'Manager', 'Testing', 'Function'];
    
    for (const deptName of departments) {
      await sequelize.query(
        'DELETE FROM departments WHERE name = ?',
        { replacements: [deptName] }
      );
      console.log(`✅ Removed department: ${deptName}`);
    }

    console.log('✅ Department removal completed successfully!');
  } catch (error) {
    console.error('❌ Error removing departments:', error.message);
    throw error;
  }
}

module.exports = { up, down };
