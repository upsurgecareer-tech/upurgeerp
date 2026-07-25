# UpsurgeERP - Phase 8: Student & Parent Portal

**Duration:** Month 12
**Status:** Student & Parent Portal Phase

---

## Overview

Phase 8 delivers complete Student & Parent Portal (Web-based) for UpsurgeERP. Students and parents can access batch details, attendance records, fee status, exam results, LMS resources, and communicate with faculty through online chat.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      STUDENT & PARENT PORTAL                             │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                          ACCESS POINTS                                   │
├──────────────────────────┬──────────────────────────────────────────────┤
│   Student Portal         │   Parent Portal                              │
│   (Web Interface)        │   (Web Interface)                            │
└────────────┬─────────────┴────────────┬─────────────────────────────────┘
             │                          │
             └──────────────┬───────────┘
                            │
                            ▼
              ┌─────────────────────────┐
              │   API Gateway           │
              │   (REST API)            │
              └────────────┬────────────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
         ▼                 ▼                 ▼
┌─────────────────┐ ┌─────────────┐ ┌─────────────────┐
│ Authentication  │ │ Portal      │ │ Content         │
│ Service         │ │ Services    │ │ Delivery        │
│ (JWT)           │ │             │ │ (CDN)           │
└─────────────────┘ └─────────────┘ └─────────────────┘
         │                 │                 │
         └─────────────────┼─────────────────┘
                           │
                           ▼
                  ┌────────────────┐
                  │   PostgreSQL   │
                  │   Database     │
                  └────────────────┘
```

---

## Student Portal Features

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       STUDENT PORTAL FEATURES                            │
└─────────────────────────────────────────────────────────────────────────┘

✓ Batch Details View
  - Current Batch Information
  - Subject List
  - Faculty Details
  - Timetable

✓ Attendance Records
  - Daily Attendance
  - Monthly Summary
  - Subject-wise Attendance
  - Attendance Percentage
  - Calendar View

✓ Fee Status & Receipts
  - Total Fee Details
  - Paid Amount
  - Pending Amount
  - Payment History
  - Download Receipts (PDF)
  - Online Payment Option

✓ Exam Schedules & Results
  - Upcoming Exams
  - Exam Timetable
  - Results & Marks
  - Rank/Position
  - Report Card Download
  - Performance Analysis

✓ LMS Resources Access
  - Video Library
  - Study Materials
  - Assignments (View & Submit)
  - e-Books
  - Live Class Links
  - Notice Board

✓ Online Chat
  - Chat with Faculty
  - Group Chat (Batch-wise)
  - File Sharing
  - Notification Alerts
```

---

## Parent Portal Features

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       PARENT PORTAL FEATURES                             │
└─────────────────────────────────────────────────────────────────────────┘

✓ Child's Profile View
  - Student Details
  - Batch Information
  - Contact Details

✓ Attendance Monitoring
  - Daily Attendance Status
  - Monthly Report
  - Low Attendance Alerts
  - Absence Notifications

✓ Fee Management
  - Fee Summary
  - Payment History
  - Pending Dues
  - Online Payment
  - Receipt Download

✓ Academic Performance
  - Exam Results
  - Progress Reports
  - Subject-wise Performance
  - Teacher Feedback

✓ Communication
  - Chat with Faculty
  - View Notices
  - Event Notifications
  - Parent-Teacher Meeting Schedule

✓ Transport Tracking (If applicable)
  - Route Details
  - Vehicle Information
  - Driver Contact
```

---

## Login Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         LOGIN FLOW                                       │
└─────────────────────────────────────────────────────────────────────────┘

  User Opens Portal
          │
          ▼
  ┌───────────────────┐
  │  Select Role      │
  │  - Student        │
  │  - Parent         │
  └────────┬──────────┘
           │
           ▼
  ┌───────────────────┐
  │  Login Screen     │
  │  - Username/      │
  │    Enrollment No  │
  │  - Password       │
  │  - Branch Select  │
  └────────┬──────────┘
           │
           ▼
  ┌───────────────────┐
  │  Authenticate     │──── JWT Token Generated
  │                   │──── Session Created
  └────────┬──────────┘
           │
           ▼
  ┌───────────────────┐
  │  Dashboard        │
  │  - Quick Stats    │
  │  - Recent Updates │
  │  - Notifications  │
  │  - Quick Links    │
  └───────────────────┘
```

---

## Student Dashboard

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       STUDENT DASHBOARD                                  │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│  Welcome, [Student Name]                          [Profile Photo]    │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐       │
│  │  Attendance    │  │  Pending Fees  │  │  Assignments   │       │
│  │     85%        │  │   ₹5,000       │  │   3 Pending    │       │
│  └────────────────┘  └────────────────┘  └────────────────┘       │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Recent Notices                                              │  │
│  │  • Holiday on 15th Jan - Republic Day                        │  │
│  │  • Exam Schedule Released                                    │  │
│  │  • New Assignment Posted - Mathematics                       │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Upcoming Events                                             │  │
│  │  • Mid-term Exam - 20th Jan                                  │  │
│  │  • Live Class - Physics - Today 3:00 PM                      │  │
│  │  • Assignment Due - Chemistry - 18th Jan                     │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  Quick Links:                                                        │
│  [My Batch] [Attendance] [Fees] [Exams] [LMS] [Chat]               │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Attendance View Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        ATTENDANCE VIEW FLOW                              │
└─────────────────────────────────────────────────────────────────────────┘

  Student Clicks Attendance
          │
          ▼
  ┌───────────────────┐
  │  View Options     │
  │  - Today          │
  │  - This Month     │
  │  - Date Range     │
  │  - Subject-wise   │
  └────────┬──────────┘
           │
           ▼
  ┌───────────────────┐
  │  Display Summary  │
  │  - Total Days     │
  │  - Present: 85    │
  │  - Absent: 15     │
  │  - Percentage: 85%│
  └────────┬──────────┘
           │
           ▼
  ┌───────────────────┐
  │  Calendar View    │
  │  - Green: Present │
  │  - Red: Absent    │
  │  - Grey: Holiday  │
  └────────┬──────────┘
           │
           ▼
  ┌───────────────────┐
  │  Subject-wise     │
  │  Breakdown        │
  │  - Math: 85%      │
  │  - Physics: 90%   │
  │  - Chemistry: 80% │
  │  - English: 88%   │
  └───────────────────┘
```

---

## Fee Payment Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         FEE PAYMENT FLOW                                 │
└─────────────────────────────────────────────────────────────────────────┘

  Student/Parent Opens Fee Section
          │
          ▼
  ┌───────────────────┐
  │  Fee Summary      │
  │  - Total Fee      │
  │    ₹50,000        │
  │  - Paid Amount    │
  │    ₹30,000        │
  │  - Pending        │
  │    ₹20,000        │
  │  - Due Date       │
  │    31st Jan       │
  └────────┬──────────┘
           │
           ▼
  ┌───────────────────┐
  │  Payment History  │
  │  - 1st Inst: Paid │
  │  - 2nd Inst: Paid │
  │  - 3rd Inst: Pend │
  └────────┬──────────┘
           │
           ▼
  ┌───────────────────┐
  │  Pay Now          │
  │  - Select Amount  │
  │  - Full/Partial   │
  └────────┬──────────┘
           │
           ▼
  ┌───────────────────┐
  │  Payment Gateway  │
  │  - Razorpay       │
  │  - UPI            │
  │  - Card           │
  │  - Net Banking    │
  └────────┬──────────┘
           │
           ▼
  ┌───────────────────┐        ┌──────────────────────────┐
  │  Payment Success  │───────►│  Receipt Generated       │
  │                   │        │  - Download PDF          │
  └────────┬──────────┘        │  - Email Sent            │
           │                   └──────────────────────────┘
           ▼
  ┌───────────────────┐
  │  Fee Status       │
  │  Updated          │──── Pending Amount Reduced
  └───────────────────┘
```

---

## LMS Access Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         LMS ACCESS FLOW                                  │
└─────────────────────────────────────────────────────────────────────────┘

  Student Opens LMS
          │
          ▼
  ┌───────────────────┐
  │  LMS Dashboard    │
  │  - Videos         │
  │  - Assignments    │
  │  - e-Books        │
  │  - Live Classes   │
  │  - Study Material │
  └────────┬──────────┘
           │
           ▼
  ┌───────────────────┐
  │  Select Resource  │
  │  Type             │
  └────────┬──────────┘
           │
           ├──────────► Video Library
           │            - Browse by Subject
           │            - Watch Video
           │            - Track Progress
           │
           ├──────────► Assignments
           │            - View Pending
           │            - Download PDF
           │            - Submit Answer
           │            - Check Results
           │
           ├──────────► e-Books
           │            - Browse Catalog
           │            - Read Online
           │            - Download PDF
           │
           └──────────► Live Classes
                        - View Schedule
                        - Join Live Class
                        - Access Recordings
```

---

## Online Chat Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         ONLINE CHAT FLOW                                 │
└─────────────────────────────────────────────────────────────────────────┘

  Student Opens Chat
          │
          ▼
  ┌───────────────────┐
  │  Chat Options     │
  │  - Faculty Chat   │
  │  - Batch Group    │
  │  - Support        │
  └────────┬──────────┘
           │
           ▼
  ┌───────────────────┐
  │  Select           │
  │  Conversation     │
  └────────┬──────────┘
           │
           ▼
  ┌───────────────────┐
  │  Chat Window      │
  │  - Message List   │
  │  - Type Message   │
  │  - Send File      │
  │  - Emoji          │
  └────────┬──────────┘
           │
           ▼
  ┌───────────────────┐        ┌──────────────────────────┐
  │  Send Message     │───────►│  Real-time Delivery      │
  │                   │        │  (Socket.io)             │
  └────────┬──────────┘        └──────────────────────────┘
           │
           ▼
  ┌───────────────────┐        ┌──────────────────────────┐
  │  Notification     │───────►│  Recipient Notified      │
  │  Sent             │        │  (Email/Browser)         │
  └───────────────────┘        └──────────────────────────┘
```

---

## Database Schema

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            DATABASE SCHEMA                               │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────┐         ┌──────────────────────────┐
│    portal_sessions       │         │   portal_notifications   │
├──────────────────────────┤         ├──────────────────────────┤
│ id (PK)                  │         │ id (PK)                  │
│ user_id (FK)             │         │ user_id (FK)             │
│ user_type                │         │ user_type                │
│ (Student/Parent)         │         │ (Student/Parent)         │
│ jwt_token                │         │ title                    │
│ ip_address               │         │ message                  │
│ browser_info             │         │ type                     │
│ last_active              │         │ (Fee/Exam/Notice/Chat)   │
│ created_at               │         │ is_read                  │
└──────────────────────────┘         │ sent_at                  │
                                     │ read_at                  │
┌──────────────────────────┐         └──────────────────────────┘
│    parent_students       │
├──────────────────────────┤         ┌──────────────────────────┐
│ id (PK)                  │         │    chat_messages         │
│ parent_id (FK→users)     │         ├──────────────────────────┤
│ student_id (FK→students) │         │ id (PK)                  │
│ relationship             │         │ sender_id (FK)           │
│ (Father/Mother/Guardian) │         │ sender_type              │
│ is_primary               │         │ (Student/Faculty/Parent) │
│ created_at               │         │ receiver_id (FK)         │
└──────────────────────────┘         │ receiver_type            │
                                     │ message_text             │
┌──────────────────────────┐         │ attachment_url           │
│   portal_activity_log    │         │ is_read                  │
├──────────────────────────┤         │ sent_at                  │
│ id (PK)                  │         │ read_at                  │
│ user_id (FK)             │         └──────────────────────────┘
│ user_type                │
│ (Student/Parent)         │         ┌──────────────────────────┐
│ activity_type            │         │    chat_groups           │
│ (Login/View/Download)    │         ├──────────────────────────┤
│ module                   │         │ id (PK)                  │
│ (Attendance/Fee/LMS)     │         │ group_name               │
│ ip_address               │         │ batch_id (FK)            │
│ created_at               │         │ created_by (FK→users)    │
└──────────────────────────┘         │ is_active                │
                                     │ created_at               │
                                     └──────────────────────────┘
```

---

## API Endpoints

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           API ENDPOINTS                                  │
└─────────────────────────────────────────────────────────────────────────┘

Authentication:
POST   /api/portal/login
POST   /api/portal/logout
POST   /api/portal/forgot-password
POST   /api/portal/reset-password

Student Portal:
GET    /api/portal/student/dashboard
GET    /api/portal/student/profile
GET    /api/portal/student/batch-details
GET    /api/portal/student/attendance
GET    /api/portal/student/fees
POST   /api/portal/student/fees/pay
GET    /api/portal/student/exams
GET    /api/portal/student/results
GET    /api/portal/student/lms/videos
GET    /api/portal/student/lms/assignments
POST   /api/portal/student/lms/assignments/submit
GET    /api/portal/student/notices

Parent Portal:
GET    /api/portal/parent/dashboard
GET    /api/portal/parent/children
GET    /api/portal/parent/child/:id/attendance
GET    /api/portal/parent/child/:id/fees
POST   /api/portal/parent/child/:id/fees/pay
GET    /api/portal/parent/child/:id/results
GET    /api/portal/parent/child/:id/performance

Chat:
GET    /api/portal/chat/conversations
GET    /api/portal/chat/messages/:conversationId
POST   /api/portal/chat/send
PUT    /api/portal/chat/messages/:id/read

Notifications:
GET    /api/portal/notifications
PUT    /api/portal/notifications/:id/read
PUT    /api/portal/notifications/read-all
```

---

## Security Features

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         SECURITY FEATURES                                │
└─────────────────────────────────────────────────────────────────────────┘

✓ JWT Token Authentication
✓ Session Management
✓ Password Encryption (bcrypt)
✓ Rate Limiting (API calls)
✓ SSL/TLS Encryption
✓ XSS Protection
✓ CSRF Protection
✓ SQL Injection Prevention
✓ Input Validation
✓ Auto Logout on Inactivity (30 min)
✓ IP Tracking
✓ Activity Logging
✓ Secure File Upload/Download
```

---

## Tech Stack

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            TECH STACK                                    │
└─────────────────────────────────────────────────────────────────────────┘

Frontend:
- Framework: React.js / Vue.js / Angular
- State Management: Redux / Vuex
- UI Library: Material-UI / Ant Design / Bootstrap
- Charts: Chart.js / Recharts
- Real-time: Socket.io Client

Backend:
- API: Node.js (Express) / Django REST
- Authentication: JWT / Passport.js
- Real-time: Socket.io
- File Storage: Hostinger VPS Local Storage
- CDN: Cloudflare
- Database: MySQL 8.0+
- Cache: Redis

Payment:
- Gateway: Razorpay / Stripe / PayU
- Webhook Handling

Notifications:
- Email: SendGrid / SMTP (Hostinger)
- SMS: Twilio / MSG91 (Optional)
```

---

## Implementation Checklist

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      IMPLEMENTATION CHECKLIST                            │
└─────────────────────────────────────────────────────────────────────────┘

Week 1-2: Setup & Authentication
□ Project setup (Frontend + Backend)
□ Login/Logout system
□ JWT implementation
□ Session management
□ Password reset flow

Week 3-4: Student Portal Core
□ Dashboard design
□ Batch details view
□ Attendance module
□ Fee status & payment
□ Receipt download

Week 5-6: Student Portal Advanced
□ Exam results view
□ LMS integration
□ Assignment submission
□ Video access
□ Notice board

Week 7-8: Parent Portal
□ Parent dashboard
□ Child selection
□ Attendance monitoring
□ Fee management
□ Performance view

Week 9-10: Chat & Notifications
□ Real-time chat (Socket.io)
□ File sharing
□ Notification system
□ Email alerts

Week 11-12: Testing & Deployment
□ Unit testing
□ Integration testing
□ Security testing
□ Performance optimization
□ Production deployment
□ User training
□ Documentation
```

---

## Success Metrics

- Portal login rate: >90%
- Daily active users: >70%
- Page load time: <2 seconds
- API response time: <500ms
- Payment success rate: >95%
- Chat message delivery: <1 second
- User satisfaction: >4.5/5

---

**Phase 8 Complete: Student & Parent Portal Ready for Production**
