const sequelize = require('../config/database');

async function up() {
  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS lms_videos (
      id INT PRIMARY KEY AUTO_INCREMENT,
      branch_id INT NOT NULL,
      batch_id INT,
      subject VARCHAR(100) NOT NULL,
      title VARCHAR(200) NOT NULL,
      description TEXT,
      video_url VARCHAR(255) NOT NULL,
      thumbnail_url VARCHAR(255),
      duration_seconds INT,
      uploaded_by INT,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (branch_id) REFERENCES branches(id),
      FOREIGN KEY (batch_id) REFERENCES batches(id),
      FOREIGN KEY (uploaded_by) REFERENCES users(id)
    );
  `);

  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS live_classes (
      id INT PRIMARY KEY AUTO_INCREMENT,
      branch_id INT NOT NULL,
      batch_id INT NOT NULL,
      faculty_id INT NOT NULL,
      title VARCHAR(200) NOT NULL,
      scheduled_at DATETIME NOT NULL,
      duration_minutes INT NOT NULL,
      platform VARCHAR(50) DEFAULT 'Zoom',
      meeting_link VARCHAR(500),
      meeting_id VARCHAR(100),
      status ENUM('Scheduled', 'Live', 'Completed') DEFAULT 'Scheduled',
      recording_url VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (branch_id) REFERENCES branches(id),
      FOREIGN KEY (batch_id) REFERENCES batches(id),
      FOREIGN KEY (faculty_id) REFERENCES users(id)
    );
  `);

  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS assignments (
      id INT PRIMARY KEY AUTO_INCREMENT,
      batch_id INT NOT NULL,
      faculty_id INT NOT NULL,
      title VARCHAR(200) NOT NULL,
      description TEXT,
      due_date DATE NOT NULL,
      max_marks INT NOT NULL,
      attachment_url VARCHAR(255),
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (batch_id) REFERENCES batches(id),
      FOREIGN KEY (faculty_id) REFERENCES users(id)
    );
  `);

  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS assignment_submissions (
      id INT PRIMARY KEY AUTO_INCREMENT,
      assignment_id INT NOT NULL,
      student_id INT NOT NULL,
      submission_text TEXT,
      file_url VARCHAR(255),
      submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      marks_obtained INT,
      feedback TEXT,
      graded_by INT,
      graded_at DATETIME,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
      FOREIGN KEY (student_id) REFERENCES students(id),
      FOREIGN KEY (graded_by) REFERENCES users(id),
      UNIQUE KEY unique_assignment_student (assignment_id, student_id)
    );
  `);

  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS lms_materials (
      id INT PRIMARY KEY AUTO_INCREMENT,
      batch_id INT NOT NULL,
      subject VARCHAR(100) NOT NULL,
      title VARCHAR(200) NOT NULL,
      file_url VARCHAR(255) NOT NULL,
      file_type VARCHAR(50),
      uploaded_by INT,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (batch_id) REFERENCES batches(id),
      FOREIGN KEY (uploaded_by) REFERENCES users(id)
    );
  `);

  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS notice_board (
      id INT PRIMARY KEY AUTO_INCREMENT,
      branch_id INT NOT NULL,
      batch_id INT,
      title VARCHAR(200) NOT NULL,
      content TEXT NOT NULL,
      posted_by INT NOT NULL,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (branch_id) REFERENCES branches(id),
      FOREIGN KEY (batch_id) REFERENCES batches(id),
      FOREIGN KEY (posted_by) REFERENCES users(id)
    );
  `);

  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS ebooks (
      id INT PRIMARY KEY AUTO_INCREMENT,
      branch_id INT NOT NULL,
      batch_id INT,
      title VARCHAR(200) NOT NULL,
      author VARCHAR(100),
      file_url VARCHAR(255) NOT NULL,
      cover_image_url VARCHAR(255),
      uploaded_by INT,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (branch_id) REFERENCES branches(id),
      FOREIGN KEY (batch_id) REFERENCES batches(id),
      FOREIGN KEY (uploaded_by) REFERENCES users(id)
    );
  `);

  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS video_watch_progress (
      id INT PRIMARY KEY AUTO_INCREMENT,
      video_id INT NOT NULL,
      student_id INT NOT NULL,
      watched_seconds INT DEFAULT 0,
      is_completed BOOLEAN DEFAULT FALSE,
      last_watched_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (video_id) REFERENCES lms_videos(id) ON DELETE CASCADE,
      FOREIGN KEY (student_id) REFERENCES students(id),
      UNIQUE KEY unique_video_student (video_id, student_id)
    );
  `);

  console.log('✅ LMS tables created successfully');
}

async function down() {
  await sequelize.query('DROP TABLE IF EXISTS video_watch_progress');
  await sequelize.query('DROP TABLE IF EXISTS ebooks');
  await sequelize.query('DROP TABLE IF EXISTS notice_board');
  await sequelize.query('DROP TABLE IF EXISTS lms_materials');
  await sequelize.query('DROP TABLE IF EXISTS assignment_submissions');
  await sequelize.query('DROP TABLE IF EXISTS assignments');
  await sequelize.query('DROP TABLE IF EXISTS live_classes');
  await sequelize.query('DROP TABLE IF EXISTS lms_videos');
  console.log('✅ LMS tables dropped successfully');
}

module.exports = { up, down };
