-- UpsurgeERP - Missing Tables Creation Script
-- Run this to complete all 12 phases

USE upsurgeerp;

-- =====================================================
-- PHASE 5: Staff Management Tables
-- =====================================================

CREATE TABLE IF NOT EXISTS departments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  branch_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  head_id INT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (branch_id) REFERENCES branches(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS salary_structures (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  basic_salary DECIMAL(10,2) NOT NULL,
  allowances JSON,
  deductions JSON,
  total_salary DECIMAL(10,2) NOT NULL,
  effective_from DATE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS payroll (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  month VARCHAR(7) NOT NULL,
  basic_salary DECIMAL(10,2) NOT NULL,
  allowances DECIMAL(10,2) DEFAULT 0,
  deductions DECIMAL(10,2) DEFAULT 0,
  net_salary DECIMAL(10,2) NOT NULL,
  payment_date DATE,
  payment_mode VARCHAR(50),
  status ENUM('Pending','Paid','Cancelled') DEFAULT 'Pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS staff_attendance (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  date DATE NOT NULL,
  check_in TIME,
  check_out TIME,
  status ENUM('Present','Absent','Leave','Half Day') DEFAULT 'Present',
  remarks TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  UNIQUE KEY unique_user_date (user_id, date)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS timesheets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  date DATE NOT NULL,
  hours_worked DECIMAL(5,2) NOT NULL,
  task_description TEXT,
  project VARCHAR(100),
  status ENUM('Draft','Submitted','Approved','Rejected') DEFAULT 'Draft',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB;

-- =====================================================
-- PHASE 6: Examination & Certificates Tables
-- =====================================================

CREATE TABLE IF NOT EXISTS exams (
  id INT AUTO_INCREMENT PRIMARY KEY,
  branch_id INT NOT NULL,
  batch_id INT,
  course_package_id INT,
  name VARCHAR(200) NOT NULL,
  exam_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  duration_minutes INT NOT NULL,
  total_marks INT NOT NULL,
  passing_marks INT NOT NULL,
  exam_type ENUM('Theory','Practical','Online','Assignment') DEFAULT 'Theory',
  status ENUM('Scheduled','Ongoing','Completed','Cancelled') DEFAULT 'Scheduled',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (branch_id) REFERENCES branches(id),
  FOREIGN KEY (batch_id) REFERENCES batches(id),
  FOREIGN KEY (course_package_id) REFERENCES course_packages(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS exam_attempts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  exam_id INT NOT NULL,
  student_id INT NOT NULL,
  marks_obtained DECIMAL(5,2),
  percentage DECIMAL(5,2),
  grade VARCHAR(10),
  result ENUM('Pass','Fail','Absent') DEFAULT 'Absent',
  attempt_number INT DEFAULT 1,
  submitted_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (exam_id) REFERENCES exams(id),
  FOREIGN KEY (student_id) REFERENCES students(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS question_bank (
  id INT AUTO_INCREMENT PRIMARY KEY,
  branch_id INT NOT NULL,
  course_package_id INT,
  subject VARCHAR(100) NOT NULL,
  question_text TEXT NOT NULL,
  question_type ENUM('MCQ','True/False','Short Answer','Long Answer') NOT NULL,
  options JSON,
  correct_answer TEXT,
  marks INT DEFAULT 1,
  difficulty ENUM('Easy','Medium','Hard') DEFAULT 'Medium',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (branch_id) REFERENCES branches(id),
  FOREIGN KEY (course_package_id) REFERENCES course_packages(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS certificates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  course_package_id INT,
  certificate_type ENUM('Course Completion','Merit','Participation','Achievement') NOT NULL,
  certificate_number VARCHAR(50) UNIQUE NOT NULL,
  issue_date DATE NOT NULL,
  certificate_url VARCHAR(255),
  verification_code VARCHAR(50) UNIQUE,
  issued_by INT,
  status ENUM('Active','Revoked') DEFAULT 'Active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (course_package_id) REFERENCES course_packages(id),
  FOREIGN KEY (issued_by) REFERENCES users(id)
) ENGINE=InnoDB;

-- =====================================================
-- PHASE 7: e-Learning / LMS Tables
-- =====================================================

CREATE TABLE IF NOT EXISTS lms_videos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  branch_id INT NOT NULL,
  course_package_id INT,
  batch_id INT,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  video_url VARCHAR(500) NOT NULL,
  thumbnail_url VARCHAR(500),
  duration_seconds INT,
  order_sequence INT DEFAULT 0,
  is_free BOOLEAN DEFAULT false,
  uploaded_by INT,
  status ENUM('Draft','Published','Archived') DEFAULT 'Draft',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (branch_id) REFERENCES branches(id),
  FOREIGN KEY (course_package_id) REFERENCES course_packages(id),
  FOREIGN KEY (batch_id) REFERENCES batches(id),
  FOREIGN KEY (uploaded_by) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS video_watch_progress (
  id INT AUTO_INCREMENT PRIMARY KEY,
  video_id INT NOT NULL,
  student_id INT NOT NULL,
  watched_seconds INT DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  last_watched_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (video_id) REFERENCES lms_videos(id),
  FOREIGN KEY (student_id) REFERENCES students(id),
  UNIQUE KEY unique_video_student (video_id, student_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS assignments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  branch_id INT NOT NULL,
  batch_id INT,
  course_package_id INT,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  attachment_url VARCHAR(500),
  due_date DATETIME,
  total_marks INT DEFAULT 100,
  created_by INT,
  status ENUM('Active','Closed') DEFAULT 'Active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (branch_id) REFERENCES branches(id),
  FOREIGN KEY (batch_id) REFERENCES batches(id),
  FOREIGN KEY (course_package_id) REFERENCES course_packages(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS assignment_submissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  assignment_id INT NOT NULL,
  student_id INT NOT NULL,
  submission_text TEXT,
  attachment_url VARCHAR(500),
  submitted_at DATETIME,
  marks_obtained INT,
  feedback TEXT,
  graded_by INT,
  graded_at DATETIME,
  status ENUM('Pending','Submitted','Graded','Late') DEFAULT 'Pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (assignment_id) REFERENCES assignments(id),
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (graded_by) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS live_classes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  branch_id INT NOT NULL,
  batch_id INT,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  meeting_url VARCHAR(500),
  meeting_id VARCHAR(100),
  meeting_password VARCHAR(100),
  scheduled_at DATETIME NOT NULL,
  duration_minutes INT DEFAULT 60,
  host_id INT,
  status ENUM('Scheduled','Live','Completed','Cancelled') DEFAULT 'Scheduled',
  recording_url VARCHAR(500),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (branch_id) REFERENCES branches(id),
  FOREIGN KEY (batch_id) REFERENCES batches(id),
  FOREIGN KEY (host_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS notices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  branch_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  target_audience ENUM('All','Students','Staff','Parents','Specific') DEFAULT 'All',
  priority ENUM('Low','Medium','High','Urgent') DEFAULT 'Medium',
  publish_date DATE NOT NULL,
  expiry_date DATE,
  attachment_url VARCHAR(500),
  created_by INT,
  status ENUM('Draft','Published','Expired') DEFAULT 'Draft',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (branch_id) REFERENCES branches(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
) ENGINE=InnoDB;

-- =====================================================
-- PHASE 8: Student & Parent Portal Tables
-- =====================================================

CREATE TABLE IF NOT EXISTS portal_notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  notification_type ENUM('Info','Warning','Success','Error') DEFAULT 'Info',
  is_read BOOLEAN DEFAULT false,
  link_url VARCHAR(500),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS chat_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sender_id INT NOT NULL,
  receiver_id INT NOT NULL,
  message TEXT NOT NULL,
  attachment_url VARCHAR(500),
  is_read BOOLEAN DEFAULT false,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sender_id) REFERENCES users(id),
  FOREIGN KEY (receiver_id) REFERENCES users(id)
) ENGINE=InnoDB;

-- =====================================================
-- PHASE 9: Library & Inventory Tables
-- =====================================================

CREATE TABLE IF NOT EXISTS library (
  id INT AUTO_INCREMENT PRIMARY KEY,
  branch_id INT NOT NULL,
  book_title VARCHAR(200) NOT NULL,
  author VARCHAR(100),
  isbn VARCHAR(50),
  category VARCHAR(100),
  total_copies INT DEFAULT 1,
  available_copies INT DEFAULT 1,
  rack_number VARCHAR(50),
  publisher VARCHAR(100),
  published_year INT,
  price DECIMAL(10,2),
  status ENUM('Available','Issued','Damaged','Lost') DEFAULT 'Available',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (branch_id) REFERENCES branches(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS book_issues (
  id INT AUTO_INCREMENT PRIMARY KEY,
  book_id INT NOT NULL,
  student_id INT NOT NULL,
  issue_date DATE NOT NULL,
  due_date DATE NOT NULL,
  return_date DATE,
  fine_amount DECIMAL(10,2) DEFAULT 0,
  status ENUM('Issued','Returned','Overdue') DEFAULT 'Issued',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (book_id) REFERENCES library(id),
  FOREIGN KEY (student_id) REFERENCES students(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS inventory (
  id INT AUTO_INCREMENT PRIMARY KEY,
  branch_id INT NOT NULL,
  item_name VARCHAR(200) NOT NULL,
  item_code VARCHAR(50) UNIQUE,
  category VARCHAR(100),
  quantity INT DEFAULT 0,
  unit VARCHAR(50),
  price_per_unit DECIMAL(10,2),
  total_value DECIMAL(10,2),
  reorder_level INT DEFAULT 10,
  supplier_name VARCHAR(100),
  location VARCHAR(100),
  status ENUM('In Stock','Low Stock','Out of Stock') DEFAULT 'In Stock',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (branch_id) REFERENCES branches(id)
) ENGINE=InnoDB;

-- =====================================================
-- PHASE 10: Communication & Notifications Tables
-- =====================================================

CREATE TABLE IF NOT EXISTS communications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  branch_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  communication_type ENUM('Email','SMS','WhatsApp','Push') NOT NULL,
  target_audience ENUM('All','Students','Staff','Parents','Specific') DEFAULT 'All',
  target_ids JSON,
  scheduled_at DATETIME,
  sent_at DATETIME,
  status ENUM('Draft','Scheduled','Sent','Failed') DEFAULT 'Draft',
  created_by INT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (branch_id) REFERENCES branches(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS communication_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  communication_id INT NOT NULL,
  recipient_id INT NOT NULL,
  recipient_type ENUM('Student','Staff','Parent') NOT NULL,
  recipient_contact VARCHAR(100),
  status ENUM('Pending','Sent','Delivered','Failed','Bounced') DEFAULT 'Pending',
  sent_at DATETIME,
  delivered_at DATETIME,
  error_message TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (communication_id) REFERENCES communications(id)
) ENGINE=InnoDB;

-- =====================================================
-- ADDITIONAL TABLES
-- =====================================================

CREATE TABLE IF NOT EXISTS qr_codes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  qr_token VARCHAR(255) UNIQUE NOT NULL,
  qr_image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id)
) ENGINE=InnoDB;

-- =====================================================
-- ADD MISSING COLUMNS TO EXISTING TABLES
-- =====================================================

-- Add gender and status to students table if not exists
ALTER TABLE students 
ADD COLUMN IF NOT EXISTS gender ENUM('Male','Female','Other') NULL AFTER email,
ADD COLUMN IF NOT EXISTS status ENUM('Active','Inactive','Graduated','Dropped') DEFAULT 'Active' AFTER gender;

-- Add organization_id to users table if not exists
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS organization_id INT NULL AFTER id;

-- =====================================================
-- CREATE INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX idx_departments_branch ON departments(branch_id);
CREATE INDEX idx_salary_structures_user ON salary_structures(user_id);
CREATE INDEX idx_payroll_user_month ON payroll(user_id, month);
CREATE INDEX idx_staff_attendance_user_date ON staff_attendance(user_id, date);
CREATE INDEX idx_exams_branch_date ON exams(branch_id, exam_date);
CREATE INDEX idx_exam_attempts_exam_student ON exam_attempts(exam_id, student_id);
CREATE INDEX idx_lms_videos_branch_course ON lms_videos(branch_id, course_package_id);
CREATE INDEX idx_assignments_branch_batch ON assignments(branch_id, batch_id);
CREATE INDEX idx_notices_branch_publish ON notices(branch_id, publish_date);
CREATE INDEX idx_library_branch_status ON library(branch_id, status);
CREATE INDEX idx_inventory_branch_status ON inventory(branch_id, status);
CREATE INDEX idx_communications_branch_status ON communications(branch_id, status);

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

SELECT '✅ All missing tables created successfully!' AS Status;
SELECT COUNT(*) AS TotalTables FROM information_schema.tables WHERE table_schema = 'upsurgeerp';
