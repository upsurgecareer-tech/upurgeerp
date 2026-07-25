# UpsurgeERP - Phase 4: Course, Batch & Attendance Management

**Duration:** Months 6-7
**Status:** Course, Batch & Attendance Management Phase

---

## Overview

Phase 4 builds the complete Course, Batch, and Attendance Management system for UpsurgeERP. It handles course package management, batch scheduling, timetable creation, QR code-based attendance, biometric integration, manual attendance marking, and attendance reports with trend detection.

---

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                  COURSE, BATCH & ATTENDANCE SYSTEM                       │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                        ATTENDANCE INPUT SOURCES                          │
├─────────────────────┬─────────────────────┬─────────────────────────────┤
│   QR Code Scan      │  Biometric Device   │   Manual Entry (Faculty)    │
│   (Student I-Card)  │  (Fingerprint)      │   (Batch-wise)              │
└──────────┬──────────┴──────────┬──────────┴──────────┬──────────────────┘
           │                     │                      │
           └─────────────────────┴──────────────────────┘
                                 │
                                 ▼
                 ┌───────────────────────────────┐
                 │     Attendance Processing     │
                 │   - Student Identification    │
                 │   - Batch Matching            │
                 │   - Duplicate Check           │
                 │   - Present / Absent Mark     │
                 └───────────────┬───────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐   ┌───────────────────┐   ┌─────────────────────┐
│  Attendance DB  │   │  Notification     │   │  Analytics Engine   │
│  (PostgreSQL)   │   │  Service          │   │  (Reports &         │
│                 │   │  (SMS/Email)      │   │   Trend Detection)  │
└─────────────────┘   └───────────────────┘   └─────────────────────┘
         │
         ▼
┌─────────────────┐   ┌───────────────────┐
│  Course & Batch │   │  Timetable        │
│  DB             │   │  Engine           │
│  (PostgreSQL)   │   │  (FullCalendar)   │
└─────────────────┘   └───────────────────┘
```

---

## Course & Batch Setup Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      COURSE & BATCH SETUP FLOW                           │
└─────────────────────────────────────────────────────────────────────────┘

  Admin / Branch Manager
          │
          ▼
  ┌───────────────────┐
  │  Create Course    │
  │  Package          │
  │  - Name           │
  │  - Duration       │
  │  - Total Fee      │
  │  - Subjects       │
  └────────┬──────────┘
           │
           ▼
  ┌───────────────────┐
  │  Create Batch     │
  │  - Batch Name     │
  │  - Course Package │
  │  - Start Date     │
  │  - End Date       │
  │  - Timing         │
  │  - Faculty        │
  │  - Max Students   │
  └────────┬──────────┘
           │
           ▼
  ┌───────────────────┐
  │  Create Timetable │
  │  - Day (Mon-Sun)  │
  │  - Subject        │
  │  - Faculty        │
  │  - Time Slot      │
  │  - Room / Lab     │
  └────────┬──────────┘
           │
           ▼
  ┌───────────────────┐        ┌──────────────────────────┐
  │  Assign Students  │───────►│  Students Notified       │
  │  to Batch         │        │  (SMS / Email / App)     │
  └────────┬──────────┘        └──────────────────────────┘
           │
           ▼
  ┌───────────────────┐
  │  Batch Active     │──── QR Code Generated for each Student
  │  & Running        │──── Timetable visible on Dashboard
  └───────────────────┘
```

---

## QR Code Attendance Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       QR CODE ATTENDANCE FLOW                            │
└─────────────────────────────────────────────────────────────────────────┘

  Student Arrives at Institute
          │
          ▼
  ┌───────────────────┐
  │  Student Shows    │
  │  QR Code I-Card   │
  │  (Mobile / Print) │
  └────────┬──────────┘
           │
           ▼
  ┌───────────────────┐
  │  QR Scanner at    │
  │  Entrance / Class │
  │  Scans QR Code    │
  └────────┬──────────┘
           │
           ▼
  ┌───────────────────┐
  │  System Validates │
  │  - Student ID     │
  │  - Active Batch   │
  │  - Class Schedule │
  │  - Duplicate Scan │
  └────────┬──────────┘
           │
           ├──────────────────────────────────────────┐
           │                                          │
           ▼                                          ▼
  ┌───────────────────┐                   ┌───────────────────┐
  │  VALID SCAN       │                   │  INVALID SCAN     │
  │  Attendance       │                   │  - Alert shown    │
  │  Marked Present   │                   │  - Already marked │
  └────────┬──────────┘                   │  - Not enrolled   │
           │                              └───────────────────┘
           ▼
  ┌───────────────────┐
  │  Confirmation     │──── Green tick on scanner screen
  │  Shown            │──── Real-time update in dashboard
  └───────────────────┘
```

---

## Biometric Attendance Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      BIOMETRIC ATTENDANCE FLOW                           │
└─────────────────────────────────────────────────────────────────────────┘

  Student / Staff Places Finger
          │
          ▼
  ┌───────────────────┐
  │  Biometric Device │
  │  Captures         │
  │  Fingerprint      │
  └────────┬──────────┘
           │
           ▼
  ┌───────────────────┐
  │  Device SDK       │
  │  Matches with     │
  │  Registered       │
  │  Template         │
  └────────┬──────────┘
           │
           ▼
  ┌───────────────────┐
  │  API Called       │──── POST /api/v1/attendance/biometric
  │  with User ID     │
  │  & Timestamp      │
  └────────┬──────────┘
           │
           ▼
  ┌───────────────────┐
  │  Attendance       │
  │  Recorded in DB   │──── Present / In-Time / Out-Time
  └───────────────────┘
```

---

## Manual Attendance Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       MANUAL ATTENDANCE FLOW                             │
└─────────────────────────────────────────────────────────────────────────┘

  Faculty Opens Attendance Module
          │
          ▼
  ┌───────────────────┐
  │  Select Batch     │
  │  Select Date      │
  │  Select Subject   │
  └────────┬──────────┘
           │
           ▼
  ┌───────────────────┐
  │  Student List     │
  │  Loaded for       │
  │  that Batch       │
  └────────┬──────────┘
           │
           ▼
  ┌───────────────────┐
  │  Mark Each        │
  │  Student:         │
  │  P / A / L        │
  │  (Present /       │
  │   Absent / Leave) │
  └────────┬──────────┘
           │
           ▼
  ┌───────────────────┐        ┌──────────────────────────┐
  │  Submit           │───────►│  Absent Students get     │
  │  Attendance       │        │  SMS Notification        │
  └────────┬──────────┘        │  (to Parent / Student)   │
           │                   └──────────────────────────┘
           ▼
  ┌───────────────────┐
  │  Attendance       │
  │  Saved & Locked   │──── Can be edited by Admin only
  └───────────────────┘
```

---

## Attendance Trend Detection Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    ATTENDANCE TREND DETECTION FLOW                       │
└─────────────────────────────────────────────────────────────────────────┘

  Daily Cron Job (End of Day)
          │
          ▼
  ┌───────────────────┐
  │  Analyze          │
  │  Attendance Data  │
  │  per Student      │
  └────────┬──────────┘
           │
           ▼
  ┌───────────────────┐
  │  Calculate        │
  │  Attendance %     │
  │  (Last 7/30 days) │
  └────────┬──────────┘
           │
           ├──────────────────────────────────────────┐
           │                                          │
           ▼                                          ▼
  ┌───────────────────┐                   ┌───────────────────┐
  │  Attendance       │                   │  Attendance       │
  │  >= 75%           │                   │  < 75%            │
  │  (Normal)         │                   │  (At Risk)        │
  └───────────────────┘                   └────────┬──────────┘
                                                   │
                                                   ▼
                                          ┌───────────────────┐
                                          │  Alert Generated  │
                                          │  - Counsellor     │
                                          │    Notified       │
                                          │  - SMS to Parent  │
                                          │  - Dashboard Flag │
                                          └───────────────────┘
```

---

## Database Schema

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          DATABASE SCHEMA                                  │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────┐         ┌──────────────────────────┐
│      course_packages     │         │         batches          │
├──────────────────────────┤         ├──────────────────────────┤
│ id (PK)                  │         │ id (PK)                  │
│ branch_id (FK)           │         │ branch_id (FK)           │
│ name                     │         │ course_package_id (FK)   │
│ total_fee                ├────────►│ name                     │
│ duration_months          │         │ faculty_id (FK→users)    │
│ description              │         │ start_date               │
│ is_active                │         │ end_date                 │
│ created_at               │         │ timing                   │
└──────────────────────────┘         │ max_students             │
                                     │ status (Active/Completed)│
                                     │ created_at               │
                                     └──────────┬───────────────┘
                                                │
                          ┌─────────────────────┘
                          │
                          ▼
┌──────────────────────────┐         ┌──────────────────────────┐
│      batch_students      │         │       timetable          │
├──────────────────────────┤         ├──────────────────────────┤
│ id (PK)                  │         │ id (PK)                  │
│ batch_id (FK)            │         │ batch_id (FK)            │
│ student_id (FK)          │         │ subject                  │
│ admission_id (FK)        │         │ faculty_id (FK→users)    │
│ joined_date              │         │ day_of_week              │
│ status (Active/Dropped)  │         │ (Mon/Tue/Wed...)         │
│ created_at               │         │ start_time               │
└──────────────────────────┘         │ end_time                 │
                                     │ room                     │
                                     │ created_at               │
                                     └──────────────────────────┘

┌──────────────────────────┐         ┌──────────────────────────┐
│       attendance         │         │    attendance_sessions   │
├──────────────────────────┤         ├──────────────────────────┤
│ id (PK)                  │         │ id (PK)                  │
│ session_id (FK)          │         │ batch_id (FK)            │
│ student_id (FK)          │         │ subject                  │
│ status                   │         │ faculty_id (FK)          │
│ (Present/Absent/Leave)   ├────────►│ date                     │
│ marked_by                │         │ start_time               │
│ (QR/Biometric/Manual)    │         │ end_time                 │
│ marked_at                │         │ created_at               │
│ created_at               │         └──────────────────────────┘
└──────────────────────────┘

┌──────────────────────────┐         ┌──────────────────────────┐
│    qr_codes              │         │   biometric_logs         │
├──────────────────────────┤         ├──────────────────────────┤
│ id (PK)                  │         │ id (PK)                  │
│ student_id (FK)          │         │ user_id (FK)             │
│ qr_token (unique)        │         │ device_id                │
│ qr_image_url             │         │ punch_time               │
│ is_active                │         │ punch_type               │
│ created_at               │         │ (In / Out)               │
└──────────────────────────┘         │ created_at               │
                                     └──────────────────────────┘
```

---

## API Endpoints

### Course Packages
```
POST   /api/v1/course-packages                        → Create course package
GET    /api/v1/course-packages                        → List all packages
GET    /api/v1/course-packages/:id                    → Get package detail
PUT    /api/v1/course-packages/:id                    → Update package
DELETE /api/v1/course-packages/:id                    → Delete package
```

### Batch Management
```
POST   /api/v1/batches                                → Create new batch
GET    /api/v1/batches                                → List all batches (with filters)
GET    /api/v1/batches/:id                            → Get batch detail
PUT    /api/v1/batches/:id                            → Update batch
DELETE /api/v1/batches/:id                            → Delete batch
PUT    /api/v1/batches/:id/status                     → Activate / complete batch
POST   /api/v1/batches/:id/students                   → Add student to batch
DELETE /api/v1/batches/:id/students/:studentId        → Remove student from batch
GET    /api/v1/batches/:id/students                   → List students in batch
```

### Timetable
```
POST   /api/v1/batches/:id/timetable                  → Create timetable entry
GET    /api/v1/batches/:id/timetable                  → Get batch timetable
PUT    /api/v1/timetable/:id                          → Update timetable entry
DELETE /api/v1/timetable/:id                          → Delete timetable entry
GET    /api/v1/timetable/faculty/:facultyId           → Faculty-wise schedule
```

### Attendance
```
POST   /api/v1/attendance/qr                          → Mark attendance via QR scan
POST   /api/v1/attendance/biometric                   → Mark attendance via biometric
POST   /api/v1/attendance/manual                      → Mark attendance manually (bulk)
GET    /api/v1/attendance/batch/:batchId              → Get batch attendance by date
GET    /api/v1/attendance/student/:studentId          → Get student attendance history
PUT    /api/v1/attendance/:id                         → Edit attendance (Admin only)
POST   /api/v1/attendance/sessions                    → Create attendance session
GET    /api/v1/attendance/sessions/:batchId           → Get sessions for batch
```

### QR Code
```
POST   /api/v1/qr/generate/:studentId                 → Generate QR code for student
GET    /api/v1/qr/:studentId                          → Get student QR code
POST   /api/v1/qr/regenerate/:studentId               → Regenerate QR code
GET    /api/v1/qr/validate/:token                     → Validate QR token (scanner)
```

### Analytics & Reports
```
GET    /api/v1/analytics/attendance/batch-wise        → Batch-wise attendance %
GET    /api/v1/analytics/attendance/student-wise      → Student-wise attendance report
GET    /api/v1/analytics/attendance/daily             → Daily attendance summary
GET    /api/v1/analytics/attendance/monthly           → Monthly attendance report
GET    /api/v1/analytics/attendance/at-risk           → Students below 75% attendance
GET    /api/v1/analytics/batches/schedule             → Batch schedule calendar data
```

---

## External Integrations

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        EXTERNAL INTEGRATIONS                             │
└─────────────────────────────────────────────────────────────────────────┘

  ┌─────────────────────┐
  │   QRCode.js /       │◄─── Generate QR ───  POST /api/v1/qr/generate/:studentId
  │   ZXing             │──── Scan & Decode ─► POST /api/v1/attendance/qr
  │   (QR Library)      │                      (Real-time attendance marking)
  └─────────────────────┘

  ┌─────────────────────┐
  │   Biometric SDK     │◄─── Device Push ───  POST /api/v1/attendance/biometric
  │   (ZKTeco / ESSL)   │                      (Auto-push on fingerprint match)
  │   Device-specific   │
  └─────────────────────┘

  ┌─────────────────────┐
  │   FullCalendar.js   │◄─── Schedule Data ─  GET /api/v1/analytics/batches/schedule
  │   (Calendar UI)     │                      (Weekly/Monthly batch timetable view)
  └─────────────────────┘

  ┌─────────────────────┐
  │   Socket.io /       │◄─── Real-time ─────  QR scan → instant dashboard update
  │   WebSockets        │                      (Live attendance feed)
  └─────────────────────┘

  ┌─────────────────────┐
  │   Twilio / MSG91    │◄─── Absent Alert ──  Auto-triggered when student absent
  │   (SMS Gateway)     │                      (SMS to student + parent)
  └─────────────────────┘
```

---

## Technology Stack

### Backend
```
Node.js + Express.js
├── qrcode             → QR code generation
├── socket.io          → Real-time attendance updates
├── node-cron          → Daily attendance trend analysis
├── bull               → Notification job queue
├── twilio / msg91     → SMS for absent alerts
├── nodemailer         → Email notifications
└── express-validator  → Input validation
```

### Database
```
MySQL 8.0+
├── course_packages table
├── batches table
├── batch_students table
├── timetable table
├── attendance_sessions table
├── attendance table
├── qr_codes table
└── biometric_logs table

Redis
├── QR token validation cache
├── Real-time attendance session cache
└── Absent notification job queue
```

### Frontend
```
FullCalendar.js
├── Month view  → Monthly batch schedule
├── Week view   → Weekly timetable
├── Day view    → Daily class schedule
└── List view   → Upcoming classes list

Chart.js
├── Attendance % Bar Chart (batch-wise)
├── Student Attendance Trend (line chart)
└── Daily Present / Absent Pie Chart
```

---

## Module Breakdown

### 1. Course Package Management

#### Features:
- Create / edit / delete course packages
- Define subjects per course
- Set total fee and duration
- Link to batches
- Course-wise admission and attendance reports
- Active / inactive toggle

---

### 2. Batch Scheduling & Timetable

#### Features:
- Create batches with start/end date, timing, faculty
- Assign multiple students to a batch
- Weekly timetable per batch (subject, faculty, time, room)
- FullCalendar.js view (Month / Week / Day / List)
- Faculty-wise schedule view
- Batch capacity management (max students)
- Batch status: Upcoming / Active / Completed

---

### 3. QR Code-Based Attendance

#### Features:
- Unique QR code generated per student at admission
- QR printed on student I-Card (PDF)
- QR scanner at entrance or classroom
- Real-time attendance marking via WebSocket
- Duplicate scan prevention (within same session)
- QR regeneration if lost/expired
- Instant confirmation on scanner screen

---

### 4. Biometric Integration

#### Features:
- Integrate with ZKTeco / ESSL biometric devices
- Fingerprint registration per student/staff
- Auto-push attendance on fingerprint match
- In-time and out-time tracking
- Biometric log history
- Fallback to manual if device offline

---

### 5. Manual Attendance

#### Features:
- Faculty selects batch, date, subject
- Student list auto-loaded for that batch
- Mark Present / Absent / Leave per student
- Bulk mark all present with one click
- Submit and lock attendance
- Admin can edit locked attendance with reason
- Absent students get SMS notification to parent

---

### 6. Attendance Reports & Trend Detection

#### Reports:
- Daily Attendance Summary (batch-wise)
- Student-wise Attendance % (date range)
- Monthly Attendance Report (export to Excel/PDF)
- Batch-wise Attendance Comparison
- At-Risk Students Report (below 75%)
- Faculty-wise Class Conducted Report

#### Trend Detection:
- Daily cron job calculates attendance % per student
- Students below 75% flagged as "At Risk"
- Counsellor notified via dashboard alert
- SMS sent to parent of at-risk student
- Trend chart shows attendance over last 30 days

---

## Security Implementation

```
1. Attendance Data Access Control
   - Faculty can mark attendance for assigned batches only
   - Students can view their own attendance only
   - Branch Admin can view/edit all batch attendance
   - Super Admin has full access

2. QR Code Security
   - Each QR token is unique and encrypted (UUID v4)
   - QR token validated server-side on every scan
   - Duplicate scan blocked within same session window
   - QR regeneration invalidates old token immediately

3. Biometric Security
   - Biometric templates stored on device (not in DB)
   - Only user ID and timestamp pushed to API
   - Device-to-API communication over HTTPS only

4. API Security
   - JWT authentication on all endpoints
   - Role-based permission check (Faculty, Admin, Student)
   - Rate limiting on QR scan and biometric push APIs
```

---

## Development Timeline

### Week 1: Course Packages & Batch Management
- [ ] Create course_packages, batches, batch_students, timetable tables
- [ ] Course package CRUD APIs
- [ ] Batch CRUD APIs
- [ ] Batch student assignment APIs
- [ ] Timetable CRUD APIs
- [ ] FullCalendar.js integration

### Week 2: QR Code System
- [ ] qr_codes table
- [ ] QR code generation (qrcode.js)
- [ ] QR token validation API
- [ ] QR-based attendance marking API
- [ ] Duplicate scan prevention logic
- [ ] Real-time update via Socket.io
- [ ] QR code PDF for I-Card

### Week 3: Biometric & Manual Attendance
- [ ] biometric_logs, attendance_sessions, attendance tables
- [ ] Biometric device SDK integration (ZKTeco/ESSL)
- [ ] Biometric attendance push API
- [ ] Manual attendance marking APIs (bulk)
- [ ] Attendance session management
- [ ] Absent SMS notification (Twilio/MSG91)
- [ ] Attendance lock & admin edit with reason

### Week 4: Reports, Trend Detection & Testing
- [ ] Attendance analytics APIs (daily, monthly, student-wise)
- [ ] At-risk student detection cron job
- [ ] Counsellor alert + parent SMS for at-risk
- [ ] Chart.js attendance charts on frontend
- [ ] Excel / PDF export for attendance reports
- [ ] Unit & integration tests
- [ ] Performance optimization

---

## Testing Strategy

```javascript
// Example: Attendance Tests
describe('Attendance Management', () => {
  test('Mark attendance via QR scan', async () => {
    const response = await request(app)
      .post('/api/v1/attendance/qr')
      .set('Authorization', `Bearer ${token}`)
      .send({
        qr_token: 'uuid-token-here',
        session_id: 1
      });

    expect(response.status).toBe(201);
    expect(response.body.status).toBe('Present');
  });

  test('Block duplicate QR scan in same session', async () => {
    const response = await request(app)
      .post('/api/v1/attendance/qr')
      .set('Authorization', `Bearer ${token}`)
      .send({
        qr_token: 'uuid-token-here',
        session_id: 1
      });

    expect(response.status).toBe(409); // Already marked
  });

  test('Mark manual attendance for batch', async () => {
    const response = await request(app)
      .post('/api/v1/attendance/manual')
      .set('Authorization', `Bearer ${token}`)
      .send({
        session_id: 2,
        attendance: [
          { student_id: 1, status: 'Present' },
          { student_id: 2, status: 'Absent' },
          { student_id: 3, status: 'Leave' }
        ]
      });

    expect(response.status).toBe(201);
    expect(response.body.saved).toBe(3);
  });

  test('Get at-risk students below 75%', async () => {
    const response = await request(app)
      .get('/api/v1/analytics/attendance/at-risk')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.students).toBeDefined();
  });
});
```

---

## Deployment Notes

```
Environment Variables Required:

# Socket.io (Real-time)
SOCKET_PORT=3001
CORS_ORIGIN=https://app.upsurgeerp.com

# Biometric Device
BIOMETRIC_DEVICE_IP=192.168.1.100
BIOMETRIC_DEVICE_PORT=4370
BIOMETRIC_SDK=zkteco

# SMS Gateway
TWILIO_ACCOUNT_SID=<sid>
TWILIO_AUTH_TOKEN=<token>
TWILIO_FROM_NUMBER=+1xxxxxxxxxx

# OR MSG91
MSG91_AUTH_KEY=<key>
MSG91_SENDER_ID=UPSRGE

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=noreply@upsurgeerp.com

# QR
QR_SECRET_KEY=<secret_for_token_encryption>
QR_EXPIRY_MINUTES=30
```

---

## Deliverables

1. ✅ Course Package Management
2. ✅ Batch Scheduling with FullCalendar.js (Month/Week/Day/List view)
3. ✅ Timetable Management (Subject, Faculty, Time, Room)
4. ✅ QR Code-Based Attendance (Real-time via Socket.io)
5. ✅ Biometric Device Integration (ZKTeco / ESSL)
6. ✅ Manual Attendance with Absent SMS Notification
7. ✅ Attendance Lock & Admin Edit with Reason
8. ✅ Attendance Reports (Daily, Monthly, Student-wise, Batch-wise)
9. ✅ At-Risk Student Detection (below 75%) with Alerts
10. ✅ API Documentation (Swagger)
11. ✅ Unit & Integration Tests

---

## Success Metrics

- [ ] QR scan to attendance marked < 1 second
- [ ] Biometric push to attendance recorded < 2 seconds
- [ ] Real-time dashboard update via Socket.io < 500ms
- [ ] At-risk detection cron runs daily without failure
- [ ] Absent SMS delivered within 5 minutes of class end
- [ ] Attendance reports load < 1 second
- [ ] All APIs response time < 200ms

---

**Document Version:** 1.0
**Phase:** 4 - Course, Batch & Attendance Management
**Duration:** Months 6-7
**Prepared By:** Development Team
