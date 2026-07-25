const sequelize = require('../config/database');

async function up() {
  // Add department_id to users table
  await sequelize.query(`
    ALTER TABLE users 
    ADD COLUMN IF NOT EXISTS department_id INT,
    ADD COLUMN IF NOT EXISTS photo_url VARCHAR(255),
    ADD COLUMN IF NOT EXISTS dob DATE,
    ADD COLUMN IF NOT EXISTS address TEXT,
    ADD COLUMN IF NOT EXISTS joining_date DATE,
    ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
  `);

  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS departments (
      id INT PRIMARY KEY AUTO_INCREMENT,
      branch_id INT NOT NULL,
      name VARCHAR(100) NOT NULL,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (branch_id) REFERENCES branches(id)
    );
  `);

  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS salary_structures (
      id INT PRIMARY KEY AUTO_INCREMENT,
      user_id INT NOT NULL,
      basic_salary DECIMAL(10, 2) NOT NULL,
      hra DECIMAL(10, 2) DEFAULT 0,
      other_allowances DECIMAL(10, 2) DEFAULT 0,
      pf_deduction DECIMAL(10, 2) DEFAULT 0,
      tds_deduction DECIMAL(10, 2) DEFAULT 0,
      other_deductions DECIMAL(10, 2) DEFAULT 0,
      effective_from DATE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS payroll (
      id INT PRIMARY KEY AUTO_INCREMENT,
      user_id INT NOT NULL,
      month INT NOT NULL,
      year INT NOT NULL,
      working_days INT NOT NULL,
      present_days INT NOT NULL,
      basic_paid DECIMAL(10, 2) NOT NULL,
      total_allowances DECIMAL(10, 2) DEFAULT 0,
      total_deductions DECIMAL(10, 2) DEFAULT 0,
      net_salary DECIMAL(10, 2) NOT NULL,
      status ENUM('Draft', 'Approved', 'Paid') DEFAULT 'Draft',
      payslip_url VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE KEY unique_user_month_year (user_id, month, year)
    );
  `);

  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS staff_attendance (
      id INT PRIMARY KEY AUTO_INCREMENT,
      user_id INT NOT NULL,
      date DATE NOT NULL,
      in_time TIME,
      out_time TIME,
      status ENUM('Present', 'Absent', 'Leave', 'Half-Day') DEFAULT 'Absent',
      marked_by ENUM('Biometric', 'Manual') DEFAULT 'Manual',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE KEY unique_user_date (user_id, date)
    );
  `);

  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS timesheets (
      id INT PRIMARY KEY AUTO_INCREMENT,
      user_id INT NOT NULL,
      batch_id INT,
      subject VARCHAR(100) NOT NULL,
      date DATE NOT NULL,
      start_time TIME NOT NULL,
      end_time TIME NOT NULL,
      topics_covered TEXT,
      hours DECIMAL(4, 2) NOT NULL,
      status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (batch_id) REFERENCES batches(id),
      INDEX idx_user_date (user_id, date)
    );
  `);

  console.log('✅ Staff management tables created successfully');
}

async function down() {
  await sequelize.query('DROP TABLE IF EXISTS timesheets');
  await sequelize.query('DROP TABLE IF EXISTS staff_attendance');
  await sequelize.query('DROP TABLE IF EXISTS payroll');
  await sequelize.query('DROP TABLE IF EXISTS salary_structures');
  await sequelize.query('DROP TABLE IF EXISTS departments');
  console.log('✅ Staff management tables dropped successfully');
}

module.exports = { up, down };
