const sequelize = require('../config/database');

async function up() {
  // Seed Lead Sources
  await sequelize.query(`
    INSERT INTO lead_sources (name, is_active) VALUES
    ('Google Ads', TRUE),
    ('Facebook Ads', TRUE),
    ('Just Dial', TRUE),
    ('Walk-in', TRUE),
    ('Reference', TRUE),
    ('Website', TRUE),
    ('Instagram', TRUE),
    ('LinkedIn', TRUE)
    ON DUPLICATE KEY UPDATE name=name;
  `);

  // Seed Lead Stages
  await sequelize.query(`
    INSERT INTO lead_stages (name, order_sequence, color_code) VALUES
    ('New', 1, '#2196F3'),
    ('Contacted', 2, '#4CAF50'),
    ('Demo Scheduled', 3, '#FF9800'),
    ('Demo Done', 4, '#9C27B0'),
    ('Follow-Up', 5, '#FFC107'),
    ('Admission', 6, '#4CAF50'),
    ('Lost', 7, '#F44336')
    ON DUPLICATE KEY UPDATE name=name;
  `);

  console.log('✅ CRM seed data inserted successfully');
}

async function down() {
  await sequelize.query('DELETE FROM lead_stages');
  await sequelize.query('DELETE FROM lead_sources');
  console.log('✅ CRM seed data removed successfully');
}

module.exports = { up, down };
