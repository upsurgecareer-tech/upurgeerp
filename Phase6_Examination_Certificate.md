# UpsurgeERP - Phase 6: Examination & Certificate Management

**Duration:** Month 9
**Status:** Examination & Certificate Management Phase

---

## Overview

Phase 6 builds the complete Examination and Certificate Management system for UpsurgeERP. It handles online and offline examinations, auto result calculation, certificate generation, quiz module, and exam performance reports.

---

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                  EXAMINATION & CERTIFICATE MANAGEMENT SYSTEM             │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                          EXAM ENTRY POINTS                               │
├─────────────────────┬─────────────────────┬─────────────────────────────┤
│   Admin / Faculty   │   Student Portal    │   Mobile App                │
│   (Create Exam)     │   (Attempt Exam)    │   (Attempt Exam)            │
└──────────┬──────────┴──────────┬──────────┴──────────┬──────────────────┘
           │                     │                      │
           └─────────────────────┴──────────────────────┘
                                 │
                                 ▼
                 ┌───────────────────────────────┐
                 │       Exam Processing         │
                 │   - Question Bank             │
                 │   - Exam Scheduling           │
                 │   - Timer Management          │
                 │   - Auto Evaluation           │
                 └───────────────┬───────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐   ┌───────────────────┐   ┌─────────────────────┐
│   Exam DB       │   │   Result Engine   │   │   Certificate       │
│   (PostgreSQL)  │   │   (Auto Calc)     │   │   Generator         │
│                 │   │                   │   │   (Canvas / PDF)    │
└─────────────────┘   └───────────────────┘   └─────────────────────┘
         │
         ▼
┌─────────────────┐   ┌───────────────────┐
│   Analytics     │   │   Notification    │
│   Engine        │   │   Service         │
│   (Reports)     │   │   (SMS / Email)   │
└─────────────────┘   └───────────────────┘
```

---

## Exam Creation Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          EXAM CREATION FLOW                              │
└─────────────────────────────────────────────────────────────────────────┘

  Admin / Faculty Opens Exam Module
          │
          ▼
  ┌───────────────────┐
  │  Create Exam      │
  │  - Exam Name      │
  │  - Batch          │
  │  - Subject        │
  │  - Exam Type      │
  │    (Online /      │
  │     Offline)      │
  │  - Total Marks    │
  │  - Pass Marks     │
  │  - Duration (min) │
  └────────┬──────────┘
           │
           ▼
  ┌───────────────────┐
  │  Add Questions    │
  │  from Question    │
  │  Bank             │
  │  - MCQ            │
  │  - True / False   │
  │  - Short Answer   │
  │  - Marks per Q    │
  └────────┬──────────┘
           │
           ▼
  ┌───────────────────┐
  │  Schedule Exam    │
  │  - Start Date     │
  │  - Start Time     │
  │  - End Time       │
  │  - Instructions   │
  └────────┬──────────┘
           │
           ▼
  ┌───────────────────┐        ┌──────────────────────────┐
  │  Publish Exam     │───────►│  Students Notified       │
  │                   │        │  (SMS / Email / App)     │
  └───────────────────┘        └──────────────────────────┘
```

---

## Online Exam Attempt Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       ONLINE EXAM ATTEMPT FLOW                           │
└─────────────────────────────────────────────────────────────────────────┘

  Student Logs In at Exam Time
          │
          ▼
  ┌───────────────────┐
  │  View Available   │
  │  Exams            │
  └────────┬──────────┘
           │
           ▼
  ┌───────────────────┐
  │  Read             │
  │  Instructions     │
  │  & Start Exam     │
  └────────┬──────────┘
           │
           ▼
  ┌───────────────────┐
  │  Timer Starts     │──── Countdown visible on screen
  │  Questions Load   │──── Questions shuffled (optional)
  └────────┬──────────┘
           │
           ▼
  ┌───────────────────┐
  │  Student Attempts │
  │  Questions        │
  │  - Select MCQ     │
  │  - Mark for Review│
  │  - Navigate Q     │
  └────────┬──────────┘
           │
           ├──────────────────────────────────────────┐
           │                                          │
           ▼                                          ▼
  ┌───────────────────┐                   ┌───────────────────┐
  │  Student Submits  │                   │  Timer Expires    │
  │  Manually         │                   │  Auto Submit      │
  └────────┬──────────┘                   └────────┬──────────┘
           │                                       │
           └───────────────────┬───────────────────┘
                               │
                               ▼
                   ┌───────────────────────┐
                   │  Auto Evaluation      │
                   │  (MCQ / True-False)   │
                   │  Result Calculated    │
                   └───────────┬───────────┘
                               │
                               ▼
                   ┌───────────────────────┐
                   │  Result Published     │──── Pass / Fail
                   │  - Marks Obtained     │──── SMS to Student
                   │  - Percentage         │──── Visible on Portal
                   │  - Grade              │
                   └───────────────────────┘
```

---

## Offline Exam Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        OFFLINE EXAM FLOW                                 │
└─────────────────────────────────────────────────────────────────────────┘

  Admin Schedules Offline Exam
          │
          ▼
  ┌───────────────────┐        ┌──────────────────────────┐
  │  Exam Scheduled   │───────►│  Students Notified       │
  │  in System        │        │  (Date / Time / Venue)   │
  └────────┬──────────┘        └──────────────────────────┘
           │
           ▼
  ┌───────────────────┐
  │  Exam Conducted   │
  │  (Physical Paper) │
  └────────┬──────────┘
           │
           ▼
  ┌───────────────────┐
  │  Faculty Enters   │
  │  Marks in System  │
  │  per Student      │
  └────────┬──────────┘
           │
           ▼
  ┌───────────────────┐
  │  Result           │
  │  Calculated &     │──── Pass / Fail / Grade
  │  Published        │──── SMS to Student
  └───────────────────┘
```

---

## Certificate Generation Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     CERTIFICATE GENERATION FLOW                          │
└─────────────────────────────────────────────────────────────────────────┘

  Student Completes Course
          │
          ▼
  ┌───────────────────┐
  │  System Checks    │
  │  - All Exams Pass │
  │  - Attendance OK  │
  │  - Fees Cleared   │
  └────────┬──────────┘
           │
           ├──────────────────────────────────────────┐
           │                                          │
           ▼                                          ▼
  ┌───────────────────┐                   ┌───────────────────┐
  │  Eligible for     │                   │  Not Eligible     │
  │  Certificate      │                   │  - Reason shown   │
  └────────┬──────────┘                   │  - Action needed  │
           │                              └───────────────────┘
           ▼
  ┌───────────────────┐
  │  Admin Approves   │
  │  Certificate      │
  │  Generation       │
  └────────┬──────────┘
           │
           ▼
  ┌───────────────────┐
  │  Certificate      │
  │  Generated (PDF)  │
  │  - Student Name   │
  │  - Course Name    │
  │  - Completion Date│
  │  - Certificate No │
  │  - QR Code        │
  │  - Signature      │
  └────────┬──────────┘
           │
           ▼
  ┌───────────────────┐
  │  Certificate      │──── Stored on VPS Local Storage
  │  Delivered        │──── Email to Student
  │                   │──── Downloadable on Portal
  └───────────────────┘
```

---

## Database Schema

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            DATABASE SCHEMA                               │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────┐         ┌──────────────────────────┐
│          exams           │         │      question_bank       │
├──────────────────────────┤         ├──────────────────────────┤
│ id (PK)                  │         │ id (PK)                  │
│ branch_id (FK)           │         │ branch_id (FK)           │
│ batch_id (FK)            │         │ subject                  │
│ subject                  │         │ question_text            │
│ exam_name                ├────────►│ question_type            │
│ exam_type                │         │ (MCQ/TrueFalse/Short)    │
│ (Online/Offline)         │         │ option_a                 │
│ total_marks              │         │ option_b                 │
│ pass_marks               │         │ option_c                 │
│ duration_minutes         │         │ option_d                 │
│ start_datetime           │         │ correct_answer           │
│ end_datetime             │         │ marks                    │
│ instructions             │         │ created_by (FK→users)    │
│ status                   │         │ created_at               │
│ (Draft/Published/Done)   │         └──────────────────────────┘
│ created_by (FK→users)    │
│ created_at               │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐         ┌──────────────────────────┐
│      exam_questions      │         │      exam_attempts       │
├──────────────────────────┤         ├──────────────────────────┤
│ id (PK)                  │         │ id (PK)                  │
│ exam_id (FK)             │         │ exam_id (FK)             │
│ question_id (FK)         │         │ student_id (FK)          │
│ order_no                 ├────────►│ start_time               │
│ marks                    │         │ end_time                 │
│ created_at               │         │ status                   │
└──────────────────────────┘         │ (InProgress/Submitted)   │
                                     │ total_marks_obtained     │
                                     │ percentage               │
                                     │ grade                    │
                                     │ result (Pass/Fail)       │
                                     │ created_at               │
                                     └──────────────────────────┘

┌──────────────────────────┐         ┌──────────────────────────┐
│     student_answers      │         │       certificates       │
├──────────────────────────┤         ├──────────────────────────┤
│ id (PK)                  │         │ id (PK)                  │
│ attempt_id (FK)          │         │ student_id (FK)          │
│ question_id (FK)         │         │ course_package_id (FK)   │
│ selected_answer          │         │ certificate_no (unique)  │
│ is_correct               │         │ issue_date               │
│ marks_obtained           │         │ certificate_url (VPS)    │
│ created_at               │         │ qr_token                 │
└──────────────────────────┘         │ issued_by (FK→users)     │
                                     │ created_at               │
                                     └──────────────────────────┘

┌──────────────────────────┐
│          quizzes         │
├──────────────────────────┤
│ id (PK)                  │
│ batch_id (FK)            │
│ title                    │
│ subject                  │
│ total_questions          │
│ duration_minutes         │
│ is_active                │
│ created_by (FK→users)    │
│ created_at               │
└──────────────────────────┘
```

---

## API Endpoints

### Question Bank
```
POST   /api/v1/questions                          → Add question to bank
GET    /api/v1/questions                          → List questions (with filters)
GET    /api/v1/questions/:id                      → Get question detail
PUT    /api/v1/questions/:id                      → Update question
DELETE /api/v1/questions/:id                      → Delete question
POST   /api/v1/questions/bulk-import              → Bulk import questions (CSV)
```

### Exam Management
```
POST   /api/v1/exams                              → Create exam
GET    /api/v1/exams                              → List all exams
GET    /api/v1/exams/:id                          → Get exam detail
PUT    /api/v1/exams/:id                          → Update exam
DELETE /api/v1/exams/:id                          → Delete exam
PUT    /api/v1/exams/:id/publish                  → Publish exam
POST   /api/v1/exams/:id/questions                → Add questions to exam
GET    /api/v1/exams/:id/questions                → Get exam questions
```

### Exam Attempt (Student)
```
POST   /api/v1/exams/:id/start                    → Start exam attempt
GET    /api/v1/exams/:id/attempt                  → Get current attempt questions
POST   /api/v1/exams/:id/submit                   → Submit exam
GET    /api/v1/exams/:id/result                   → Get exam result
POST   /api/v1/exams/:id/answers                  → Save answer (auto-save)
```

### Offline Exam Results
```
POST   /api/v1/exams/:id/offline-results          → Enter offline exam marks
GET    /api/v1/exams/:id/offline-results          → Get offline results
PUT    /api/v1/exams/:id/offline-results/:studentId → Update marks
```

### Certificates
```
POST   /api/v1/certificates/generate/:studentId   → Generate certificate
GET    /api/v1/certificates/:studentId            → Get student certificates
GET    /api/v1/certificates/:id/download          → Download certificate PDF
GET    /api/v1/certificates/verify/:qrToken       → Verify certificate (public)
```

### Quiz
```
POST   /api/v1/quizzes                            → Create quiz
GET    /api/v1/quizzes                            → List quizzes
GET    /api/v1/quizzes/:id                        → Get quiz detail
PUT    /api/v1/quizzes/:id                        → Update quiz
DELETE /api/v1/quizzes/:id                        → Delete quiz
POST   /api/v1/quizzes/:id/attempt                → Attempt quiz (student)
GET    /api/v1/quizzes/:id/result                 → Get quiz result
```

### Analytics & Reports
```
GET    /api/v1/analytics/exams/batch-wise         → Batch-wise exam performance
GET    /api/v1/analytics/exams/student-wise       → Student-wise result report
GET    /api/v1/analytics/exams/pass-fail          → Pass/Fail ratio report
GET    /api/v1/analytics/exams/topper-list        → Topper list per exam
GET    /api/v1/analytics/certificates/issued      → Certificates issued report
```

---

## External Integrations

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        EXTERNAL INTEGRATIONS                             │
└─────────────────────────────────────────────────────────────────────────┘

  ┌─────────────────────┐
  │   Canvas API /      │◄─── Certificate ───  POST /api/v1/certificates/generate
  │   PDFKit            │──── PDF Export ────► Download Certificate PDF
  │   (Certificate)     │
  └─────────────────────┘

  ┌─────────────────────┐
  │   QRCode.js         │◄─── QR on Cert ────  Embedded in certificate PDF
  │   (QR Generator)    │──── Verify URL ────► GET /api/v1/certificates/verify/:token
  └─────────────────────┘

  ┌─────────────────────┐
  │   Cloudinary        │◄─── Store PDF ─────  Certificates & exam result PDFs
  │   (File Storage)    │──── Secure URL ────► Secure download links
  └─────────────────────┘

  ┌─────────────────────┐
  │   SendGrid /        │◄─── Result Email ──  Auto-send result on publish
  │   SMTP (Gmail)      │──── Cert Email ────► Certificate delivery via email
  └─────────────────────┘

  ┌─────────────────────┐
  │   Twilio / MSG91    │◄─── Result SMS ────  SMS on result publish
  │   (SMS Gateway)     │──── Cert SMS ──────► Certificate ready notification
  └─────────────────────┘
```

---

## Technology Stack

### Backend
```
Node.js + Express.js
├── canvas / pdfkit    → Certificate PDF generation
├── qrcode             → QR code on certificate
├── bull               → Job queue for bulk result processing
├── node-cron          → Auto-submit expired exams
├── nodemailer         → Email result & certificate (SMTP)
├── twilio / msg91     → SMS result notification
└── express-validator  → Input validation
```

### Database
```
MySQL 8.0+
├── exams table
├── question_bank table
├── exam_questions table
├── exam_attempts table
├── student_answers table
├── certificates table
└── quizzes table

Redis
├── Active exam session cache (timer sync)
├── Auto-save answer cache
└── Result processing job queue
```

---

## Module Breakdown

### 1. Question Bank

#### Features:
- Add MCQ, True/False, Short Answer questions
- Subject-wise question categorization
- Marks per question
- Bulk import via CSV
- Reuse questions across multiple exams
- Question difficulty tagging (Easy / Medium / Hard)

---

### 2. Online Examination System

#### Features:
- Create exam with questions from question bank
- Set duration, total marks, pass marks
- Schedule exam with start/end datetime
- Publish exam to specific batch
- Student attempts via portal or mobile app
- Countdown timer with auto-submit on expiry
- Question navigation panel
- Mark question for review
- Auto-save answers every 30 seconds
- Anti-tab-switch detection (optional)
- Auto evaluation for MCQ and True/False
- Instant result after submission

---

### 3. Offline Examination Support

#### Features:
- Schedule offline exam in system
- Notify students with date, time, venue
- Faculty enters marks per student after exam
- Pass/Fail auto-calculated based on pass marks
- Result published and notified via SMS/Email
- Marks editable by admin before publish

---

### 4. Auto Results Calculation

#### Features:
- MCQ and True/False auto-evaluated on submit
- Marks totaled per student
- Percentage calculated
- Grade assigned (A/B/C/D/F based on % range)
- Pass/Fail determined by pass marks threshold
- Result visible on student portal immediately
- Batch-wise result summary for faculty

---

### 5. Certificate Generation

#### Features:
- Eligibility check (exams passed, attendance, fees cleared)
- Admin approval before generation
- Certificate with student name, course, date, certificate number
- Institute logo and authorized signature
- QR code for online verification
- Unique certificate number auto-generated
- PDF stored on VPS Local Storage
- Delivered via email and downloadable on portal
- Public certificate verification via QR scan

---

### 6. Quiz Module

#### Features:
- Faculty creates quick quizzes for batch
- Students attempt via portal or app
- Instant result after quiz submission
- Quiz history per student
- No scheduling required (available anytime)
- Linked to LMS module (Phase 7)

---

## Security Implementation

```
1. Exam Access Control
   - Students can only access exams assigned to their batch
   - Faculty can manage exams for assigned batches only
   - Admin can manage all exams across branches

2. Exam Integrity
   - One active attempt per student per exam
   - Auto-submit on timer expiry (server-side timer)
   - Answer auto-save every 30 seconds to prevent data loss
   - Tab-switch detection alert (optional proctoring)

3. Certificate Security
   - Unique certificate number per certificate
   - QR code links to public verification endpoint
   - Certificates stored on private VPS directory
   - Access via secure API endpoints with JWT authentication

4. API Security
   - JWT authentication on all endpoints
   - Role-based permission check
   - Rate limiting on exam attempt and answer save APIs
```

---

## Development Timeline

### Week 1: Question Bank & Exam Setup
- [ ] Create exams, question_bank, exam_questions tables
- [ ] Question bank CRUD APIs
- [ ] Bulk question import (CSV)
- [ ] Exam CRUD APIs
- [ ] Add questions to exam APIs
- [ ] Exam publish workflow

### Week 2: Online Exam Engine
- [ ] exam_attempts, student_answers tables
- [ ] Start exam attempt API
- [ ] Answer save API (auto-save every 30s)
- [ ] Submit exam API
- [ ] Server-side timer with auto-submit (node-cron)
- [ ] Auto evaluation logic (MCQ / True-False)
- [ ] Result calculation (marks, %, grade, pass/fail)
- [ ] Redis session cache for active exams

### Week 3: Offline Exam, Certificate & Quiz
- [ ] Offline exam mark entry APIs
- [ ] Result publish with SMS/Email notification
- [ ] certificates table
- [ ] Certificate eligibility check logic
- [ ] Certificate PDF generation (Canvas / PDFKit)
- [ ] QR code on certificate
- [ ] Certificate storage on VPS Local Storage
- [ ] Public certificate verification API
- [ ] Quiz CRUD and attempt APIs

### Week 4: Reports & Testing
- [ ] Exam performance analytics APIs
- [ ] Pass/fail ratio report
- [ ] Topper list API
- [ ] Certificate issued report
- [ ] Unit & integration tests
- [ ] Performance optimization

---

## Testing Strategy

```javascript
// Example: Examination Tests
describe('Examination Management', () => {
  test('Create exam with questions', async () => {
    const response = await request(app)
      .post('/api/v1/exams')
      .set('Authorization', `Bearer ${facultyToken}`)
      .send({
        exam_name: 'Mid Term Test',
        batch_id: 1,
        subject: 'JavaScript',
        exam_type: 'Online',
        total_marks: 50,
        pass_marks: 25,
        duration_minutes: 60,
        start_datetime: '2026-09-01T10:00:00'
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
  });

  test('Student starts exam attempt', async () => {
    const response = await request(app)
      .post('/api/v1/exams/1/start')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('attempt_id');
    expect(response.body).toHaveProperty('questions');
  });

  test('Block duplicate exam attempt', async () => {
    const response = await request(app)
      .post('/api/v1/exams/1/start')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(response.status).toBe(409);
  });

  test('Submit exam and get result', async () => {
    const response = await request(app)
      .post('/api/v1/exams/1/submit')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ attempt_id: 1 });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('result');
    expect(response.body).toHaveProperty('percentage');
  });

  test('Generate certificate for eligible student', async () => {
    const response = await request(app)
      .post('/api/v1/certificates/generate/1')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('certificate_no');
    expect(response.body).toHaveProperty('certificate_url');
  });
});
```

---

## Deployment Notes

```
Environment Variables Required:

# File Storage (Hostinger VPS Local)
UPLOAD_PATH=/var/www/upsurgeerp/uploads

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=noreply@upsurgeerp.com

# SMS
TWILIO_ACCOUNT_SID=<sid>
TWILIO_AUTH_TOKEN=<token>
TWILIO_FROM_NUMBER=+1xxxxxxxxxx

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Certificate
CERT_VERIFICATION_BASE_URL=https://app.upsurgeerp.com/verify
CERT_SIGNATURE_IMAGE_URL=https://yourdomain.com/uploads/signature.png
```

---

## Deliverables

1. ✅ Question Bank (MCQ, True/False, Short Answer) with Bulk Import
2. ✅ Online Examination Engine with Timer & Auto-Submit
3. ✅ Auto Evaluation & Result Calculation (Marks, %, Grade, Pass/Fail)
4. ✅ Offline Exam Support with Manual Mark Entry
5. ✅ Result Publish with SMS & Email Notification
6. ✅ Certificate Generation with QR Code (PDF)
7. ✅ Public Certificate Verification via QR Scan
8. ✅ Quiz Module for Quick Assessments
9. ✅ Exam Performance Reports (Batch-wise, Student-wise, Topper List)
10. ✅ API Documentation (Swagger)
11. ✅ Unit & Integration Tests

---

## Success Metrics

- [ ] Exam load time for 100 questions < 2 seconds
- [ ] Answer auto-save latency < 500ms
- [ ] Auto-submit on timer expiry 100% reliable
- [ ] Result calculation after submit < 3 seconds
- [ ] Certificate PDF generated within 5 seconds
- [ ] Result SMS/Email delivered within 5 minutes
- [ ] All APIs response time < 200ms

---

**Document Version:** 1.0
**Phase:** 6 - Examination & Certificate Management
**Duration:** Month 9
**Prepared By:** Development Team
