const sequelize = require('../config/database');

async function up() {
  // Update batches table with new fields
  await sequelize.query(`
    ALTER TABLE batches 
    ADD COLUMN IF NOT EXISTS course_package_id INT,
    ADD COLUMN IF NOT EXISTS faculty_id INT,
    ADD COLUMN IF NOT EXISTS timing VARCHAR(50),
    ADD COLUMN IF NOT EXISTS max_students INT DEFAULT 30,
    ADD COLUMN IF NOT EXISTS status ENUM('Upcoming', 'Active', 'Completed') DEFAULT 'Upcoming',
    ADD FOREIGN KEY IF NOT EXISTS (course_package_id) REFERENCES course_packages(id),
    ADD FOREIGN KEY IF NOT EXISTS (faculty_id) REFERENCES users(id);
  `);

  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS batch_students (
      id INT PRIMARY KEY AUTO_INCREMENT,
      batch_id INT NOT NULL,
      student_id INT NOT NULL,
      admission_id INT,
      joined_date DATE DEFAULT CURRENT_DATE,
      status ENUM('Active', 'Dropped') DEFAULT 'Active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (batch_id) REFERENCES batches(id) ON DELETE CASCADE,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
      FOREIGN KEY (admission_id) REFERENCES admissions(id),
      UNIQUE KEY unique_batch_student (batch_id, student_id)
    );
  `);

  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS timetable (
      id INT PRIMARY KEY AUTO_INCREMENT,
      batch_id INT NOT NULL,
      subject VARCHAR(100) NOT NULL,
      faculty_id INT,
      day_of_week ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL,
      start_time TIME NOT NULL,
      end_time TIME NOT NULL,
      room VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (batch_id) REFERENCES batches(id) ON DELETE CASCADE,
      FOREIGN KEY (faculty_id) REFERENCES users(id)
    );
  `);

  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS attendance_sessions (
      id INT PRIMARY KEY AUTO_INCREMENT,
      batch_id INT NOT NULL,
      subject VARCHAR(100) NOT NULL,
      faculty_id INT,
      date DATE NOT NULL,
      start_time TIME,
      end_time TIME,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (batch_id) REFERENCES batches(id) ON DELETE CASCADE,
      FOREIGN KEY (faculty_id) REFERENCES users(id),
      INDEX idx_batch_date (batch_id, date)
    );
  `);

  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS attendance (
      id INT PRIMARY KEY AUTO_INCREMENT,
      session_id INT NOT NULL,
      student_id INT NOT NULL,
      status ENUM('Present', 'Absent', 'Leave') DEFAULT 'Absent',
      marked_by ENUM('QR', 'Biometric', 'Manual') DEFAULT 'Manual',
      marked_at DATETIME,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (session_id) REFERENCES attendance_sessions(id) ON DELETE CASCADE,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
      UNIQUE KEY unique_session_student (session_id, student_id),
      INDEX idx_student (student_id)
    );
  `);

  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS qr_codes (
      id INT PRIMARY KEY AUTO_INCREMENT,
      student_id INT NOT NULL UNIQUE,
      qr_token VARCHAR(100) NOT NULL UNIQUE,
      qr_image_url VARCHAR(255),
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
      INDEX idx_token (qr_token),
      INDEX idx_student (student_id)
    );
  `);

  console.log('✅ Attendance and batch management tables created successfully');
}

async function down() {
  await sequelize.query('DROP TABLE IF EXISTS qr_codes');
  await sequelize.query('DROP TABLE IF EXISTS attendance');
  await sequelize.query('DROP TABLE IF EXISTS attendance_sessions');
  await sequelize.query('DROP TABLE IF EXISTS timetable');
  await sequelize.query('DROP TABLE IF EXISTS batch_students');
  console.log('✅ Attendance and batch management tables dropped successfully');
}

module.exports = { up, down };
