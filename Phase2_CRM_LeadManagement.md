# UpsurgeERP - Phase 2: CRM & Lead Management

**Duration:** Month 3
**Status:** CRM & Lead Management Phase

---

## Overview

Phase 2 builds the complete CRM and Lead Management system for UpsurgeERP. It captures leads from multiple sources, tracks them through a sales funnel, assigns them to counsellors, schedules follow-ups, and provides analytics on lead performance.

---

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          LEAD MANAGEMENT SYSTEM                          │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                          LEAD SOURCES (INPUT)                            │
├──────────┬──────────┬──────────┬──────────┬──────────┬──────────────────┤
│  Google  │Facebook  │Just Dial │ Webinar  │ Walk-in  │   Reference      │
│  Ads API │Lead Ads  │   API    │ Platform │  Form    │   / Resume       │
└────┬─────┴────┬─────┴────┬─────┴────┬─────┴────┬─────┴──────┬───────────┘
     │          │          │          │          │             │
     └──────────┴──────────┴──────────┴──────────┴─────────────┘
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │        API Gateway            │
                    │     (Lead Intake Layer)       │
                    └───────────────┬───────────────┘
                                    │
                    ┌───────────────▼───────────────┐
                    │      Lead Processing          │
                    │   - Deduplication             │
                    │   - Source Tagging            │
                    │   - Auto Assignment           │
                    └───────────────┬───────────────┘
                                    │
          ┌─────────────────────────┼─────────────────────────┐
          │                         │                         │
          ▼                         ▼                         ▼
┌─────────────────┐     ┌───────────────────┐     ┌─────────────────────┐
│  Lead Database  │     │  Notification     │     │  Analytics Engine   │
│  (PostgreSQL)   │     │  Service          │     │  (Charts & Reports) │
│                 │     │  (SMS/Email)      │     │                     │
└─────────────────┘     └───────────────────┘     └─────────────────────┘
```

---

## Lead Funnel / Stage Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          LEAD STAGE FUNNEL                               │
└─────────────────────────────────────────────────────────────────────────┘

     ┌──────────────────────────────────────────────────────────┐
     │                    NEW LEAD                              │
     │              (Captured from Source)                      │
     │                   Count: 100%                            │
     └──────────────────────────┬───────────────────────────────┘
                                │
                                ▼
     ┌──────────────────────────────────────────────────────────┐
     │                    CONTACTED                             │
     │           (First call / email done)                      │
     │                   Count: ~75%                            │
     └──────────────────────────┬───────────────────────────────┘
                                │
                                ▼
     ┌──────────────────────────────────────────────────────────┐
     │                  DEMO SCHEDULED                          │
     │         (Demo / counselling session booked)              │
     │                   Count: ~50%                            │
     └──────────────────────────┬───────────────────────────────┘
                                │
                                ▼
     ┌──────────────────────────────────────────────────────────┐
     │                  DEMO DONE                               │
     │           (Demo / session completed)                     │
     │                   Count: ~35%                            │
     └──────────────────────────┬───────────────────────────────┘
                                │
                                ▼
     ┌──────────────────────────────────────────────────────────┐
     │                  FOLLOW-UP                               │
     │         (Interested, needs more follow-up)               │
     │                   Count: ~25%                            │
     └──────────────────────────┬───────────────────────────────┘
                                │
                    ┌───────────┴───────────┐
                    │                       │
                    ▼                       ▼
     ┌──────────────────────┐   ┌──────────────────────────┐
     │      ADMISSION       │   │        LOST              │
     │  (Converted Lead)    │   │  (Not Interested /       │
     │    Count: ~15%       │   │   No Response)           │
     └──────────────────────┘   └──────────────────────────┘
```

---

## Lead Assignment Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        LEAD ASSIGNMENT FLOW                              │
└─────────────────────────────────────────────────────────────────────────┘

  New Lead Arrives
        │
        ▼
┌───────────────────┐
│  Auto Assignment  │──── Round Robin ────► Counsellor A
│  Rules Engine     │──── By Source   ────► Counsellor B
│                   │──── By Course   ────► Counsellor C
└───────────────────┘
        │
        │ (Manual Override)
        ▼
┌───────────────────┐
│  Branch Admin /   │
│  Team Leader      │──── Reassign ────► Any Counsellor
│  Assignment       │
└───────────────────┘
        │
        ▼
┌───────────────────┐
│  Counsellor       │
│  Notified via     │──── SMS / Email / In-App Notification
│  Notification     │
└───────────────────┘
        │
        ▼
┌───────────────────┐
│  Counsellor       │
│  Starts Follow-up │──── Schedule Call / Meeting / Demo
└───────────────────┘
```

---

## Follow-Up Scheduling Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       FOLLOW-UP SCHEDULING FLOW                          │
└─────────────────────────────────────────────────────────────────────────┘

  Counsellor Opens Lead
          │
          ▼
  ┌───────────────────┐
  │  View Lead Detail │
  │  - Name           │
  │  - Mobile         │
  │  - Course Interest│
  │  - Source         │
  │  - Current Stage  │
  └────────┬──────────┘
           │
           ▼
  ┌───────────────────┐
  │  Add Follow-Up    │
  │  - Date & Time    │
  │  - Type (Call /   │
  │    Meeting/Demo)  │
  │  - Notes          │
  └────────┬──────────┘
           │
           ▼
  ┌───────────────────┐        ┌──────────────────────────┐
  │  System Schedules │───────►│  Reminder Notification   │
  │  Reminder         │        │  (Before 30 min / 1 day) │
  └────────┬──────────┘        └──────────────────────────┘
           │
           ▼
  ┌───────────────────┐
  │  Follow-Up Done   │
  │  - Update Stage   │
  │  - Add Remarks    │
  │  - Schedule Next  │
  └───────────────────┘
```

---

## Database Schema

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          DATABASE SCHEMA                                  │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────┐         ┌──────────────────────────┐
│         leads            │         │      lead_sources        │
├──────────────────────────┤         ├──────────────────────────┤
│ id (PK)                  │         │ id (PK)                  │
│ branch_id (FK)           │         │ name                     │
│ source_id (FK)           ├────────►│ (Google/Facebook/etc.)   │
│ assigned_to (FK→users)   │         │ is_active                │
│ name                     │         │ created_at               │
│ email                    │         └──────────────────────────┘
│ mobile                   │
│ course_interest          │         ┌──────────────────────────┐
│ stage                    │         │      lead_stages         │
│ status                   │         ├──────────────────────────┤
│ remarks                  │         │ id (PK)                  │
│ created_at               │         │ name                     │
│ updated_at               │         │ (New/Contacted/etc.)     │
└──────────┬───────────────┘         │ order_sequence           │
           │                         │ color_code               │
           │                         └──────────────────────────┘
           │
           ▼
┌──────────────────────────┐         ┌──────────────────────────┐
│      follow_ups          │         │    lead_activities       │
├──────────────────────────┤         ├──────────────────────────┤
│ id (PK)                  │         │ id (PK)                  │
│ lead_id (FK)             │         │ lead_id (FK)             │
│ counsellor_id (FK)       │         │ user_id (FK)             │
│ follow_up_date           │         │ activity_type            │
│ follow_up_type           │         │ description              │
│ (Call/Meeting/Demo)      │         │ created_at               │
│ notes                    │         └──────────────────────────┘
│ status (Pending/Done)    │
│ created_at               │
└──────────────────────────┘

┌──────────────────────────┐         ┌──────────────────────────┐
│    bulk_sms_logs         │         │    bulk_email_logs       │
├──────────────────────────┤         ├──────────────────────────┤
│ id (PK)                  │         │ id (PK)                  │
│ sent_by (FK→users)       │         │ sent_by (FK→users)       │
│ recipient_mobile         │         │ recipient_email          │
│ message                  │         │ subject                  │
│ status (Sent/Failed)     │         │ body                     │
│ gateway_response         │         │ status (Sent/Failed)     │
│ created_at               │         │ created_at               │
└──────────────────────────┘         └──────────────────────────┘
```

---

## API Endpoints

### Lead Management
```
POST   /api/v1/leads                        → Create new lead
GET    /api/v1/leads                        → List all leads (with filters)
GET    /api/v1/leads/:id                    → Get lead detail
PUT    /api/v1/leads/:id                    → Update lead
DELETE /api/v1/leads/:id                    → Delete lead
PUT    /api/v1/leads/:id/stage              → Update lead stage
PUT    /api/v1/leads/:id/assign             → Assign lead to counsellor
POST   /api/v1/leads/bulk-import            → Bulk import leads (CSV)
```

### Follow-Up Management
```
POST   /api/v1/leads/:id/followups          → Schedule follow-up
GET    /api/v1/leads/:id/followups          → Get follow-ups for a lead
PUT    /api/v1/followups/:id                → Update follow-up
DELETE /api/v1/followups/:id               → Delete follow-up
GET    /api/v1/followups/today              → Today's follow-ups
GET    /api/v1/followups/upcoming           → Upcoming follow-ups
```

### Lead Sources & Stages
```
GET    /api/v1/lead-sources                 → List all sources
POST   /api/v1/lead-sources                 → Add new source
PUT    /api/v1/lead-sources/:id             → Update source
DELETE /api/v1/lead-sources/:id             → Delete source

GET    /api/v1/lead-stages                  → List all stages
POST   /api/v1/lead-stages                  → Add new stage
PUT    /api/v1/lead-stages/:id              → Update stage
```

### Bulk Communication
```
POST   /api/v1/communications/bulk-sms      → Send bulk SMS
POST   /api/v1/communications/bulk-email    → Send bulk email
GET    /api/v1/communications/sms-logs      → SMS logs
GET    /api/v1/communications/email-logs    → Email logs
```

### Analytics
```
GET    /api/v1/analytics/lead-source        → Lead source wise count
GET    /api/v1/analytics/lead-stage         → Lead stage funnel data
GET    /api/v1/analytics/lead-conversion    → Conversion rate report
GET    /api/v1/analytics/counsellor-wise    → Counsellor performance
GET    /api/v1/analytics/course-wise        → Course-wise enquiry report
```

---

## External API Integrations

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      EXTERNAL INTEGRATIONS                               │
└─────────────────────────────────────────────────────────────────────────┘

  ┌─────────────────────┐
  │   Google Ads API    │──── Webhook ────► POST /api/v1/leads/google
  │   (Lead Form Ext.)  │                  (Auto-create lead on form fill)
  └─────────────────────┘

  ┌─────────────────────┐
  │  Facebook Lead      │──── Webhook ────► POST /api/v1/leads/facebook
  │  Ads API            │                  (Auto-create lead on FB form)
  └─────────────────────┘

  ┌─────────────────────┐
  │  Just Dial API      │──── Webhook ────► POST /api/v1/leads/justdial
  │                     │                  (Auto-create lead from JD)
  └─────────────────────┘

  ┌─────────────────────┐
  │  Twilio / MSG91     │◄─── Bulk SMS ───  POST /api/v1/communications/bulk-sms
  │  (SMS Gateway)      │                  (Send SMS to leads/students)
  └─────────────────────┘

  ┌─────────────────────┐
  │  SendGrid /         │◄─── Bulk Email ─  POST /api/v1/communications/bulk-email
  │  SMTP (Gmail)       │                  (Send email campaigns)
  └─────────────────────┘
```

---

## Technology Stack

### Backend
```
Node.js + Express.js
├── axios              → External API calls (Google, Facebook, JD)
├── bull               → Job queue for bulk SMS/Email
├── node-cron          → Follow-up reminder scheduler
├── nodemailer         → Email sending
├── twilio / msg91     → SMS gateway SDK
└── express-validator  → Input validation
```

### Database
```
MySQL 8.0+
├── leads table
├── follow_ups table
├── lead_sources table
├── lead_stages table
├── lead_activities table
├── bulk_sms_logs table
└── bulk_email_logs table

Redis
├── Follow-up reminder queue
└── Bulk SMS/Email job queue
```

### Charts & Analytics
```
Chart.js / D3.js
├── Lead Source Pie Chart
├── Lead Stage Funnel Chart
├── Counsellor Performance Bar Chart
└── Course-wise Enquiry Chart
```

---

## Module Breakdown

### 1. Lead Capture (Multi-Source)

#### Features:
- Manual lead entry form
- Auto-capture from Google Ads via webhook
- Auto-capture from Facebook Lead Ads via webhook
- Auto-capture from Just Dial via webhook
- Walk-in lead entry
- Bulk CSV import
- Duplicate detection (by mobile number)

---

### 2. Lead Stages / Funnel Management

#### Stages:
1. New
2. Contacted
3. Demo Scheduled
4. Demo Done
5. Follow-Up
6. Admission (Converted)
7. Lost

#### Features:
- Drag & drop stage update (Kanban view)
- Stage-wise lead count on dashboard
- Stage change history log
- Color-coded stage badges

---

### 3. Lead Assignment & Follow-Up Scheduling

#### Assignment Features:
- Manual assignment by admin
- Auto round-robin assignment
- Reassignment with reason
- Assignment history log

#### Follow-Up Features:
- Schedule call / meeting / demo
- Date & time picker
- Reminder notification (30 min before)
- Mark follow-up as done
- Add remarks after follow-up
- Schedule next follow-up

---

### 4. Lead Source Analytics

#### Reports:
- Lead Source-wise Count (Pie Chart)
- Lead Source-wise Admission Value (Bar Chart)
- Lead Source-wise Fees Collected
- Lead Stage Funnel (Funnel Chart)
- Counsellor-wise Lead Performance
- Course Package-wise Enquiry Report
- Date Range Filter for all reports

---

### 5. Bulk SMS / Email Integration

#### SMS Features:
- Select leads by filter (source, stage, course)
- Compose SMS message
- Send via Twilio / MSG91
- Delivery status tracking
- SMS log history

#### Email Features:
- Select leads by filter
- Compose email with subject & body
- HTML email template support
- Send via SendGrid / SMTP
- Open & click tracking
- Email log history

---

## Security Implementation

```
1. Lead Data Access Control
   - Counsellors see only assigned leads
   - Branch Admin sees all branch leads
   - Super Admin sees all leads

2. API Security
   - JWT authentication on all endpoints
   - Role-based permission check
   - Rate limiting on bulk SMS/Email APIs

3. Webhook Security
   - Verify webhook signatures (Google, Facebook)
   - IP whitelisting for Just Dial
   - Idempotency keys to prevent duplicate leads
```

---

## Development Timeline

### Week 1: Database & Lead CRUD
- [ ] Create leads, follow_ups, lead_sources, lead_stages tables
- [ ] Lead CRUD APIs
- [ ] Lead source & stage management APIs
- [ ] Duplicate detection logic

### Week 2: Assignment & Follow-Up
- [ ] Lead assignment APIs (manual + auto round-robin)
- [ ] Follow-up scheduling APIs
- [ ] Reminder scheduler (node-cron + Bull queue)
- [ ] Notification service (SMS/Email on assignment)

### Week 3: External Integrations
- [ ] Google Ads webhook integration
- [ ] Facebook Lead Ads webhook integration
- [ ] Just Dial API integration
- [ ] Twilio / MSG91 bulk SMS integration
- [ ] SendGrid / SMTP bulk email integration

### Week 4: Analytics & Testing
- [ ] Lead source analytics APIs
- [ ] Lead stage funnel API
- [ ] Counsellor performance report API
- [ ] Chart.js integration on frontend
- [ ] Unit & integration tests
- [ ] Performance optimization

---

## Testing Strategy

```javascript
// Example: Lead Creation Test
describe('Lead Management', () => {
  test('Create lead with valid data', async () => {
    const response = await request(app)
      .post('/api/v1/leads')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Test Student',
        mobile: '9999999999',
        email: 'test@example.com',
        source_id: 1,
        course_interest: 'Full Stack Development'
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
  });

  test('Duplicate lead detection by mobile', async () => {
    const response = await request(app)
      .post('/api/v1/leads')
      .set('Authorization', `Bearer ${token}`)
      .send({ mobile: '9999999999' });

    expect(response.status).toBe(409); // Conflict
  });

  test('Assign lead to counsellor', async () => {
    const response = await request(app)
      .put('/api/v1/leads/1/assign')
      .set('Authorization', `Bearer ${token}`)
      .send({ counsellor_id: 5 });

    expect(response.status).toBe(200);
  });
});
```

---

## Deployment Notes

```
Environment Variables Required:

# Google Ads
GOOGLE_ADS_WEBHOOK_SECRET=your_secret

# Facebook
FACEBOOK_APP_SECRET=your_secret
FACEBOOK_PAGE_ACCESS_TOKEN=your_token

# Just Dial
JUSTDIAL_API_KEY=your_key

# SMS Gateway
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_FROM_NUMBER=+1xxxxxxxxxx

# OR MSG91
MSG91_AUTH_KEY=your_key
MSG91_SENDER_ID=UPSRGE

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=noreply@upsurgeerp.com
# OR SendGrid
SENDGRID_API_KEY=your_key
```

---

## Deliverables

1. ✅ Lead Capture System (Manual + Multi-Source Webhooks)
2. ✅ Lead Stage / Funnel Management
3. ✅ Lead Assignment (Manual + Auto Round-Robin)
4. ✅ Follow-Up Scheduling with Reminders
5. ✅ Bulk SMS Integration (Twilio / MSG91)
6. ✅ Bulk Email Integration (SendGrid / SMTP)
7. ✅ Lead Source Analytics & Charts
8. ✅ API Documentation (Swagger)
9. ✅ Unit & Integration Tests

---

## Success Metrics

- [ ] Lead capture from all 3 external sources working
- [ ] Duplicate detection accuracy 100%
- [ ] Follow-up reminders delivered on time
- [ ] Bulk SMS delivery rate > 95%
- [ ] Bulk Email delivery rate > 90%
- [ ] Analytics charts loading < 1 second
- [ ] All APIs response time < 200ms

---

**Document Version:** 1.0
**Phase:** 2 - CRM & Lead Management
**Duration:** Month 3
**Prepared By:** Development Team
