const sequelize = require('../config/database');

async function up() {
  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS employees (
      id INT PRIMARY KEY AUTO_INCREMENT,
      user_id INT NOT NULL,
      employee_code VARCHAR(50) UNIQUE NOT NULL,
      department_id INT,
      designation VARCHAR(100) NOT NULL,
      joining_date DATE NOT NULL,
      employment_type ENUM('Full-Time', 'Part-Time', 'Contract', 'Intern') DEFAULT 'Full-Time',
      date_of_birth DATE,
      gender ENUM('Male', 'Female', 'Other'),
      blood_group VARCHAR(10),
      address TEXT,
      emergency_contact_name VARCHAR(100),
      emergency_contact_phone VARCHAR(15),
      bank_name VARCHAR(100),
      bank_account_number VARCHAR(50),
      bank_ifsc VARCHAR(20),
      pan_number VARCHAR(20),
      aadhar_number VARCHAR(20),
      status ENUM('Active', 'Inactive', 'Resigned', 'Terminated') DEFAULT 'Active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
    );
  `);

  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS leaves (
      id INT PRIMARY KEY AUTO_INCREMENT,
      employee_id INT NOT NULL,
      leave_type ENUM('Sick', 'Casual', 'Earned', 'Maternity', 'Paternity', 'Unpaid') NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      total_days INT NOT NULL,
      reason TEXT NOT NULL,
      status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
      approved_by INT,
      approved_at TIMESTAMP NULL,
      remarks TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
      FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
    );
  `);

  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS leave_balances (
      id INT PRIMARY KEY AUTO_INCREMENT,
      employee_id INT NOT NULL,
      year INT NOT NULL,
      sick_leave INT DEFAULT 12,
      casual_leave INT DEFAULT 12,
      earned_leave INT DEFAULT 15,
      sick_leave_used INT DEFAULT 0,
      casual_leave_used INT DEFAULT 0,
      earned_leave_used INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
      UNIQUE KEY unique_employee_year (employee_id, year)
    );
  `);

  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS performances (
      id INT PRIMARY KEY AUTO_INCREMENT,
      employee_id INT NOT NULL,
      review_period VARCHAR(50) NOT NULL,
      reviewer_id INT NOT NULL,
      technical_skills INT DEFAULT 0,
      communication INT DEFAULT 0,
      teamwork INT DEFAULT 0,
      punctuality INT DEFAULT 0,
      quality_of_work INT DEFAULT 0,
      overall_rating DECIMAL(3,2) DEFAULT 0,
      strengths TEXT,
      areas_of_improvement TEXT,
      goals TEXT,
      comments TEXT,
      status ENUM('Draft', 'Submitted', 'Acknowledged') DEFAULT 'Draft',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
      FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS employee_documents (
      id INT PRIMARY KEY AUTO_INCREMENT,
      employee_id INT NOT NULL,
      document_type ENUM('Resume', 'ID Proof', 'Address Proof', 'Education', 'Experience', 'Other') NOT NULL,
      document_name VARCHAR(200) NOT NULL,
      file_path VARCHAR(500) NOT NULL,
      uploaded_by INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
      FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
    );
  `);

  console.log('✅ HRMS tables created successfully');
}

async function down() {
  await sequelize.query('DROP TABLE IF EXISTS employee_documents');
  await sequelize.query('DROP TABLE IF EXISTS performances');
  await sequelize.query('DROP TABLE IF EXISTS leave_balances');
  await sequelize.query('DROP TABLE IF EXISTS leaves');
  await sequelize.query('DROP TABLE IF EXISTS employees');
  console.log('✅ HRMS tables dropped successfully');
}

module.exports = { up, down };
