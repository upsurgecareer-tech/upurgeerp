const sequelize = require('../config/database');

async function up() {
  // Seed Course Packages
  await sequelize.query(`
    INSERT INTO course_packages (branch_id, name, total_fee, duration_months, description, is_active) VALUES
    (1, 'Full Stack Development', 50000.00, 6, 'Complete web development course with React, Node.js, and databases', TRUE),
    (1, 'Data Science & AI', 60000.00, 8, 'Python, Machine Learning, Deep Learning, and AI fundamentals', TRUE),
    (1, 'Digital Marketing', 30000.00, 4, 'SEO, SEM, Social Media Marketing, and Analytics', TRUE),
    (1, 'Graphic Design', 25000.00, 3, 'Photoshop, Illustrator, and UI/UX Design', TRUE)
    ON DUPLICATE KEY UPDATE name=name;
  `);

  // Seed Batches
  await sequelize.query(`
    INSERT INTO batches (branch_id, name, start_date, end_date, is_active) VALUES
    (1, 'Batch A - Morning', '2026-04-01', '2026-09-30', TRUE),
    (1, 'Batch B - Evening', '2026-04-01', '2026-09-30', TRUE),
    (1, 'Batch C - Weekend', '2026-04-05', '2026-10-05', TRUE)
    ON DUPLICATE KEY UPDATE name=name;
  `);

  console.log('✅ Course packages and batches seed data inserted successfully');
}

async function down() {
  await sequelize.query('DELETE FROM batches');
  await sequelize.query('DELETE FROM course_packages');
  console.log('✅ Course packages and batches seed data removed successfully');
}

module.exports = { up, down };
