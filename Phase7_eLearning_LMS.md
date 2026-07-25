# UpsurgeERP - Phase 7: e-Learning / LMS Module

**Duration:** Months 10-11
**Status:** e-Learning / LMS Module Phase

---

## Overview

Phase 7 builds the complete e-Learning and Learning Management System (LMS) for UpsurgeERP. It handles live classroom integration, video library, assignments management, multiple attachments, notice board, and e-books management for students and faculty.

---

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        e-LEARNING / LMS SYSTEM                           │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                          CONTENT ENTRY POINTS                            │
├─────────────────────┬─────────────────────┬─────────────────────────────┤
│   Faculty / Admin   │   Student Portal    │   Mobile App                │
│   (Upload Content)  │   (Access Content)  │   (Access Content)          │
└──────────┬──────────┴──────────┬──────────┴──────────┬──────────────────┘
           │                     │                      │
           └─────────────────────┴──────────────────────┘
                                 │
                                 ▼
                 ┌───────────────────────────────┐
                 │       LMS Processing          │
                 │   - Content Management        │
                 │   - Access Control            │
                 │   - Progress Tracking         │
                 │   - Notification              │
                 └───────────────┬───────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐   ┌───────────────────┐   ┌─────────────────────┐
│   LMS DB        │   │   File Storage    │   │   Video Streaming   │
│   (PostgreSQL)  │   │   (VPS Local)       │   │   (Cloudflare CDN)    │
└─────────────────┘   └───────────────────┘   └─────────────────────┘
         │
         ▼
┌─────────────────┐   ┌───────────────────┐
│   Live Class    │   │   Notification    │
│   Engine        │   │   Service         │
│   (Zoom/Jitsi)  │   │   (SMS / Email)   │
└─────────────────┘   └───────────────────┘
```

---

## Content Upload Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         CONTENT UPLOAD FLOW                              │
└─────────────────────────────────────────────────────────────────────────┘

  Faculty / Admin Opens LMS
          │
          ▼
  ┌───────────────────┐
  │  Select Batch     │
  │  & Subject        │
  └────────┬──────────┘
           │
           ▼
  ┌───────────────────┐
  │  Select Content   │
  │  Type             │
  │  - Video          │
  │  - PDF / Notes    │
  │  - Assignment     │
  │  - e-Book         │
  │  - Notice         │
  └────────┬──────────┘
           │
           ▼
  ┌───────────────────┐
  │  Upload / Create  │
  │  Content          │
  │  - Title          │
  │  - Description    │
  │  - File / Link    │
  │  - Batch Access   │
  └────────┬──────────┘
           │
           ▼
  ┌───────────────────┐        ┌──────────────────────────┐
  │  Content          │───────►│  Students Notified       │
  │  Published        │        │  (SMS / Email / App)     │
  └───────────────────┘        └──────────────────────────┘
```

---

## Live Classroom Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        LIVE CLASSROOM FLOW                               │
└─────────────────────────────────────────────────────────────────────────┘

  Faculty Schedules Live Class
          │
          ▼
  ┌───────────────────┐
  │  Create Live      │
  │  Class            │
  │  - Title          │
  │  - Batch          │
  │  - Date & Time    │
  │  - Duration       │
  │  - Platform       │
  │    (Zoom / Jitsi) │
  └────────┬──────────┘
           │
           ▼
  ┌───────────────────┐        ┌──────────────────────────┐
  │  Meeting Link     │───────►│  Students Notified       │
  │  Generated        │        │  (SMS / Email / App)     │
  └────────┬──────────┘        │  (30 min before class)   │
           │                   └──────────────────────────┘
           │
           ▼
  ┌───────────────────┐
  │  Class Time       │
  │  Faculty Starts   │──── Join Link Active
  │  Meeting          │
  └────────┬──────────┘
           │
           ▼
  ┌───────────────────┐
  │  Students Join    │──── Via Portal / App / Direct Link
  │  Live Class       │
  └────────┬──────────┘
           │
           ▼
  ┌───────────────────┐
  │  Class Ends       │
  │  Recording        │──── Saved to VPS Local Storage (optional)
  │  Saved            │──── Available in Video Library
  └───────────────────┘
```

---

## Assignment Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          ASSIGNMENT FLOW                                 │
└─────────────────────────────────────────────────────────────────────────┘

  Faculty Creates Assignment
          │
          ▼
  ┌───────────────────┐
  │  Create           │
  │  Assignment       │
  │  - Title          │
  │  - Description    │
  │  - Batch          │
  │  - Due Date       │
  │  - Max Marks      │
  │  - Attachments    │
  └────────┬──────────┘
           │
           ▼
  ┌───────────────────┐        ┌──────────────────────────┐
  │  Assignment       │───────►│  Students Notified       │
  │  Published        │        │  (SMS / Email / App)     │
  └────────┬──────────┘        └──────────────────────────┘
           │
           ▼
  ┌───────────────────┐
  │  Student          │
  │  Submits          │
  │  Assignment       │──── Upload file / text answer
  └────────┬──────────┘
           │
           ▼
  ┌───────────────────┐
  │  Faculty Reviews  │
  │  Submission       │
  │  - Give Marks     │
  │  - Add Feedback   │
  └────────┬──────────┘
           │
           ▼
  ┌───────────────────┐        ┌──────────────────────────┐
  │  Marks Published  │───────►│  Student Notified        │
  │                   │        │  (Marks & Feedback)      │
  └───────────────────┘        └──────────────────────────┘
```

---

## Video Library Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         VIDEO LIBRARY FLOW                               │
└─────────────────────────────────────────────────────────────────────────┘

  Faculty Uploads Video
          │
          ▼
  ┌───────────────────┐
  │  Upload Video     │
  │  - Title          │
  │  - Subject        │
  │  - Batch Access   │
  │  - Description    │
  └────────┬──────────┘
           │
           ▼
  ┌───────────────────┐
  │  Video Stored     │──── VPS Local Storage
  │  on VPS Local      │──── Cloudflare CDN for streaming
  └────────┬──────────┘
           │
           ▼
  ┌───────────────────┐
  │  Student Opens    │
  │  Video Library    │
  └────────┬──────────┘
           │
           ▼
  ┌───────────────────┐
  │  Browse Videos    │
  │  by Subject /     │
  │  Batch            │
  └────────┬──────────┘
           │
           ▼
  ┌───────────────────┐
  │  Stream Video     │──── Via Cloudflare CDN
  │  in Browser /     │──── Progress tracked
  │  App              │──── Resume from last position
  └───────────────────┘
```

---

## Database Schema

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            DATABASE SCHEMA                               │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────┐         ┌──────────────────────────┐
│       lms_videos         │         │      live_classes        │
├──────────────────────────┤         ├──────────────────────────┤
│ id (PK)                  │         │ id (PK)                  │
│ branch_id (FK)           │         │ branch_id (FK)           │
│ batch_id (FK)            │         │ batch_id (FK)            │
│ subject                  │         │ faculty_id (FK→users)    │
│ title                    │         │ title                    │
│ description              │         │ scheduled_at             │
│ video_url (VPS)          │         │ duration_minutes         │
│ thumbnail_url            │         │ platform                 │
│ duration_seconds         │         │ (Zoom/Jitsi/Agora)       │
│ uploaded_by (FK→users)   │         │ meeting_link             │
│ is_active                │         │ meeting_id               │
│ created_at               │         │ status                   │
└──────────────────────────┘         │ (Scheduled/Live/Done)    │
                                     │ recording_url            │
                                     │ created_at               │
                                     └──────────────────────────┘

┌──────────────────────────┐         ┌──────────────────────────┐
│      assignments         │         │   assignment_submissions │
├──────────────────────────┤         ├──────────────────────────┤
│ id (PK)                  │         │ id (PK)                  │
│ batch_id (FK)            │         │ assignment_id (FK)       │
│ faculty_id (FK→users)    │         │ student_id (FK)          │
│ title                    ├────────►│ submission_text          │
│ description              │         │ file_url (VPS)           │
│ due_date                 │         │ submitted_at             │
│ max_marks                │         │ marks_obtained           │
│ attachment_url           │         │ feedback                 │
│ is_active                │         │ graded_by (FK→users)     │
│ created_at               │         │ graded_at                │
└──────────────────────────┘         └──────────────────────────┘

┌──────────────────────────┐         ┌──────────────────────────┐
│       lms_materials      │         │       notice_board       │
├──────────────────────────┤         ├──────────────────────────┤
│ id (PK)                  │         │ id (PK)                  │
│ batch_id (FK)            │         │ branch_id (FK)           │
│ subject                  │         │ batch_id (FK) nullable   │
│ title                    │         │ title                    │
│ file_url (VPS)           │         │ content                  │
│ file_type                │         │ posted_by (FK→users)     │
│ (PDF/PPT/DOC/ZIP)        │         │ is_active                │
│ uploaded_by (FK→users)   │         │ created_at               │
│ is_active                │         └──────────────────────────┘
│ created_at               │
└──────────────────────────┘

┌──────────────────────────┐         ┌──────────────────────────┐
│         ebooks           │         │    video_watch_progress  │
├──────────────────────────┤         ├──────────────────────────┤
│ id (PK)                  │         │ id (PK)                  │
│ branch_id (FK)           │         │ video_id (FK)            │
│ batch_id (FK) nullable   │         │ student_id (FK)          │
│ title                    │         │ watched_seconds          │
│ author                   │         │ is_completed             │
│ file_url (VPS)           │         │ last_watched_at          │
│ cover_image_url          │         └──────────────────────────┘
│ uploaded_by (FK→users)   │
│ is_active                │
│ created_at               │
└──────────────────────────┘
```

---

## API Endpoints

### Video Library
```
POST   /api/v1/lms/videos                         → Upload video
GET    /api/v1/lms/videos                         → List videos (with filters)
GET    /api/v1/lms/videos/:id                     → Get video detail
PUT    /api/v1/lms/videos/:id                     → Update video
DELETE /api/v1/lms/videos/:id                     → Delete video
POST   /api/v1/lms/videos/:id/progress            → Update watch progress
GET    /api/v1/lms/videos/:id/progress            → Get watch progress
```

### Live Classes
```
POST   /api/v1/lms/live-classes                   → Schedule live class
GET    /api/v1/lms/live-classes                   → List live classes
GET    /api/v1/lms/live-classes/:id               → Get live class detail
PUT    /api/v1/lms/live-classes/:id               → Update live class
DELETE /api/v1/lms/live-classes/:id               → Delete live class
PUT    /api/v1/lms/live-classes/:id/status        → Update status (Live/Done)
GET    /api/v1/lms/live-classes/upcoming          → Upcoming live classes
```

### Assignments
```
POST   /api/v1/lms/assignments                    → Create assignment
GET    /api/v1/lms/assignments                    → List assignments
GET    /api/v1/lms/assignments/:id                → Get assignment detail
PUT    /api/v1/lms/assignments/:id                → Update assignment
DELETE /api/v1/lms/assignments/:id                → Delete assignment
POST   /api/v1/lms/assignments/:id/submit         → Submit assignment (student)
GET    /api/v1/lms/assignments/:id/submissions    → List submissions (faculty)
PUT    /api/v1/lms/submissions/:id/grade          → Grade submission
```

### Study Materials
```
POST   /api/v1/lms/materials                      → Upload study material
GET    /api/v1/lms/materials                      → List materials (with filters)
GET    /api/v1/lms/materials/:id                  → Get material detail
PUT    /api/v1/lms/materials/:id                  → Update material
DELETE /api/v1/lms/materials/:id                  → Delete material
```

### Notice Board
```
POST   /api/v1/lms/notices                        → Post notice
GET    /api/v1/lms/notices                        → List notices
GET    /api/v1/lms/notices/:id                    → Get notice detail
PUT    /api/v1/lms/notices/:id                    → Update notice
DELETE /api/v1/lms/notices/:id                    → Delete notice
```

### e-Books
```
POST   /api/v1/lms/ebooks                         → Upload e-book
GET    /api/v1/lms/ebooks                         → List e-books
GET    /api/v1/lms/ebooks/:id                     → Get e-book detail
PUT    /api/v1/lms/ebooks/:id                     → Update e-book
DELETE /api/v1/lms/ebooks/:id                     → Delete e-book
```

### Analytics
```
GET    /api/v1/analytics/lms/video-views          → Video view count report
GET    /api/v1/analytics/lms/assignment-completion → Assignment completion report
GET    /api/v1/analytics/lms/student-progress     → Student-wise LMS progress
GET    /api/v1/analytics/lms/live-class-attendance → Live class attendance report
```

---

## External Integrations

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        EXTERNAL INTEGRATIONS                             │
└─────────────────────────────────────────────────────────────────────────┘

  ┌─────────────────────┐
  │   Cloudinary +      │◄─── Video Upload ──  POST /api/v1/lms/videos
  │   Cloudflare CDN    │──── Stream Video ──► Secure CDN URL for playback
  │   (Video Storage)   │
  └─────────────────────┘

  ┌─────────────────────┐
  │   Zoom API /        │◄─── Create Meeting ─ POST /api/v1/lms/live-classes
  │   Jitsi / Agora.io  │──── Meeting Link ──► Shared with students
  │   (Live Class)      │──── Recording ─────► Saved to VPS after class
  └─────────────────────┘

  ┌─────────────────────┐
  │   Cloudinary        │◄─── File Upload ───  PDFs, PPTs, e-Books, Assignments
  │   (File Storage)    │──── Secure URL ────► Secure download for students
  └─────────────────────┘

  ┌─────────────────────┐
  │   Firebase Cloud    │◄─── Push Notif ────  New video / assignment / notice
  │   Messaging (FCM)   │                      (Mobile app push notification)
  └─────────────────────┘

  ┌─────────────────────┐
  │   SendGrid /        │◄─── Email Alert ───  New content / assignment due
  │   SMTP (Gmail)      │──── Live Class ────► Reminder email 30 min before
  └─────────────────────┘

  ┌─────────────────────┐
  │   Twilio / MSG91    │◄─── SMS Alert ─────  New assignment / live class
  │   (SMS Gateway)     │                      reminder to students
  └─────────────────────┘
```

---

## Technology Stack

### Backend
```
Node.js + Express.js
├── multer             → File upload handling
├── zoom-sdk / axios   → Zoom API integration
├── firebase-admin     → FCM push notifications
├── bull               → Job queue for notifications
├── node-cron          → Live class reminder scheduler
├── nodemailer         → Email notifications (SMTP)
├── twilio / msg91     → SMS notifications
└── express-validator  → Input validation
```

### Database
```
MySQL 8.0+
├── lms_videos table
├── live_classes table
├── assignments table
├── assignment_submissions table
├── lms_materials table
├── notice_board table
├── ebooks table
└── video_watch_progress table

Redis
├── Live class reminder job queue
├── Assignment due reminder queue
└── Video streaming session cache
```

### File Storage & Streaming
```
Hostinger VPS + Cloudflare CDN
├── /var/www/upsurgeerp/uploads/lms-videos/          → Lecture video files
├── /var/www/upsurgeerp/uploads/lms-materials/       → PDFs, PPTs, DOCs
├── /var/www/upsurgeerp/uploads/lms-ebooks/          → e-Book PDF files
├── /var/www/upsurgeerp/uploads/lms-assignments/     → Assignment attachments
├── /var/www/upsurgeerp/uploads/lms-submissions/     → Student submission files
└── /var/www/upsurgeerp/uploads/live-recordings/     → Live class recordings
```

---

## Module Breakdown

### 1. Live Classroom Integration

#### Features:
- Schedule live class with date, time, duration, platform
- Zoom / Jitsi / Agora.io integration
- Auto-generate meeting link
- Notify students via SMS, Email, App (30 min before)
- Join link on student portal and mobile app
- Live class recording saved to VPS after class
- Recording available in video library
- Live class attendance tracking

---

### 2. Video Library

#### Features:
- Upload lecture videos (stored on VPS local storage)
- Stream via Cloudflare CDN (fast, secure)
- Subject-wise and batch-wise organization
- Video thumbnail auto-generated
- Watch progress tracking per student
- Resume from last watched position
- Video search by title / subject
- Faculty can restrict access by batch

---

### 3. Assignments Management

#### Features:
- Create assignments with title, description, due date, max marks
- Attach reference files (PDF, DOC, etc.)
- Publish to specific batch
- Students submit via portal or app (text or file)
- Faculty reviews and grades submissions
- Marks and feedback visible to student
- Late submission tracking
- Assignment completion report

---

### 4. Study Materials (Multiple Attachments)

#### Features:
- Upload PDFs, PPTs, DOCs, ZIP files
- Subject-wise and batch-wise organization
- Secure download via VPS secure API endpoints
- Multiple files per subject
- Faculty can update or delete materials
- Students notified on new material upload

---

### 5. Notice Board

#### Features:
- Post notices for specific batch or all students
- Notice title and rich text content
- Active / inactive toggle
- Notices visible on student portal and app
- Push notification on new notice
- Notice history maintained

---

### 6. e-Books Management

#### Features:
- Upload e-books (PDF format)
- Cover image upload
- Author and title metadata
- Batch-specific or institute-wide access
- Secure PDF viewer in browser / app
- Download option (optional, controlled by admin)
- e-Book library searchable by title / author

---

## Security Implementation

```
1. Content Access Control
   - Students access only content for their enrolled batch
   - Faculty manages content for assigned batches only
   - Admin manages all content across branches

2. Video Security
   - Videos stored on private VPS directory
   - Streamed via Cloudflare signed URLs (expire in 2 hours)
   - No direct file path exposed to students

3. File Security
   - All files on private VPS directory
   - Access via secure API endpoints with JWT authentication
   - Assignment submissions accessible only to faculty and student

4. Live Class Security
   - Meeting links generated per class (not reusable)
   - Zoom webhook verifies meeting events
   - Recording access restricted to enrolled students

5. API Security
   - JWT authentication on all endpoints
   - Role-based permission check
   - Rate limiting on file upload APIs
```

---

## Development Timeline

### Week 1: Video Library & Study Materials
- [ ] Create lms_videos, lms_materials, video_watch_progress tables
- [ ] Video upload API (Multer + VPS Local Storage)
- [ ] Cloudflare signed URL generation
- [ ] Video CRUD APIs
- [ ] Watch progress tracking API
- [ ] Study material upload & CRUD APIs
- [ ] Batch-wise content filtering

### Week 2: Live Classes & Notice Board
- [ ] Create live_classes, notice_board tables
- [ ] Zoom API integration (create/delete meeting)
- [ ] Live class CRUD APIs
- [ ] Live class reminder cron job (30 min before)
- [ ] SMS + Email + FCM push notification
- [ ] Notice board CRUD APIs
- [ ] Push notification on new notice

### Week 3: Assignments & e-Books
- [ ] Create assignments, assignment_submissions, ebooks tables
- [ ] Assignment CRUD APIs
- [ ] Assignment submission API (file + text)
- [ ] Grading API with feedback
- [ ] Assignment due reminder cron job
- [ ] e-Book upload & CRUD APIs
- [ ] Secure PDF viewer integration

### Week 4: Analytics & Testing
- [ ] Video view count report API
- [ ] Assignment completion report API
- [ ] Student-wise LMS progress API
- [ ] Live class attendance report
- [ ] Unit & integration tests
- [ ] Performance optimization (CDN caching)

---

## Testing Strategy

```javascript
// Example: LMS Module Tests
describe('e-Learning / LMS Module', () => {
  test('Upload video and get streaming URL', async () => {
    const response = await request(app)
      .post('/api/v1/lms/videos')
      .set('Authorization', `Bearer ${facultyToken}`)
      .send({
        title: 'JavaScript Basics',
        subject: 'JavaScript',
        batch_id: 1,
        video_url: 'https://yourdomain.com/uploads/lms-videos/video.mp4'
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
  });

  test('Schedule live class and get meeting link', async () => {
    const response = await request(app)
      .post('/api/v1/lms/live-classes')
      .set('Authorization', `Bearer ${facultyToken}`)
      .send({
        title: 'React Hooks Deep Dive',
        batch_id: 1,
        scheduled_at: '2026-10-01T10:00:00',
        duration_minutes: 90,
        platform: 'Zoom'
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('meeting_link');
  });

  test('Student submits assignment', async () => {
    const response = await request(app)
      .post('/api/v1/lms/assignments/1/submit')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        submission_text: 'My assignment answer here',
        file_url: 'https://yourdomain.com/uploads/lms-submissions/submission.pdf'
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
  });

  test('Faculty grades assignment submission', async () => {
    const response = await request(app)
      .put('/api/v1/lms/submissions/1/grade')
      .set('Authorization', `Bearer ${facultyToken}`)
      .send({
        marks_obtained: 18,
        feedback: 'Good work, improve explanation.'
      });

    expect(response.status).toBe(200);
    expect(response.body.marks_obtained).toBe(18);
  });
});
```

---

## Deployment Notes

```
Environment Variables Required:

# Cloudflare CDN (for video streaming)
CLOUDFLARE_ZONE_ID=your_zone_id
CLOUDFLARE_API_TOKEN=your_token

# Zoom API
ZOOM_API_KEY=<api_key>
ZOOM_API_SECRET=<api_secret>
ZOOM_WEBHOOK_SECRET=<webhook_secret>

# Firebase (Push Notifications)
FIREBASE_PROJECT_ID=<project_id>
FIREBASE_PRIVATE_KEY=<private_key>
FIREBASE_CLIENT_EMAIL=<client_email>

# SMS
TWILIO_ACCOUNT_SID=<sid>
TWILIO_AUTH_TOKEN=<token>
TWILIO_FROM_NUMBER=+1xxxxxxxxxx

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=noreply@upsurgeerp.com

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
```

---

## Deliverables

1. ✅ Video Library with Hostinger VPS + Cloudflare CDN Streaming
2. ✅ Watch Progress Tracking with Resume Feature
3. ✅ Live Classroom Integration (Zoom / Jitsi / Agora)
4. ✅ Live Class Recording Saved to VPS
5. ✅ Assignments with Submission, Grading & Feedback
6. ✅ Study Materials Upload (PDF, PPT, DOC, ZIP)
7. ✅ Notice Board with Push Notifications
8. ✅ e-Books Management with Secure PDF Viewer
9. ✅ LMS Analytics (Video Views, Assignment Completion, Student Progress)
10. ✅ API Documentation (Swagger)
11. ✅ Unit & Integration Tests

---

## Success Metrics

- [ ] Video streaming start time < 3 seconds (via CDN)
- [ ] File upload success rate > 99%
- [ ] Live class meeting link generated < 2 seconds
- [ ] Push notification delivered < 30 seconds
- [ ] Assignment submission success rate > 99%
- [ ] LMS content load time < 1 second
- [ ] All APIs response time < 200ms

---

**Document Version:** 1.0
**Phase:** 7 - e-Learning / LMS Module
**Duration:** Months 10-11
**Prepared By:** Development Team
