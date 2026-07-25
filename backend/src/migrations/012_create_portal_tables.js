const sequelize = require('../config/database');

async function up() {
  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS parent_students (
      id INT PRIMARY KEY AUTO_INCREMENT,
      parent_id INT NOT NULL,
      student_id INT NOT NULL,
      relationship ENUM('Father', 'Mother', 'Guardian') NOT NULL,
      is_primary BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (parent_id) REFERENCES users(id),
      FOREIGN KEY (student_id) REFERENCES students(id),
      UNIQUE KEY unique_parent_student (parent_id, student_id)
    );
  `);

  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS portal_notifications (
      id INT PRIMARY KEY AUTO_INCREMENT,
      user_id INT NOT NULL,
      user_type ENUM('Student', 'Parent') NOT NULL,
      title VARCHAR(200) NOT NULL,
      message TEXT NOT NULL,
      type ENUM('Fee', 'Exam', 'Notice', 'Chat', 'Assignment', 'Attendance') NOT NULL,
      is_read BOOLEAN DEFAULT FALSE,
      sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      read_at DATETIME,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_user (user_id, user_type)
    );
  `);

  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS chat_messages (
      id INT PRIMARY KEY AUTO_INCREMENT,
      sender_id INT NOT NULL,
      sender_type ENUM('Student', 'Faculty', 'Parent') NOT NULL,
      receiver_id INT NOT NULL,
      receiver_type ENUM('Student', 'Faculty', 'Parent') NOT NULL,
      message_text TEXT NOT NULL,
      attachment_url VARCHAR(255),
      is_read BOOLEAN DEFAULT FALSE,
      sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      read_at DATETIME,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_sender (sender_id, sender_type),
      INDEX idx_receiver (receiver_id, receiver_type)
    );
  `);

  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS portal_activity_log (
      id INT PRIMARY KEY AUTO_INCREMENT,
      user_id INT NOT NULL,
      user_type ENUM('Student', 'Parent') NOT NULL,
      activity_type ENUM('Login', 'View', 'Download', 'Payment') NOT NULL,
      module VARCHAR(50),
      ip_address VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log('✅ Portal tables created successfully');
}

async function down() {
  await sequelize.query('DROP TABLE IF EXISTS portal_activity_log');
  await sequelize.query('DROP TABLE IF EXISTS chat_messages');
  await sequelize.query('DROP TABLE IF EXISTS portal_notifications');
  await sequelize.query('DROP TABLE IF EXISTS parent_students');
  console.log('✅ Portal tables dropped successfully');
}

module.exports = { up, down };
