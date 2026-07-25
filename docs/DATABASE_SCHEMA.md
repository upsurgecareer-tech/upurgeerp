# Database Schema - UpsurgeERP

## Overview
- **Database**: MySQL 8.0+
- **ORM**: Sequelize
- **Total Tables**: 40+
- **Migrations**: 15 files

---

## Core Tables

### organizations
Organization/institution details
```sql
- id (PK)
- name
- email
- phone
- address
- logo
- status (Active/Inactive)
- created_at, updated_at
```

### branches
Branch management for multi-location support
```sql
- id (PK)
- organization_id (FK)
- name
- code
- address
- phone
- is_active
- created_at, updated_at
```

### roles
User roles for RBAC
```sql
- id (PK)
- name (Admin/Manager/Staff/Student/Parent)
- permissions (JSON)
- created_at, updated_at
```

### users
User accounts
```sql
- id (PK)
- organization_id (FK)
- branch_id (FK)
- role_id (FK)
- first_name, last_name
- email (UNIQUE)
- password (hashed)
- phone
- status (Active/Inactive/Suspended)
- last_login
- created_at, updated_at
```

### audit_logs
Activity tracking
```sql
- id (PK)
- user_id (FK)
- action
- entity_type
- entity_id
- old_values (JSON)
- new_values (JSON)
- ip_address
- created_at
```

---

## CRM Tables

### lead_sources
Lead source configuration
```sql
- id (PK)
- organization_id (FK)
- name (Website/Referral/Walk-in/etc)
- is_active
- created_at, updated_at
```

### lead_stages
Lead pipeline stages
```sql
- id (PK)
- organization_id (FK)
- name (New/Contacted/Qualified/etc)
- order
- is_active
- created_at, updated_at
```

### leads
Lead management
```sql
- id (PK)
- organization_id (FK)
- branch_id (FK)
- source_id (FK)
- stage_id (FK)
- first_name, last_name
- email, phone
- course_interest
- assigned_to (FK users)
- status (New/Active/Converted/Lost)
- created_at, updated_at
```

### follow_ups
Follow-up tracking
```sql
- id (PK)
- lead_id (FK)
- follow_up_date
- notes
- next_action
- status (Pending/Completed)
- created_by (FK users)
- created_at, updated_at
```

---

## Student Tables

### students
Student information
```sql
- id (PK)
- organization_id (FK)
- branch_id (FK)
- first_name, last_name
- email, phone
- date_of_birth
- gender
- address
- guardian_name, guardian_phone
- status (Active/Inactive/Graduated)
- created_at, updated_at
```

### admissions
Admission records
```sql
- id (PK)
- organization_id (FK)
- student_id (FK)
- course_package_id (FK)
- admission_number (UNIQUE, ADM{branch}{00001})
- admission_date
- total_fees
- discount
- net_fees
- status (Pending/Approved/Rejected)
- created_at, updated_at
```

### course_packages
Course offerings
```sql
- id (PK)
- organization_id (FK)
- name
- description
- duration_months
- fees
- is_active
- created_at, updated_at
```

### fee_schedules
Fee installment schedules
```sql
- id (PK)
- admission_id (FK)
- installment_number
- due_date
- amount
- status (Pending/Paid/Overdue)
- created_at, updated_at
```

### fee_payments
Payment records
```sql
- id (PK)
- organization_id (FK)
- student_id (FK)
- admission_id (FK)
- receipt_number (UNIQUE, RCP000001)
- amount
- payment_mode (Cash/Card/Online/Cheque)
- payment_date
- transaction_id
- status (Pending/Completed/Failed)
- created_at, updated_at
```

### discounts
Discount management
```sql
- id (PK)
- organization_id (FK)
- name
- type (Percentage/Fixed)
- value
- is_active
- created_at, updated_at
```

---

## Batch & Attendance Tables

### batches
Batch/class management
```sql
- id (PK)
- organization_id (FK)
- branch_id (FK)
- course_id (FK)
- name
- start_date, end_date
- capacity
- status (Active/Completed/Cancelled)
- created_at, updated_at
```

### batch_students
Student-batch enrollment
```sql
- id (PK)
- batch_id (FK)
- student_id (FK)
- enrollment_date
- status (Active/Completed/Dropped)
- created_at, updated_at
```

### timetables
Class scheduling
```sql
- id (PK)
- batch_id (FK)
- day_of_week
- start_time, end_time
- subject
- instructor_id (FK users)
- created_at, updated_at
```

### attendance_sessions
Attendance sessions
```sql
- id (PK)
- organization_id (FK)
- batch_id (FK)
- date
- start_time, end_time
- created_by (FK users)
- created_at, updated_at
```

### attendance
Attendance records
```sql
- id (PK)
- organization_id (FK)
- session_id (FK)
- student_id (FK)
- batch_id (FK)
- date
- status (Present/Absent/Late/Leave)
- marked_by (FK users)
- created_at, updated_at
```

### qr_codes
QR code tokens for attendance
```sql
- id (PK)
- session_id (FK)
- token (UUID)
- expires_at
- is_active
- created_at, updated_at
```

---

## Staff & Payroll Tables

### departments
Department structure
```sql
- id (PK)
- organization_id (FK)
- name (Academic/Admin/IT/HR/Finance)
- is_active
- created_at, updated_at
```

### salary_structures
Salary components
```sql
- id (PK)
- organization_id (FK)
- user_id (FK)
- basic_salary
- allowances (JSON)
- deductions (JSON)
- effective_from
- created_at, updated_at
```

### payroll
Payroll processing
```sql
- id (PK)
- organization_id (FK)
- user_id (FK)
- month
- basic_salary
- allowances, deductions
- gross_salary, net_salary
- status (Draft/Processed/Paid)
- created_at, updated_at
```

### staff_attendance
Staff attendance tracking
```sql
- id (PK)
- organization_id (FK)
- user_id (FK)
- date
- check_in, check_out
- status (Present/Absent/Leave/Holiday)
- created_at, updated_at
```

---

## Exam & Certificate Tables

### question_bank
Question repository
```sql
- id (PK)
- organization_id (FK)
- course_id (FK)
- question_text
- question_type (MCQ/TrueFalse/ShortAnswer)
- options (JSON)
- correct_answer
- marks
- difficulty (Easy/Medium/Hard)
- created_at, updated_at
```

### exams
Exam scheduling
```sql
- id (PK)
- organization_id (FK)
- course_id (FK)
- title
- exam_date
- duration (minutes)
- total_marks, pass_marks
- status (Scheduled/Ongoing/Completed)
- created_at, updated_at
```

### exam_attempts
Student exam attempts
```sql
- id (PK)
- exam_id (FK)
- student_id (FK)
- start_time, end_time
- answers (JSON)
- marks_obtained
- percentage
- grade (A/B/C/D/F)
- status (In Progress/Submitted/Evaluated)
- created_at, updated_at
```

### certificates
Certificate generation
```sql
- id (PK)
- organization_id (FK)
- student_id (FK)
- course_id (FK)
- certificate_number (UNIQUE, CERT000001)
- issue_date
- grade
- certificate_url
- created_at, updated_at
```

---

## LMS Tables

### lms_videos
Video lectures
```sql
- id (PK)
- organization_id (FK)
- course_id (FK)
- title, description
- video_url
- duration (seconds)
- order
- is_published
- created_at, updated_at
```

### live_classes
Live class scheduling
```sql
- id (PK)
- organization_id (FK)
- course_id (FK)
- title
- scheduled_at
- duration (minutes)
- meeting_link
- platform (Zoom/Jitsi/GoogleMeet)
- status (Scheduled/Live/Completed)
- created_at, updated_at
```

### assignments
Assignment management
```sql
- id (PK)
- organization_id (FK)
- course_id (FK)
- title, description
- due_date
- max_marks
- attachment_url
- created_at, updated_at
```

### assignment_submissions
Student submissions
```sql
- id (PK)
- assignment_id (FK)
- student_id (FK)
- submission_url
- submitted_at
- marks_obtained
- feedback
- status (Pending/Submitted/Graded)
- created_at, updated_at
```

### video_watch_progress
Video progress tracking
```sql
- id (PK)
- video_id (FK)
- student_id (FK)
- watched_duration (seconds)
- completed
- last_watched_at
- created_at, updated_at
```

---

## Portal & Chat Tables

### parent_students
Parent-student relationships
```sql
- id (PK)
- parent_user_id (FK users)
- student_id (FK students)
- relationship (Father/Mother/Guardian)
- created_at, updated_at
```

### portal_notifications
Portal notifications
```sql
- id (PK)
- organization_id (FK)
- user_id (FK)
- type (Fee/Exam/Notice/Chat/Assignment/Attendance)
- title, message
- is_read
- created_at, updated_at
```

### chat_messages
Chat system
```sql
- id (PK)
- organization_id (FK)
- sender_id (FK users)
- receiver_id (FK users)
- message
- is_read
- created_at, updated_at
```

---

## Accounting Tables

### account_heads
Chart of accounts
```sql
- id (PK)
- organization_id (FK)
- name
- code (UNIQUE)
- type (Asset/Liability/Income/Expense/Equity)
- parent_id (FK account_heads)
- is_active
- created_at, updated_at
```

### transactions
Financial transactions
```sql
- id (PK)
- organization_id (FK)
- transaction_number (UNIQUE, TXN000001)
- transaction_date
- type (Receipt/Payment/Journal/Contra)
- description
- total_amount
- created_by (FK users)
- created_at, updated_at
```

### transaction_entries
Double-entry records
```sql
- id (PK)
- transaction_id (FK)
- account_head_id (FK)
- debit, credit
- description
- created_at, updated_at
```

### expenses
Expense tracking
```sql
- id (PK)
- organization_id (FK)
- expense_number (UNIQUE, EXP000001)
- account_head_id (FK)
- expense_date
- amount
- payment_method (Cash/Bank/Cheque/Online)
- description
- receipt_file
- status (Pending/Approved/Rejected)
- approved_by (FK users)
- created_by (FK users)
- created_at, updated_at
```

---

## Library & Inventory Tables

### library_books
Book catalog
```sql
- id (PK)
- organization_id (FK)
- isbn
- title, author, publisher
- category
- quantity, available_quantity
- rack_number
- price, purchase_date
- status (Available/Issued/Lost/Damaged)
- created_at, updated_at
```

### book_issues
Book issue/return
```sql
- id (PK)
- organization_id (FK)
- book_id (FK)
- student_id (FK)
- issue_date, due_date, return_date
- fine_amount
- status (Issued/Returned/Overdue)
- issued_by (FK users)
- created_at, updated_at
```

### inventory_items
Inventory management
```sql
- id (PK)
- organization_id (FK)
- item_code (UNIQUE)
- name
- category (Stationery/Electronics/Furniture/Lab Equipment/Sports/Other)
- quantity
- unit
- min_stock_level
- unit_price
- location
- status (In Stock/Low Stock/Out of Stock)
- created_at, updated_at
```

### inventory_transactions
Stock movements
```sql
- id (PK)
- organization_id (FK)
- item_id (FK)
- transaction_type (Purchase/Issue/Return/Adjustment)
- quantity
- transaction_date
- reference_type, reference_id
- remarks
- created_by (FK users)
- created_at, updated_at
```

---

## Communication Tables

### email_templates
Email templates
```sql
- id (PK)
- organization_id (FK)
- name
- subject, body
- type (Admission/Fee/Exam/Attendance/General)
- variables (JSON)
- is_active
- created_at, updated_at
```

### sms_templates
SMS templates
```sql
- id (PK)
- organization_id (FK)
- name, message
- type (Admission/Fee/Exam/Attendance/General)
- variables (JSON)
- is_active
- created_at, updated_at
```

### communication_logs
Communication tracking
```sql
- id (PK)
- organization_id (FK)
- type (Email/SMS/WhatsApp/Push)
- recipient_type (Student/Parent/Staff/Lead)
- recipient_id, recipient_contact
- subject, message
- status (Pending/Sent/Failed/Delivered/Read)
- sent_at
- error_message
- created_by (FK users)
- created_at, updated_at
```

### announcements
Announcement system
```sql
- id (PK)
- organization_id (FK)
- title, message
- type (General/Urgent/Event/Holiday/Exam)
- target_audience (All/Students/Parents/Staff/Specific)
- target_ids (JSON)
- publish_date, expiry_date
- is_published
- send_email, send_sms, send_push
- created_by (FK users)
- created_at, updated_at
```

### push_tokens
Push notification tokens
```sql
- id (PK)
- user_id (FK)
- token (UNIQUE)
- device_type (Android/iOS/Web)
- is_active
- created_at, updated_at
```

---

## Indexes

### Performance Indexes
```sql
CREATE INDEX idx_students_org_status ON students(organization_id, status);
CREATE INDEX idx_leads_org_stage ON leads(organization_id, stage);
CREATE INDEX idx_fee_payments_student ON fee_payments(student_id, status);
CREATE INDEX idx_attendance_batch_date ON attendance(batch_id, date);
CREATE INDEX idx_users_org_email ON users(organization_id, email);
CREATE INDEX idx_transactions_org_date ON transactions(organization_id, transaction_date);
```

---

## Relationships

### One-to-Many
- organizations → branches
- organizations → users
- roles → users
- batches → batch_students
- students → admissions
- students → fee_payments

### Many-to-Many
- batches ↔ students (via batch_students)
- exams ↔ students (via exam_attempts)

### Self-Referencing
- account_heads → parent_id (account_heads)

---

**Total Tables**: 40+
**Total Relationships**: 100+
**Database Size**: Scalable to millions of records
