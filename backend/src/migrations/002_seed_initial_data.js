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
      ['Branch Admin', 'Branch level access', '{"branch":true}'],
      ['Faculty', 'Teaching and attendance access', '{"batches":true,"attendance":true}'],
      ['Counsellor', 'CRM and admissions access', '{"leads":true,"admissions":true}'],
      ['Cashier', 'Fee collection access', '{"fees":true}']
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
