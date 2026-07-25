# UpsurgeERP - Phase 3: Student Admissions & Fee Management

**Duration:** Months 4-5
**Status:** Admissions & Fee Management Phase

---

## Overview

Phase 3 builds the complete Student Admissions and Fee Management system for UpsurgeERP. It handles student registration, document collection, course package assignment, discount management, fee schedules, installment tracking, payment gateway integration, automated fee reminders, and receipt generation.

---

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    ADMISSIONS & FEE MANAGEMENT SYSTEM                    │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                          ADMISSION ENTRY POINTS                          │
├──────────────────────┬──────────────────────┬───────────────────────────┤
│   Convert from Lead  │   Direct Walk-in     │   Bulk Import (CSV)       │
│   (CRM Module)       │   Registration       │                           │
└──────────┬───────────┴──────────┬───────────┴──────────┬────────────────┘
           │                      │                       │
           └──────────────────────┴───────────────────────┘
                                  │
                                  ▼
                  ┌───────────────────────────────┐
                  │       Admission Processing    │
                  │   - Student Registration      │
                  │   - Document Upload           │
                  │   - Course Assignment         │
                  │   - Discount Application      │
                  └───────────────┬───────────────┘
                                  │
          ┌───────────────────────┼───────────────────────┐
          │                       │                       │
          ▼                       ▼                       ▼
┌─────────────────┐   ┌───────────────────┐   ┌─────────────────────┐
│  Student DB     │   │  Fee Schedule     │   │  Document Storage   │
│  (PostgreSQL)   │   │  Engine           │   │  (VPS Local)         │
│                 │   │  (Installments)   │   │                     │
└─────────────────┘   └───────────────────┘   └─────────────────────┘
                                  │
          ┌───────────────────────┼───────────────────────┐
          │                       │                       │
          ▼                       ▼                       ▼
┌─────────────────┐   ┌───────────────────┐   ┌─────────────────────┐
│  Payment        │   │  Notification     │   │  Analytics Engine   │
│  Gateway        │   │  Service          │   │  (Reports)          │
│  (Razorpay)     │   │  (SMS/Email)      │   │                     │
└─────────────────┘   └───────────────────┘   └─────────────────────┘
```

---

## Admission Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          ADMISSION FLOW                                  │
└─────────────────────────────────────────────────────────────────────────┘

     ┌──────────────────────────────────────────────────────────┐
     │                  LEAD CONVERTED / WALK-IN                │
     │              (Trigger: Admission Decision)               │
     └──────────────────────────┬───────────────────────────────┘
                                │
                                ▼
     ┌──────────────────────────────────────────────────────────┐
     │                STUDENT REGISTRATION                      │
     │   - Personal Info (Name, DOB, Mobile, Email, Address)    │
     │   - Parent / Guardian Info                               │
     │   - Photo Upload                                         │
     └──────────────────────────┬───────────────────────────────┘
                                │
                                ▼
     ┌──────────────────────────────────────────────────────────┐
     │                DOCUMENT COLLECTION                       │
     │   - Aadhar Card / ID Proof                               │
     │   - Educational Certificates                             │
     │   - Passport Size Photo                                  │
     │   - Other KYC Documents                                  │
     └──────────────────────────┬───────────────────────────────┘
                                │
                                ▼
     ┌──────────────────────────────────────────────────────────┐
     │               COURSE PACKAGE ASSIGNMENT                  │
     │   - Select Course Package                                │
     │   - Select Batch                                         │
     │   - Set Admission Date                                   │
     └──────────────────────────┬───────────────────────────────┘
                                │
                                ▼
     ┌──────────────────────────────────────────────────────────┐
     │                  FEE & DISCOUNT SETUP                    │
     │   - Course Fee (Auto-filled from package)                │
     │   - Apply Discount (Amount / %)                          │
     │   - Net Payable Amount                                   │
     └──────────────────────────┬───────────────────────────────┘
                                │
                                ▼
     ┌──────────────────────────────────────────────────────────┐
     │                  FEE SCHEDULE CREATION                   │
     │   - Full Payment / Installments                          │
     │   - Set Due Dates per Installment                        │
     └──────────────────────────┬───────────────────────────────┘
                                │
                    ┌───────────┴───────────┐
                    │                       │
                    ▼                       ▼
     ┌──────────────────────┐   ┌──────────────────────────┐
     │   PAYMENT COLLECTED  │   │   ADMISSION CONFIRMED    │
     │   - Cash / Online    │   │   - ID Card Generated    │
     │   - Receipt Issued   │   │   - Welcome SMS/Email    │
     └──────────────────────┘   └──────────────────────────┘
```

---

## Fee Payment Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          FEE PAYMENT FLOW                                │
└─────────────────────────────────────────────────────────────────────────┘

  Fee Due Date Approaches
          │
          ▼
  ┌───────────────────┐        ┌──────────────────────────┐
  │  Auto Reminder    │───────►│  SMS + Email to Student  │
  │  Triggered        │        │  (3 days / 1 day before) │
  └────────┬──────────┘        └──────────────────────────┘
           │
           ▼
  ┌───────────────────┐
  │  Student / Admin  │
  │  Initiates        │
  │  Payment          │
  └────────┬──────────┘
           │
           ├──────────────────────────────────────────┐
           │                                          │
           ▼                                          ▼
  ┌───────────────────┐                   ┌───────────────────┐
  │  Online Payment   │                   │  Cash / Offline   │
  │  (Razorpay /      │                   │  Payment          │
  │   Stripe / PayU)  │                   │  (Admin Entry)    │
  └────────┬──────────┘                   └────────┬──────────┘
           │                                       │
           └───────────────────┬───────────────────┘
                               │
                               ▼
                   ┌───────────────────────┐
                   │  Payment Recorded     │
                   │  - Amount             │
                   │  - Mode (Cash/Online) │
                   │  - Date               │
                   │  - Received By        │
                   └───────────┬───────────┘
                               │
                               ▼
                   ┌───────────────────────┐
                   │  Receipt Generated    │──── PDF Receipt (Auto)
                   │  - Receipt No.        │──── SMS to Student
                   │  - Student Name       │──── Email to Student
                   │  - Amount Paid        │
                   │  - Balance Due        │
                   └───────────────────────┘
```

---

## Database Schema

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          DATABASE SCHEMA                                  │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────┐         ┌──────────────────────────┐
│         students         │         │      course_packages     │
├──────────────────────────┤         ├──────────────────────────┤
│ id (PK)                  │         │ id (PK)                  │
│ branch_id (FK)           │         │ branch_id (FK)           │
│ lead_id (FK→leads)       │         │ name                     │
│ admission_no             │         │ total_fee                │
│ name                     │         │ duration_months          │
│ dob                      ├────────►│ description              │
│ mobile                   │         │ is_active                │
│ email                    │         │ created_at               │
│ address                  │         └──────────────────────────┘
│ parent_name              │
│ parent_mobile            │         ┌──────────────────────────┐
│ photo_url                │         │      admissions          │
│ created_at               │         ├──────────────────────────┤
└──────────┬───────────────┘         │ id (PK)                  │
           │                         │ student_id (FK)          │
           │                         │ course_package_id (FK)   │
           └────────────────────────►│ batch_id (FK)            │
                                     │ counsellor_id (FK)       │
                                     │ admission_date           │
                                     │ total_fee                │
                                     │ discount_amount          │
                                     │ net_payable              │
                                     │ status (Active/Inactive) │
                                     │ created_at               │
                                     └──────────────────────────┘

┌──────────────────────────┐         ┌──────────────────────────┐
│      fee_schedules       │         │      fee_payments        │
├──────────────────────────┤         ├──────────────────────────┤
│ id (PK)                  │         │ id (PK)                  │
│ admission_id (FK)        │         │ fee_schedule_id (FK)     │
│ installment_no           │         │ admission_id (FK)        │
│ due_date                 ├────────►│ amount_paid              │
│ amount                   │         │ payment_mode             │
│ status                   │         │ (Cash/Online/Cheque)     │
│ (Pending/Paid/Overdue)   │         │ payment_date             │
│ created_at               │         │ receipt_no               │
└──────────────────────────┘         │ received_by (FK→users)   │
                                     │ gateway_txn_id           │
                                     │ created_at               │
                                     └──────────────────────────┘

┌──────────────────────────┐         ┌──────────────────────────┐
│    student_documents     │         │      discounts           │
├──────────────────────────┤         ├──────────────────────────┤
│ id (PK)                  │         │ id (PK)                  │
│ student_id (FK)          │         │ admission_id (FK)        │
│ document_type            │         │ discount_type            │
│ (Aadhar/Certificate/etc) │         │ (Amount/Percentage)      │
│ file_url (VPS)           │         │ discount_value           │
│ uploaded_by (FK→users)   │         │ reason                   │
│ created_at               │         │ approved_by (FK→users)   │
└──────────────────────────┘         │ created_at               │
                                     └──────────────────────────┘
```

---

## API Endpoints

### Student Registration
```
POST   /api/v1/students                          → Register new student
GET    /api/v1/students                          → List all students (with filters)
GET    /api/v1/students/:id                      → Get student detail
PUT    /api/v1/students/:id                      → Update student info
DELETE /api/v1/students/:id                      → Delete student
POST   /api/v1/students/:id/documents            → Upload student document
GET    /api/v1/students/:id/documents            → Get student documents
DELETE /api/v1/students/:id/documents/:docId     → Delete document
```

### Admissions
```
POST   /api/v1/admissions                        → Create new admission
GET    /api/v1/admissions                        → List all admissions (with filters)
GET    /api/v1/admissions/:id                    → Get admission detail
PUT    /api/v1/admissions/:id                    → Update admission
PUT    /api/v1/admissions/:id/status             → Activate / deactivate admission
GET    /api/v1/admissions/:id/receipt            → Download admission receipt (PDF)
```

### Fee Schedules & Payments
```
POST   /api/v1/admissions/:id/fee-schedule       → Create fee schedule (installments)
GET    /api/v1/admissions/:id/fee-schedule       → Get fee schedule
PUT    /api/v1/fee-schedules/:id                 → Update installment due date/amount
POST   /api/v1/fee-payments                      → Record fee payment
GET    /api/v1/admissions/:id/fee-payments       → Get payment history for admission
GET    /api/v1/fee-payments/:id/receipt          → Download payment receipt (PDF)
```

### Discounts
```
POST   /api/v1/admissions/:id/discount           → Apply discount
GET    /api/v1/admissions/:id/discount           → Get discount details
PUT    /api/v1/discounts/:id                     → Update discount
DELETE /api/v1/discounts/:id                     → Remove discount
```

### Course Packages
```
POST   /api/v1/course-packages                   → Create course package
GET    /api/v1/course-packages                   → List all packages
GET    /api/v1/course-packages/:id               → Get package detail
PUT    /api/v1/course-packages/:id               → Update package
DELETE /api/v1/course-packages/:id               → Delete package
```

### Analytics & Reports
```
GET    /api/v1/analytics/admissions/course-wise  → Course-wise admission count
GET    /api/v1/analytics/admissions/counsellor   → Counsellor-wise admission report
GET    /api/v1/analytics/fees/collection         → Fee collection vs target
GET    /api/v1/analytics/fees/due                → Fees due report (paginated)
GET    /api/v1/analytics/fees/discount           → Discount report
GET    /api/v1/analytics/fees/source-wise        → Lead source-wise fee collection
```

---

## External Integrations

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      EXTERNAL INTEGRATIONS                               │
└─────────────────────────────────────────────────────────────────────────┘

  ┌─────────────────────┐
  │   Razorpay /        │◄─── Online Payment ─  POST /api/v1/fee-payments/online
  │   Stripe / PayU     │──── Webhook ────────► POST /api/v1/webhooks/payment
  │   (Payment Gateway) │                       (Auto-confirm payment on success)
  └─────────────────────┘

  ┌─────────────────────┐
  │   Cloudinary /      │◄─── File Upload ────  POST /api/v1/students/:id/documents
  │   VPS Local Storage │──── Secure URL ─────► GET  /api/v1/students/:id/documents
  └─────────────────────┘

  ┌─────────────────────┐
  │   PDFKit / jsPDF    │◄─── Generate PDF ───  GET /api/v1/fee-payments/:id/receipt
  │   (PDF Generation)  │                       (Fee receipt & admission letter)
  └─────────────────────┘

  ┌─────────────────────┐
  │   Twilio / MSG91    │◄─── Fee Reminder ───  Auto-triggered by cron scheduler
  │   (SMS Gateway)     │                       (3 days & 1 day before due date)
  └─────────────────────┘

  ┌─────────────────────┐
  │   SendGrid /        │◄─── Email Reminder ─  Auto-triggered by cron scheduler
  │   SMTP (Hostinger)  │                       (Receipt + due reminders)
  └─────────────────────┘
```

---

## Technology Stack

### Backend
```
Node.js + Express.js
├── multer             → File upload handling (documents)
├── pdfkit / jspdf     → PDF receipt & letter generation
├── razorpay           → Payment gateway SDK
├── bull               → Job queue for reminders
├── node-cron          → Fee due reminder scheduler
├── nodemailer         → Email sending (SMTP)
├── twilio / msg91     → SMS gateway SDK
└── express-validator  → Input validation
```

### Database
```
MySQL 8.0+
├── students table
├── admissions table
├── course_packages table
├── fee_schedules table
├── fee_payments table
├── discounts table
└── student_documents table

Redis
├── Fee reminder job queue
└── Payment webhook idempotency cache
```

### File Storage
```
Cloudinary / VPS Local Storage
├── student-documents/     → KYC & educational documents
├── student-photos/        → Student profile photos
└── receipts/              → Generated PDF receipts
```

---

## Module Breakdown

### 1. Student Registration & Document Management

#### Features:
- Complete student profile (personal, parent, contact info)
- Photo upload (stored on VPS local storage)
- Document upload (Aadhar, certificates, etc.)
- Document type categorization
- Document verification status tracking
- Convert from existing lead (auto-fill from lead data)

---

### 2. Admissions Management

#### Features:
- Link admission to student + course package + batch
- Admission number auto-generation
- Counsellor-wise admission tracking
- Admission target vs. actual tracking
- Course-wise admission reports
- Admission status management (Active / Inactive / Cancelled)

---

### 3. Discount Management

#### Features:
- Apply discount by amount or percentage
- Discount reason / remarks
- Approval workflow (admin approval for large discounts)
- Discount report per counsellor / branch
- Total discount allowed tracking on dashboard

---

### 4. Fee Schedules & Installments

#### Features:
- Full payment or installment-based schedule
- Custom installment amounts and due dates
- Installment status: Pending / Paid / Overdue
- Auto-calculate balance due
- Edit installment due dates
- Fee schedule preview before saving

---

### 5. Payment Collection & Receipts

#### Features:
- Record cash / cheque / online payments
- Online payment via Razorpay / Stripe / PayU
- Auto-confirm payment via payment gateway webhook
- Auto-generate PDF receipt on payment
- Receipt number auto-generation
- Send receipt via SMS and email
- Payment history per student

---

### 6. Automated Fee Reminders

#### Reminder Schedule:
- 3 days before due date → SMS + Email
- 1 day before due date → SMS + Email
- On due date (if unpaid) → SMS + Email
- 3 days after overdue → SMS + Email (escalation)

#### Features:
- Cron job runs daily at 8:00 AM
- Checks all pending installments
- Sends personalized reminders with student name, amount, due date
- Reminder log maintained per student

---

### 7. Fee Analytics & Reports

#### Reports:
- Fee Collection vs. Target (Bar Chart)
- Course-wise Fee Collection
- Lead Source-wise Fee Collection
- Fees Due Report (Paginated list with student name, mobile, due amount)
- Discount Report (Counsellor-wise / Branch-wise)
- Monthly Fee Collection Trend (Line Chart)
- Date Range Filter for all reports

---

## Security Implementation

```
1. Student Data Access Control
   - Counsellors see only their admitted students
   - Branch Admin sees all branch students
   - Super Admin sees all students across branches

2. Document Security
   - Documents stored on private VPS directory with restricted access
   - Access via pre-signed URLs (expire in 1 hour)
   - Only authorized roles can view/download documents

3. Payment Security
   - Razorpay webhook signature verification
   - Idempotency keys to prevent duplicate payment recording
   - Payment gateway credentials stored in environment variables only

4. API Security
   - JWT authentication on all endpoints
   - Role-based permission check (Cashier, Counsellor, Admin)
   - Rate limiting on payment and document upload APIs
```

---

## Development Timeline

### Week 1: Student Registration & Admissions
- [ ] Create students, admissions, course_packages, student_documents tables
- [ ] Student CRUD APIs
- [ ] Document upload APIs (Multer + VPS Local Storage)
- [ ] Admission CRUD APIs
- [ ] Course package management APIs
- [ ] Admission number auto-generation logic

### Week 2: Fee Schedules & Discount
- [ ] fee_schedules, fee_payments, discounts tables
- [ ] Fee schedule creation APIs (full / installment)
- [ ] Discount apply & approval APIs
- [ ] Net payable calculation logic
- [ ] Fee schedule update APIs

### Week 3: Payments & Receipts
- [ ] Fee payment recording APIs (cash / offline)
- [ ] Razorpay / Stripe payment gateway integration
- [ ] Payment webhook handler
- [ ] PDF receipt generation (PDFKit)
- [ ] Receipt delivery via SMS + Email
- [ ] Receipt number auto-generation

### Week 4: Reminders, Analytics & Testing
- [ ] Fee due reminder cron job (node-cron + Bull queue)
- [ ] SMS + Email reminder templates
- [ ] Fee analytics APIs (collection, due, discount, source-wise)
- [ ] Chart.js integration on frontend
- [ ] Unit & integration tests
- [ ] Performance optimization

---

## Testing Strategy

```javascript
// Example: Admission Creation Test
describe('Admissions Management', () => {
  test('Create admission with valid data', async () => {
    const response = await request(app)
      .post('/api/v1/admissions')
      .set('Authorization', `Bearer ${token}`)
      .send({
        student_id: 1,
        course_package_id: 3,
        batch_id: 2,
        admission_date: '2026-04-01',
        total_fee: 25000,
        discount_amount: 2000,
        net_payable: 23000
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('admission_no');
  });

  test('Create fee schedule with installments', async () => {
    const response = await request(app)
      .post('/api/v1/admissions/1/fee-schedule')
      .set('Authorization', `Bearer ${token}`)
      .send({
        installments: [
          { installment_no: 1, due_date: '2026-04-01', amount: 12000 },
          { installment_no: 2, due_date: '2026-05-01', amount: 11000 }
        ]
      });

    expect(response.status).toBe(201);
    expect(response.body.installments).toHaveLength(2);
  });

  test('Record fee payment and generate receipt', async () => {
    const response = await request(app)
      .post('/api/v1/fee-payments')
      .set('Authorization', `Bearer ${token}`)
      .send({
        fee_schedule_id: 1,
        admission_id: 1,
        amount_paid: 12000,
        payment_mode: 'Cash',
        payment_date: '2026-04-01'
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('receipt_no');
  });
});
```

---

## Deployment Notes

```
Environment Variables Required:

# File Storage (Hostinger VPS Local)
UPLOAD_PATH=/var/www/upsurgeerp/uploads

# Payment Gateway
RAZORPAY_KEY_ID=<key_id>
RAZORPAY_KEY_SECRET=<key_secret>
RAZORPAY_WEBHOOK_SECRET=<webhook_secret>

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
# OR SendGrid
SENDGRID_API_KEY=your_key

# PDF
PDF_STORAGE_PATH=./receipts
```

---

## Deliverables

1. ✅ Student Registration & Document Management (VPS Local Storage)
2. ✅ Admissions Management with Course Package Assignment
3. ✅ Discount Management with Approval Workflow
4. ✅ Fee Schedule & Installment Management
5. ✅ Payment Collection (Cash + Online via Razorpay)
6. ✅ PDF Receipt Generation & Delivery (SMS/Email)
7. ✅ Automated Fee Due Reminders (Cron + Bull Queue)
8. ✅ Fee Analytics & Reports (6+ Reports)
9. ✅ API Documentation (Swagger)
10. ✅ Unit & Integration Tests

---

## Success Metrics

- [ ] Admission creation time < 3 minutes end-to-end
- [ ] Document upload success rate > 99%
- [ ] Payment gateway success rate > 98%
- [ ] PDF receipt generated within 5 seconds of payment
- [ ] Fee reminders delivered on time (within 1 hour of scheduled time)
- [ ] All APIs response time < 200ms
- [ ] Fee collection report loading < 1 second

---

**Document Version:** 1.0
**Phase:** 3 - Student Admissions & Fee Management
**Duration:** Months 4-5
**Prepared By:** Development Team
