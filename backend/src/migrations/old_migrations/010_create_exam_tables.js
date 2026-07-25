const sequelize = require('../config/database');

async function up() {
  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS question_bank (
      id INT PRIMARY KEY AUTO_INCREMENT,
      branch_id INT NOT NULL,
      subject VARCHAR(100) NOT NULL,
      question_text TEXT NOT NULL,
      question_type ENUM('MCQ', 'TrueFalse', 'ShortAnswer') NOT NULL,
      option_a VARCHAR(255),
      option_b VARCHAR(255),
      option_c VARCHAR(255),
      option_d VARCHAR(255),
      correct_answer VARCHAR(255),
      marks INT DEFAULT 1,
      created_by INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (branch_id) REFERENCES branches(id),
      FOREIGN KEY (created_by) REFERENCES users(id)
    );
  `);

  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS exams (
      id INT PRIMARY KEY AUTO_INCREMENT,
      branch_id INT NOT NULL,
      batch_id INT,
      subject VARCHAR(100) NOT NULL,
      exam_name VARCHAR(200) NOT NULL,
      exam_type ENUM('Online', 'Offline') DEFAULT 'Online',
      total_marks INT NOT NULL,
      pass_marks INT NOT NULL,
      duration_minutes INT,
      start_datetime DATETIME,
      end_datetime DATETIME,
      instructions TEXT,
      status ENUM('Draft', 'Published', 'Completed') DEFAULT 'Draft',
      created_by INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (branch_id) REFERENCES branches(id),
      FOREIGN KEY (batch_id) REFERENCES batches(id),
      FOREIGN KEY (created_by) REFERENCES users(id)
    );
  `);

  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS exam_questions (
      id INT PRIMARY KEY AUTO_INCREMENT,
      exam_id INT NOT NULL,
      question_id INT NOT NULL,
      order_no INT NOT NULL,
      marks INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
      FOREIGN KEY (question_id) REFERENCES question_bank(id)
    );
  `);

  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS exam_attempts (
      id INT PRIMARY KEY AUTO_INCREMENT,
      exam_id INT NOT NULL,
      student_id INT NOT NULL,
      start_time DATETIME NOT NULL,
      end_time DATETIME,
      status ENUM('InProgress', 'Submitted') DEFAULT 'InProgress',
      total_marks_obtained DECIMAL(5, 2) DEFAULT 0,
      percentage DECIMAL(5, 2) DEFAULT 0,
      grade VARCHAR(2),
      result ENUM('Pass', 'Fail'),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
      FOREIGN KEY (student_id) REFERENCES students(id),
      UNIQUE KEY unique_exam_student (exam_id, student_id)
    );
  `);

  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS student_answers (
      id INT PRIMARY KEY AUTO_INCREMENT,
      attempt_id INT NOT NULL,
      question_id INT NOT NULL,
      selected_answer VARCHAR(255),
      is_correct BOOLEAN DEFAULT FALSE,
      marks_obtained DECIMAL(5, 2) DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (attempt_id) REFERENCES exam_attempts(id) ON DELETE CASCADE,
      FOREIGN KEY (question_id) REFERENCES question_bank(id)
    );
  `);

  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS certificates (
      id INT PRIMARY KEY AUTO_INCREMENT,
      student_id INT NOT NULL,
      course_package_id INT NOT NULL,
      certificate_no VARCHAR(50) UNIQUE NOT NULL,
      issue_date DATE NOT NULL,
      certificate_url VARCHAR(255),
      qr_token VARCHAR(100) UNIQUE,
      issued_by INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id),
      FOREIGN KEY (course_package_id) REFERENCES course_packages(id),
      FOREIGN KEY (issued_by) REFERENCES users(id),
      INDEX idx_qr_token (qr_token)
    );
  `);

  console.log('✅ Examination and certificate tables created successfully');
}

async function down() {
  await sequelize.query('DROP TABLE IF EXISTS certificates');
  await sequelize.query('DROP TABLE IF EXISTS student_answers');
  await sequelize.query('DROP TABLE IF EXISTS exam_attempts');
  await sequelize.query('DROP TABLE IF EXISTS exam_questions');
  await sequelize.query('DROP TABLE IF EXISTS exams');
  await sequelize.query('DROP TABLE IF EXISTS question_bank');
  console.log('✅ Examination and certificate tables dropped successfully');
}

module.exports = { up, down };
