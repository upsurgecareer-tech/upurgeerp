'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if data already exists
    const [sources] = await queryInterface.sequelize.query('SELECT COUNT(*) as count FROM lead_sources');
    
    if (sources[0].count === 0) {
      // Seed Lead Sources
      await queryInterface.bulkInsert('lead_sources', [
        { name: 'Google Ads', is_active: true },
        { name: 'Facebook Ads', is_active: true },
        { name: 'Just Dial', is_active: true },
        { name: 'Walk-in', is_active: true },
        { name: 'Reference', is_active: true },
        { name: 'Website', is_active: true },
        { name: 'Instagram', is_active: true },
        { name: 'LinkedIn', is_active: true }
      ]);
    }

    const [stages] = await queryInterface.sequelize.query('SELECT COUNT(*) as count FROM lead_stages');
    
    if (stages[0].count === 0) {
      // Seed Lead Stages
      await queryInterface.bulkInsert('lead_stages', [
        { name: 'New', order_sequence: 1, color_code: '#2196F3' },
        { name: 'Contacted', order_sequence: 2, color_code: '#4CAF50' },
        { name: 'Demo Scheduled', order_sequence: 3, color_code: '#FF9800' },
        { name: 'Demo Done', order_sequence: 4, color_code: '#9C27B0' },
        { name: 'Follow-Up', order_sequence: 5, color_code: '#FFC107' },
        { name: 'Admission', order_sequence: 6, color_code: '#4CAF50' },
        { name: 'Lost', order_sequence: 7, color_code: '#F44336' }
      ]);
    }

    console.log('✅ CRM seed data inserted successfully');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('lead_stages', null, {});
    await queryInterface.bulkDelete('lead_sources', null, {});
    console.log('✅ CRM seed data removed successfully');
  }
};
