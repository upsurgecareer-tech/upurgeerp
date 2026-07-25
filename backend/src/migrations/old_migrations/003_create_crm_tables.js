const sequelize = require('../config/database');

async function up() {
  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS lead_sources (
      id INT PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(100) NOT NULL UNIQUE,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
  `);

  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS lead_stages (
      id INT PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(50) NOT NULL UNIQUE,
      order_sequence INT NOT NULL,
      color_code VARCHAR(20) DEFAULT '#1976d2',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
  `);

  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS leads (
      id INT PRIMARY KEY AUTO_INCREMENT,
      branch_id INT NOT NULL,
      source_id INT NOT NULL,
      assigned_to INT,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100),
      mobile VARCHAR(15) NOT NULL,
      course_interest VARCHAR(200),
      stage VARCHAR(50) DEFAULT 'New',
      status ENUM('Active', 'Converted', 'Lost') DEFAULT 'Active',
      remarks TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (branch_id) REFERENCES branches(id),
      FOREIGN KEY (source_id) REFERENCES lead_sources(id),
      FOREIGN KEY (assigned_to) REFERENCES users(id),
      INDEX idx_mobile (mobile),
      INDEX idx_branch (branch_id),
      INDEX idx_assigned (assigned_to)
    );
  `);

  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS follow_ups (
      id INT PRIMARY KEY AUTO_INCREMENT,
      lead_id INT NOT NULL,
      counsellor_id INT NOT NULL,
      follow_up_date DATETIME NOT NULL,
      follow_up_type ENUM('Call', 'Meeting', 'Demo', 'Email') DEFAULT 'Call',
      notes TEXT,
      status ENUM('Pending', 'Done', 'Cancelled') DEFAULT 'Pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
      FOREIGN KEY (counsellor_id) REFERENCES users(id),
      INDEX idx_lead (lead_id),
      INDEX idx_counsellor (counsellor_id),
      INDEX idx_date (follow_up_date)
    );
  `);

  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS lead_activities (
      id INT PRIMARY KEY AUTO_INCREMENT,
      lead_id INT NOT NULL,
      user_id INT NOT NULL,
      activity_type VARCHAR(50) NOT NULL,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  console.log('✅ CRM tables created successfully');
}

async function down() {
  await sequelize.query('DROP TABLE IF EXISTS lead_activities');
  await sequelize.query('DROP TABLE IF EXISTS follow_ups');
  await sequelize.query('DROP TABLE IF EXISTS leads');
  await sequelize.query('DROP TABLE IF EXISTS lead_stages');
  await sequelize.query('DROP TABLE IF EXISTS lead_sources');
  console.log('✅ CRM tables dropped successfully');
}

module.exports = { up, down };
