# UpsurgeERP - Phase 10: Communication & Notifications

**Duration:** Month 15
**Status:** Communication & Notifications Phase

---

## Overview

Phase 10 delivers comprehensive Communication & Notifications system for UpsurgeERP. It handles bulk SMS, bulk email, automated reminders, digital notice board, and multi-channel notification delivery for students, parents, and staff.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                  COMMUNICATION & NOTIFICATIONS SYSTEM                    │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                          COMMUNICATION CHANNELS                          │
├──────────────┬──────────────┬──────────────┬───────────────────────────┤
│   Bulk SMS   │  Bulk Email  │   WhatsApp   │   Push Notifications      │
└──────┬───────┴──────┬───────┴──────┬───────┴──────┬────────────────────┘
       │              │              │              │
       └──────────────┴──────────────┴──────────────┘
                      │
                      ▼
      ┌───────────────────────────────────┐
      │   Notification Processing Engine  │
      │   - Template Management           │
      │   - Recipient Filtering           │
      │   - Scheduling                    │
      │   - Queue Management              │
      │   - Delivery Tracking             │
      └───────────────┬───────────────────┘
                      │
      ┌───────────────┼───────────────┐
      │               │               │
      ▼               ▼               ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│   Twilio    │ │  SendGrid   │ │   Redis     │
│   MSG91     │ │  SendGrid   │ │   Queue     │
│   (SMS)     │ │   (Email)   │ │   (Jobs)    │
└─────────────┘ └─────────────┘ └─────────────┘
       │              │              │
       └──────────────┴──────────────┘
                      │
                      ▼
              ┌───────────────┐
              │  PostgreSQL   │
              │  (Logs & DB)  │
              └───────────────┘
```

---

## Module 1: Bulk SMS System

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         BULK SMS SYSTEM                                  │
└─────────────────────────────────────────────────────────────────────────┘

Features:
✓ Send SMS to Students/Parents/Staff
✓ Template-based Messaging
✓ Dynamic Variable Replacement
✓ Recipient Filtering (Batch/Course/Custom)
✓ Schedule SMS for Future
✓ Delivery Status Tracking
✓ Failed SMS Retry
✓ SMS Credit Management
✓ Unicode Support (Regional Languages)
```

### SMS Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         BULK SMS FLOW                                    │
└─────────────────────────────────────────────────────────────────────────┘

  Admin Opens SMS Module
          │
          ▼
  ┌───────────────────┐
  │  Select Template  │
  │  or Create New    │
  │  - Fee Reminder   │
  │  - Exam Alert     │
  │  - Holiday Notice │
  │  - Custom         │
  └────────┬──────────┘
           │
           ▼
  ┌───────────────────┐
  │  Compose Message  │
  │  - Message Text   │
  │  - Variables      │
  │    {name}         │
  │    {amount}       │
  │    {date}         │
  └────────┬──────────┘
           │
           ▼
  ┌───────────────────┐
  │  Select           │
  │  Recipients       │
  │  - All Students   │
  │  - By Batch       │
  │  - By Course      │
  │  - Custom List    │
  │  - Fee Defaulters │
  └────────┬──────────┘
           │
           ▼
  ┌───────────────────┐
  │  Preview          │
  │  - Total Count    │
  │  - Sample Message │
  │  - Cost Estimate  │
  └────────┬──────────┘
           │
           ▼
  ┌───────────────────┐
  │  Schedule         │
  │  - Send Now       │
  │  - Schedule Later │
  │  - Recurring      │
  └────────┬──────────┘
           │
           ▼
  ┌───────────────────┐        ┌──────────────────────────┐
  │  Queue SMS        │───────►│  Background Job          │
  │  for Sending      │        │  (Bull Queue)            │
  └────────┬──────────┘        └──────────────────────────┘
           │
           ▼
  ┌───────────────────┐        ┌──────────────────────────┐
  │  Send via Gateway │───────►│  Twilio / MSG91          │
  │                   │        │  API Call                │
  └────────┬──────────┘        └──────────────────────────┘
           │
           ▼
  ┌───────────────────┐
  │  Track Delivery   │
  │  - Sent           │
  │  - Delivered      │
  │  - Failed         │
  │  - Pending        │
  └────────┬──────────┘
           │
           ▼
  ┌───────────────────┐        ┌──────────────────────────┐
  │  Retry Failed     │───────►│  Auto Retry (3 attempts) │
  │  Messages         │        │                          │
  └───────────────────┘        └──────────────────────────┘
```

### SMS Database Schema

```
┌──────────────────────────┐         ┌──────────────────────────┐
│    sms_templates         │         │      sms_campaigns       │
├──────────────────────────┤         ├──────────────────────────┤
│ id (PK)                  │         │ id (PK)                  │
│ branch_id (FK)           │         │ branch_id (FK)           │
│ template_name            │         │ template_id (FK)         │
│ template_code            │         │ campaign_name            │
│ message_text             │         │ message_text             │
│ variables (JSON)         │         │ recipient_type           │
│ category                 │         │ (Student/Parent/Staff)   │
│ (Fee/Exam/Notice/Other)  │         │ recipient_filter (JSON)  │
│ is_active                │         │ total_recipients         │
│ created_at               │         │ scheduled_at             │
└──────────────────────────┘         │ status                   │
                                     │ (Draft/Queued/Sent)      │
┌──────────────────────────┐         │ created_by (FK→users)    │
│      sms_logs            │         │ created_at               │
├──────────────────────────┤         └──────────────────────────┘
│ id (PK)                  │
│ campaign_id (FK)         │         ┌──────────────────────────┐
│ recipient_id (FK)        │         │    sms_credits           │
│ recipient_type           │         ├──────────────────────────┤
│ phone_number             │         │ id (PK)                  │
│ message_text             │         │ branch_id (FK)           │
│ gateway                  │         │ total_credits            │
│ (Twilio/MSG91)           │         │ used_credits             │
│ gateway_message_id       │         │ remaining_credits        │
│ status                   │         │ last_recharge_date       │
│ (Sent/Delivered/Failed)  │         │ last_recharge_amount     │
│ sent_at                  │         │ updated_at               │
│ delivered_at             │         └──────────────────────────┘
│ error_message            │
│ retry_count              │
│ created_at               │
└──────────────────────────┘
```

---

## Module 2: Bulk Email System

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         BULK EMAIL SYSTEM                                │
└─────────────────────────────────────────────────────────────────────────┘

Features:
✓ HTML Email Templates
✓ Rich Text Editor
✓ Attachment Support (PDF, Images)
✓ Personalized Emails
✓ Recipient Filtering
✓ Schedule Emails
✓ Email Tracking (Open/Click)
✓ Bounce Handling
✓ Unsubscribe Management
```

### Email Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         BULK EMAIL FLOW                                  │
└─────────────────────────────────────────────────────────────────────────┘

  Admin Opens Email Module
          │
          ▼
  ┌───────────────────┐
  │  Select Template  │
  │  or Create New    │
  │  - Fee Receipt    │
  │  - Exam Results   │
  │  - Newsletter     │
  │  - Custom         │
  └────────┬──────────┘
           │
           ▼
  ┌───────────────────┐
  │  Compose Email    │
  │  - Subject        │
  │  - Body (HTML)    │
  │  - Variables      │
  │  - Attachments    │
  └────────┬──────────┘
           │
           ▼
  ┌───────────────────┐
  │  Select           │
  │  Recipients       │
  │  - All Students   │
  │  - By Batch       │
  │  - Parents        │
  │  - Staff          │
  │  - Custom List    │
  └────────┬──────────┘
           │
           ▼
  ┌───────────────────┐
  │  Preview          │
  │  - Sample Email   │
  │  - Total Count    │
  │  - Test Send      │
  └────────┬──────────┘
           │
           ▼
  ┌───────────────────┐
  │  Schedule         │
  │  - Send Now       │
  │  - Schedule Later │
  └────────┬──────────┘
           │
           ▼
  ┌───────────────────┐        ┌──────────────────────────┐
  │  Queue Emails     │───────►│  Background Job          │
  │  for Sending      │        │  (Bull Queue)            │
  └────────┬──────────┘        └──────────────────────────┘
           │
           ▼
  ┌───────────────────┐        ┌──────────────────────────┐
  │  Send via Gateway │───────►│  SendGrid / SMTP         │
  │                   │        │  API Call                │
  └────────┬──────────┘        └──────────────────────────┘
           │
           ▼
  ┌───────────────────┐
  │  Track Delivery   │
  │  - Sent           │
  │  - Opened         │
  │  - Clicked        │
  │  - Bounced        │
  │  - Failed         │
  └───────────────────┘
```

### Email Database Schema

```
┌──────────────────────────┐         ┌──────────────────────────┐
│    email_templates       │         │    email_campaigns       │
├──────────────────────────┤         ├──────────────────────────┤
│ id (PK)                  │         │ id (PK)                  │
│ branch_id (FK)           │         │ branch_id (FK)           │
│ template_name            │         │ template_id (FK)         │
│ template_code            │         │ campaign_name            │
│ subject                  │         │ subject                  │
│ body_html                │         │ body_html                │
│ body_text                │         │ recipient_type           │
│ variables (JSON)         │         │ recipient_filter (JSON)  │
│ category                 │         │ total_recipients         │
│ is_active                │         │ scheduled_at             │
│ created_at               │         │ status                   │
└──────────────────────────┘         │ (Draft/Queued/Sent)      │
                                     │ created_by (FK→users)    │
┌──────────────────────────┐         │ created_at               │
│      email_logs          │         └──────────────────────────┘
├──────────────────────────┤
│ id (PK)                  │         ┌──────────────────────────┐
│ campaign_id (FK)         │         │  email_attachments       │
│ recipient_id (FK)        │         ├──────────────────────────┤
│ recipient_type           │         │ id (PK)                  │
│ email_address            │         │ campaign_id (FK)         │
│ subject                  │         │ file_name                │
│ body_html                │         │ file_url (VPS)           │
│ gateway                  │         │ file_size                │
│ (SendGrid/SMTP)          │         │ created_at               │
│ gateway_message_id       │         └──────────────────────────┘
│ status                   │
│ (Sent/Opened/Clicked/    │         ┌──────────────────────────┐
│  Bounced/Failed)         │         │   email_unsubscribes     │
│ sent_at                  │         ├──────────────────────────┤
│ opened_at                │         │ id (PK)                  │
│ clicked_at               │         │ email_address            │
│ bounced_at               │         │ user_id (FK)             │
│ error_message            │         │ user_type                │
│ created_at               │         │ reason                   │
└──────────────────────────┘         │ unsubscribed_at          │
                                     └──────────────────────────┘
```

---

## Module 3: Automated Reminders

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       AUTOMATED REMINDERS                                │
└─────────────────────────────────────────────────────────────────────────┘

Features:
✓ Fee Payment Reminders
✓ Exam Schedule Reminders
✓ Assignment Due Reminders
✓ Attendance Low Alert
✓ Birthday Wishes
✓ Holiday Notifications
✓ Library Book Return Reminders
✓ Custom Recurring Reminders
```

### Automated Reminder Types

```
┌──────────────────────────────────────────────────────────────────────┐
│                      REMINDER TYPES                                  │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│ 1. Fee Payment Reminders                                            │
│    - 7 days before due date                                         │
│    - 3 days before due date                                         │
│    - On due date                                                    │
│    - 3 days after due date (overdue)                                │
│                                                                      │
│ 2. Exam Reminders                                                   │
│    - 1 week before exam                                             │
│    - 1 day before exam                                              │
│    - Exam day morning                                               │
│                                                                      │
│ 3. Assignment Reminders                                             │
│    - 3 days before due date                                         │
│    - 1 day before due date                                          │
│    - On due date                                                    │
│                                                                      │
│ 4. Attendance Alerts                                                │
│    - When attendance drops below 75%                                │
│    - Weekly attendance summary (every Monday)                       │
│                                                                      │
│ 5. Library Reminders                                                │
│    - 2 days before book return date                                 │
│    - On return date                                                 │
│    - Overdue notification                                           │
│                                                                      │
│ 6. Birthday Wishes                                                  │
│    - Student birthday (morning 9 AM)                                │
│    - Staff birthday (morning 9 AM)                                  │
│                                                                      │
│ 7. Event Reminders                                                  │
│    - 1 day before event                                             │
│    - Event day morning                                              │
└──────────────────────────────────────────────────────────────────────┘
```

### Reminder Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      AUTOMATED REMINDER FLOW                             │
└─────────────────────────────────────────────────────────────────────────┘

  Cron Job Runs (Every Hour)
          │
          ▼
  ┌───────────────────┐
  │  Check Scheduled  │
  │  Reminders        │
  │  - Fee Due        │
  │  - Exam Date      │
  │  - Assignment     │
  │  - Attendance     │
  └────────┬──────────┘
           │
           ▼
  ┌───────────────────┐
  │  Fetch Recipients │
  │  Based on Trigger │
  │  Conditions       │
  └────────┬──────────┘
           │
           ▼
  ┌───────────────────┐
  │  Load Template    │
  │  & Replace        │
  │  Variables        │
  └────────┬──────────┘
           │
           ▼
  ┌───────────────────┐
  │  Queue            │
  │  Notifications    │
  │  - SMS            │
  │  - Email          │
  │  - Push           │
  └────────┬──────────┘
           │
           ▼
  ┌───────────────────┐        ┌──────────────────────────┐
  │  Send via         │───────►│  Gateway APIs            │
  │  Channels         │        │  (SMS/Email/Push)        │
  └────────┬──────────┘        └──────────────────────────┘
           │
           ▼
  ┌───────────────────┐
  │  Log Delivery     │
  │  Status           │
  └────────┬──────────┘
           │
           ▼
  ┌───────────────────┐
  │  Update Next      │
  │  Trigger Time     │
  │  (If Recurring)   │
  └───────────────────┘
```

### Reminder Database Schema

```
┌──────────────────────────┐         ┌──────────────────────────┐
│   automated_reminders    │         │    reminder_logs         │
├──────────────────────────┤         ├──────────────────────────┤
│ id (PK)                  │         │ id (PK)                  │
│ branch_id (FK)           │         │ reminder_id (FK)         │
│ reminder_name            │         │ recipient_id (FK)        │
│ reminder_type            │         │ recipient_type           │
│ (Fee/Exam/Assignment/    │         │ channel                  │
│  Attendance/Library/     │         │ (SMS/Email/Push)         │
│  Birthday/Event)         │         │ message_text             │
│ trigger_condition (JSON) │         │ status                   │
│ template_id (FK)         │         │ (Sent/Failed)            │
│ channels (JSON)          │         │ sent_at                  │
│ (SMS/Email/Push)         │         │ error_message            │
│ is_recurring             │         │ created_at               │
│ frequency                │         └──────────────────────────┘
│ (Daily/Weekly/Monthly)   │
│ is_active                │
│ last_run_at              │
│ next_run_at              │
│ created_at               │
└──────────────────────────┘
```

---

## Module 4: Digital Notice Board

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       DIGITAL NOTICE BOARD                               │
└─────────────────────────────────────────────────────────────────────────┘

Features:
✓ Create & Publish Notices
✓ Category-wise Notices (Academic/Event/Holiday/Urgent)
✓ Target Audience (Students/Parents/Staff/All)
✓ Batch/Course-wise Filtering
✓ Attachment Support
✓ Priority Levels (Normal/Important/Urgent)
✓ Expiry Date
✓ Read Receipts
✓ Push Notifications on New Notice
```

### Notice Board Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      NOTICE BOARD FLOW                                   │
└─────────────────────────────────────────────────────────────────────────┘

  Admin Creates Notice
          │
          ▼
  ┌───────────────────┐
  │  Enter Details    │
  │  - Title          │
  │  - Description    │
  │  - Category       │
  │  - Priority       │
  │  - Attachments    │
  └────────┬──────────┘
           │
           ▼
  ┌───────────────────┐
  │  Select Target    │
  │  Audience         │
  │  - All            │
  │  - Students       │
  │  - Parents        │
  │  - Staff          │
  │  - Specific Batch │
  └────────┬──────────┘
           │
           ▼
  ┌───────────────────┐
  │  Set Expiry Date  │
  │  (Optional)       │
  └────────┬──────────┘
           │
           ▼
  ┌───────────────────┐        ┌──────────────────────────┐
  │  Publish Notice   │───────►│  Notification Sent       │
  │                   │        │  (SMS/Email/Push)        │
  └────────┬──────────┘        └──────────────────────────┘
           │
           ▼
  ┌───────────────────┐
  │  Display on       │
  │  - Portal         │
  │  - Mobile App     │
  │  - Dashboard      │
  └────────┬──────────┘
           │
           ▼
  ┌───────────────────┐
  │  Track Read       │
  │  Receipts         │
  │  - Who Read       │
  │  - When Read      │
  └───────────────────┘
```

### Notice Board Database Schema

```
┌──────────────────────────┐         ┌──────────────────────────┐
│        notices           │         │    notice_recipients     │
├──────────────────────────┤         ├──────────────────────────┤
│ id (PK)                  │         │ id (PK)                  │
│ branch_id (FK)           │         │ notice_id (FK)           │
│ title                    │         │ recipient_id (FK)        │
│ description              │         │ recipient_type           │
│ category                 │         │ (Student/Parent/Staff)   │
│ (Academic/Event/Holiday/ │         │ is_read                  │
│  Urgent/General)         │         │ read_at                  │
│ priority                 │         │ created_at               │
│ (Normal/Important/Urgent)│         └──────────────────────────┘
│ target_audience (JSON)   │
│ attachment_url           │         ┌──────────────────────────┐
│ published_at             │         │   notice_attachments     │
│ expires_at               │         ├──────────────────────────┤
│ is_active                │         │ id (PK)                  │
│ created_by (FK→users)    │         │ notice_id (FK)           │
│ created_at               │         │ file_name                │
└──────────────────────────┘         │ file_url (VPS)           │
                                     │ file_type                │
                                     │ file_size                │
                                     │ created_at               │
                                     └──────────────────────────┘
```

---

## API Endpoints

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           API ENDPOINTS                                  │
└─────────────────────────────────────────────────────────────────────────┘

SMS:
GET    /api/communication/sms/templates
POST   /api/communication/sms/templates/create
GET    /api/communication/sms/campaigns
POST   /api/communication/sms/campaigns/create
POST   /api/communication/sms/send
GET    /api/communication/sms/logs
GET    /api/communication/sms/credits

Email:
GET    /api/communication/email/templates
POST   /api/communication/email/templates/create
GET    /api/communication/email/campaigns
POST   /api/communication/email/campaigns/create
POST   /api/communication/email/send
GET    /api/communication/email/logs
POST   /api/communication/email/unsubscribe

Reminders:
GET    /api/communication/reminders
POST   /api/communication/reminders/create
PUT    /api/communication/reminders/:id
DELETE /api/communication/reminders/:id
GET    /api/communication/reminders/logs

Notice Board:
GET    /api/communication/notices
POST   /api/communication/notices/create
PUT    /api/communication/notices/:id
DELETE /api/communication/notices/:id
PUT    /api/communication/notices/:id/read
GET    /api/communication/notices/:id/recipients
```

---

## Tech Stack

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            TECH STACK                                    │
└─────────────────────────────────────────────────────────────────────────┘

Backend:
- API: Node.js (Express) / Django
- Queue: Bull / Celery
- Scheduler: Node-cron / APScheduler
- Database: MySQL 8.0+
- Cache: Redis

SMS Gateway:
- Twilio
- MSG91

Email Service:
- SendGrid
- SMTP (Gmail/Hostinger)
- Mailgun

Templates:
- Handlebars
- EJS
- Mustache

Frontend:
- Rich Text Editor: TinyMCE / CKEditor
- UI: React.js + Material-UI
```

---

## Implementation Checklist

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      IMPLEMENTATION CHECKLIST                            │
└─────────────────────────────────────────────────────────────────────────┘

Week 1-2: SMS System
□ SMS template management
□ Bulk SMS sending
□ Gateway integration (Twilio/MSG91)
□ Delivery tracking
□ Credit management

Week 3-4: Email System
□ Email template management (HTML)
□ Bulk email sending
□ Gateway integration (SendGrid/SMTP)
□ Attachment support
□ Open/Click tracking
□ Unsubscribe handling

Week 5-6: Automated Reminders
□ Reminder configuration
□ Cron job setup
□ Fee reminders
□ Exam reminders
□ Assignment reminders
□ Attendance alerts
□ Birthday wishes

Week 7-8: Notice Board
□ Notice creation & publishing
□ Category management
□ Target audience filtering
□ Attachment support
□ Read receipts
□ Push notifications

Week 9-10: Integration & Testing
□ Queue system (Bull/Redis)
□ Background job processing
□ Error handling & retry logic
□ Performance testing
□ Load testing

Week 11-12: Documentation & Training
□ User manual
□ Template library
□ Admin training
□ Best practices guide
```

---

## Success Metrics

- SMS delivery rate: >95%
- Email delivery rate: >98%
- Reminder accuracy: 100%
- Notification delivery time: <5 seconds
- Queue processing time: <10 seconds
- System uptime: >99.9%

---

**Phase 10 Complete: Communication & Notifications System Ready**
