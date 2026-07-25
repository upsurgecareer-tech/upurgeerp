-- Remaining Tables - Simple Version

USE upsurgeerp;

CREATE TABLE IF NOT EXISTS departments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  branch_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  head_id INT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

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
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
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
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

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
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
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
  UNIQUE KEY unique_video_student (video_id, student_id)
) ENGINE=InnoDB;

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
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
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
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS portal_notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  notification_type ENUM('Info','Warning','Success','Error') DEFAULT 'Info',
  is_read BOOLEAN DEFAULT false,
  link_url VARCHAR(500),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

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
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
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
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS qr_codes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  qr_token VARCHAR(255) UNIQUE NOT NULL,
  qr_image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;
