'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if organization already exists
    const [orgs] = await queryInterface.sequelize.query(
      'SELECT id FROM organizations WHERE email = ?',
      { replacements: ['info@upsurgeinfotech.com'] }
    );
    
    if (orgs.length === 0) {
      // Insert default organization
      await queryInterface.sequelize.query(
        'INSERT INTO organizations (name, email, phone, status, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())',
        {
          replacements: ['Upsurge Infotech', 'info@upsurgeinfotech.com', '9876543210', 'active']
        }
      );
    }

    // Check if branch already exists
    const [branches] = await queryInterface.sequelize.query(
      'SELECT id FROM branches WHERE code = ?',
      { replacements: ['BR001'] }
    );
    
    if (branches.length === 0) {
      // Insert default branch
      await queryInterface.sequelize.query(
        'INSERT INTO branches (organization_id, name, code, status, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())',
        {
          replacements: [1, 'Main Branch', 'BR001', 'active']
        }
      );
    }

    // Insert roles if not exist
    const roles = [
      ['Super Admin', 'Full system access', '{"all":true}'],
      ['Branch Admin', 'Branch level access', '{"branch":true,"dashboard":true,"crm":true,"students":true,"lms":true,"hrms":true,"reports":true}'],
      ['Faculty', 'Teaching and attendance access', '{"batches":true,"attendance":true,"students":true,"lms":true,"dashboard":true}'],
      ['Counsellor', 'CRM and admissions access', '{"leads":true,"admissions":true,"crm":true,"students":true,"dashboard":true}'],
      ['Cashier', 'Fee collection access', '{"fees":true,"receipts":true,"students":true,"dashboard":true}'],
      ['HR', 'Human resources executive and attendance management access', '{"hrms":["read","write","manage"],"attendance":["read","write"],"staff":["read"],"reports":["read"]}'],
      ['Counselling', 'Student counselling, CRM inquiries, and admissions access', '{"crm":["read","write","manage"],"leads":["read","write","manage"],"admissions":["read","write","manage"],"students":["read","write"],"dashboard":["read"]}'],
      ['Accountant', 'Financial accounting, fee collection, and expense management', '{"fees":["read","write","manage"],"accounting":["read","write","manage"],"expenses":["read","write","manage"],"reports":["read","write"]}'],
      ['Receptionist', 'Front desk operations, visitor logs, and initial inquiry handling', '{"inquiries":["read","write"],"visitors":["read","write","manage"],"students":["read"],"dashboard":["read"]}'],
      ['Academic Coordinator', 'Batch scheduling, timetable planning, and exam coordination', '{"batches":["read","write","manage"],"courses":["read","write","manage"],"timetable":["read","write","manage"],"exams":["read","write","manage"],"students":["read","write"]}'],
      ['Placement Officer', 'Corporate recruitment, student interviews, and placement drives', '{"placements":["read","write","manage"],"students":["read","write"],"companies":["read","write","manage"],"dashboard":["read"]}'],
      ['Marketing Lead', 'Marketing campaigns, lead generation, and promotional analytics', '{"crm":["read","write","manage"],"campaigns":["read","write","manage"],"leads":["read","write","manage"],"dashboard":["read"]}'],
      ['IT Admin', 'System administration, user access control, and security logs', '{"admin":["read","write","manage"],"users":["read","write","manage"],"settings":["read","write","manage"],"dashboard":["read"]}'],
      ['Librarian', 'Library management, book circulation, and reading room monitoring', '{"library":["read","write","manage"],"books":["read","write","manage"],"students":["read"],"dashboard":["read"]}'],
      ['Transport Manager', 'Bus route planning, vehicle maintenance, and transport tracking', '{"transport":["read","write","manage"],"vehicles":["read","write","manage"],"routes":["read","write","manage"],"students":["read"]}'],
      ['Hostel Warden', 'Hostel accommodation, student allocation, and mess management', '{"hostel":["read","write","manage"],"rooms":["read","write","manage"],"mess":["read","write","manage"],"students":["read","write"]}']
    ];

    for (const [name, description, permissions] of roles) {
      const [existing] = await queryInterface.sequelize.query(
        'SELECT id FROM roles WHERE name = ?',
        { replacements: [name] }
      );
      
      if (existing.length === 0) {
        await queryInterface.sequelize.query(
          'INSERT INTO roles (name, description, permissions, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())',
          {
            replacements: [name, description, permissions, 1]
          }
        );
      }
    }

    // Check if admin user already exists
    const [users] = await queryInterface.sequelize.query(
      'SELECT id FROM users WHERE email = ?',
      { replacements: ['admin@upsurgeerp.com'] }
    );
    
    if (users.length === 0) {
      // Create default admin user
      const hashedPassword = await bcrypt.hash('admin123', 12);
      await queryInterface.sequelize.query(
        'INSERT INTO users (organization_id, branch_id, role_id, username, email, password_hash, first_name, last_name, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
        {
          replacements: [1, 1, 1, 'admin', 'admin@upsurgeerp.com', hashedPassword, 'Super', 'Admin', 'active']
        }
      );
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query('DELETE FROM users WHERE email = ?', { replacements: ['admin@upsurgeerp.com'] });
    await queryInterface.sequelize.query('DELETE FROM roles');
    await queryInterface.sequelize.query('DELETE FROM branches WHERE code = ?', { replacements: ['BR001'] });
    await queryInterface.sequelize.query('DELETE FROM organizations WHERE email = ?', { replacements: ['info@upsurgeinfotech.com'] });
  }
};
