const sequelize = require('../config/database');

async function up() {
  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS students (
      id INT PRIMARY KEY AUTO_INCREMENT,
      branch_id INT NOT NULL,
      lead_id INT,
      admission_no VARCHAR(50) UNIQUE,
      name VARCHAR(100) NOT NULL,
      dob DATE,
      mobile VARCHAR(15) NOT NULL,
      email VARCHAR(100),
      address TEXT,
      parent_name VARCHAR(100),
      parent_mobile VARCHAR(15),
      photo_url VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (branch_id) REFERENCES branches(id),
      FOREIGN KEY (lead_id) REFERENCES leads(id),
      INDEX idx_mobile (mobile),
      INDEX idx_branch (branch_id)
    );
  `);

  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS course_packages (
      id INT PRIMARY KEY AUTO_INCREMENT,
      branch_id INT NOT NULL,
      name VARCHAR(200) NOT NULL,
      total_fee DECIMAL(10, 2) NOT NULL,
      duration_months INT,
      description TEXT,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (branch_id) REFERENCES branches(id)
    );
  `);

  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS batches (
      id INT PRIMARY KEY AUTO_INCREMENT,
      branch_id INT NOT NULL,
      name VARCHAR(100) NOT NULL,
      start_date DATE,
      end_date DATE,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (branch_id) REFERENCES branches(id)
    );
  `);

  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS admissions (
      id INT PRIMARY KEY AUTO_INCREMENT,
      student_id INT NOT NULL,
      course_package_id INT NOT NULL,
      batch_id INT,
      counsellor_id INT,
      admission_date DATE NOT NULL,
      total_fee DECIMAL(10, 2) NOT NULL,
      discount_amount DECIMAL(10, 2) DEFAULT 0,
      net_payable DECIMAL(10, 2) NOT NULL,
      status ENUM('Active', 'Inactive', 'Cancelled') DEFAULT 'Active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id),
      FOREIGN KEY (course_package_id) REFERENCES course_packages(id),
      FOREIGN KEY (batch_id) REFERENCES batches(id),
      FOREIGN KEY (counsellor_id) REFERENCES users(id),
      INDEX idx_student (student_id),
      INDEX idx_course (course_package_id)
    );
  `);

  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS fee_schedules (
      id INT PRIMARY KEY AUTO_INCREMENT,
      admission_id INT NOT NULL,
      installment_no INT NOT NULL,
      due_date DATE NOT NULL,
      amount DECIMAL(10, 2) NOT NULL,
      status ENUM('Pending', 'Paid', 'Overdue') DEFAULT 'Pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (admission_id) REFERENCES admissions(id) ON DELETE CASCADE,
      INDEX idx_admission (admission_id),
      INDEX idx_due_date (due_date),
      INDEX idx_status (status)
    );
  `);

  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS fee_payments (
      id INT PRIMARY KEY AUTO_INCREMENT,
      fee_schedule_id INT,
      admission_id INT NOT NULL,
      amount_paid DECIMAL(10, 2) NOT NULL,
      payment_mode ENUM('Cash', 'Online', 'Cheque', 'Card') DEFAULT 'Cash',
      payment_date DATE NOT NULL,
      receipt_no VARCHAR(50) UNIQUE,
      received_by INT,
      gateway_txn_id VARCHAR(100),
      remarks TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (fee_schedule_id) REFERENCES fee_schedules(id),
      FOREIGN KEY (admission_id) REFERENCES admissions(id),
      FOREIGN KEY (received_by) REFERENCES users(id),
      INDEX idx_admission (admission_id),
      INDEX idx_receipt (receipt_no)
    );
  `);

  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS discounts (
      id INT PRIMARY KEY AUTO_INCREMENT,
      admission_id INT NOT NULL,
      discount_type ENUM('Amount', 'Percentage') NOT NULL,
      discount_value DECIMAL(10, 2) NOT NULL,
      reason TEXT,
      approved_by INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (admission_id) REFERENCES admissions(id) ON DELETE CASCADE,
      FOREIGN KEY (approved_by) REFERENCES users(id)
    );
  `);

  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS student_documents (
      id INT PRIMARY KEY AUTO_INCREMENT,
      student_id INT NOT NULL,
      document_type VARCHAR(50) NOT NULL,
      file_url VARCHAR(255) NOT NULL,
      uploaded_by INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
      FOREIGN KEY (uploaded_by) REFERENCES users(id),
      INDEX idx_student (student_id)
    );
  `);

  console.log('✅ Admissions & Fee Management tables created successfully');
}

async function down() {
  await sequelize.query('DROP TABLE IF EXISTS student_documents');
  await sequelize.query('DROP TABLE IF EXISTS discounts');
  await sequelize.query('DROP TABLE IF EXISTS fee_payments');
  await sequelize.query('DROP TABLE IF EXISTS fee_schedules');
  await sequelize.query('DROP TABLE IF EXISTS admissions');
  await sequelize.query('DROP TABLE IF EXISTS batches');
  await sequelize.query('DROP TABLE IF EXISTS course_packages');
  await sequelize.query('DROP TABLE IF EXISTS students');
  console.log('✅ Admissions & Fee Management tables dropped successfully');
}

module.exports = { up, down };
