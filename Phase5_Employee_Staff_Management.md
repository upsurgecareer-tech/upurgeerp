# UpsurgeERP - Phase 5: Employee & Staff Management

**Duration:** Month 8
**Status:** Employee & Staff Management Phase

---

## Overview

Phase 5 builds the complete Employee and Staff Management system for UpsurgeERP. It handles unlimited user creation, role-based permissions, payroll management, staff attendance, ID card generation, and teacher timesheet management.

---

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     EMPLOYEE & STAFF MANAGEMENT SYSTEM                   │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                          STAFF ENTRY POINTS                              │
├─────────────────────┬─────────────────────┬─────────────────────────────┤
│   Super Admin       │   Branch Admin      │   HR Manager                │
│   (Org Level)       │   (Branch Level)    │   (Staff Level)             │
└──────────┬──────────┴──────────┬──────────┴──────────┬──────────────────┘
           │                     │                      │
           └─────────────────────┴──────────────────────┘
                                 │
                                 ▼
                 ┌───────────────────────────────┐
                 │      Staff Processing         │
                 │   - User Account Creation     │
                 │   - Role Assignment           │
                 │   - Department Assignment     │
                 │   - Salary Setup              │
                 └───────────────┬───────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐   ┌───────────────────┐   ┌─────────────────────┐
│   Staff DB      │   │   Payroll         │   │   ID Card           │
│   (PostgreSQL)  │   │   Engine          │   │   Generator         │
│                 │   │   (Salary Calc)   │   │   (Canvas/PDF)      │
└─────────────────┘   └───────────────────┘   └─────────────────────┘
         │
         ▼
┌─────────────────┐   ┌───────────────────┐
│   Attendance    │   │   Timesheet       │
│   System        │   │   Engine          │
│   (Biometric /  │   │   (Faculty Hours) │
│    Manual)      │   │                   │
└─────────────────┘   └───────────────────┘
```

---

## Staff Onboarding Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        STAFF ONBOARDING FLOW                             │
└─────────────────────────────────────────────────────────────────────────┘

  Admin / HR Opens Staff Module
          │
          ▼
  ┌───────────────────┐
  │  Create Staff     │
  │  Profile          │
  │  - Full Name      │
  │  - Mobile         │
  │  - Email          │
  │  - DOB            │
  │  - Address        │
  │  - Photo          │
  └────────┬──────────┘
           │
           ▼
  ┌───────────────────┐
  │  Assign Role &    │
  │  Department       │
  │  - Role           │
  │    (Faculty /     │
  │     Counsellor /  │
  │     Cashier /     │
  │     Admin / etc.) │
  │  - Department     │
  │  - Branch         │
  └────────┬──────────┘
           │
           ▼
  ┌───────────────────┐
  │  Set Salary       │
  │  Structure        │
  │  - Basic Salary   │
  │  - Allowances     │
  │  - Deductions     │
  │  - PF / TDS       │
  └────────┬──────────┘
           │
           ▼
  ┌───────────────────┐
  │  Generate         │
  │  Login Credentials│
  │  - Username       │
  │  - Password       │
  └────────┬──────────┘
           │
           ▼
  ┌───────────────────┐        ┌──────────────────────────┐
  │  Generate ID Card │───────►│  ID Card PDF Sent        │
  │  & Send Welcome   │        │  via Email / SMS         │
  │  Email            │        └──────────────────────────┘
  └───────────────────┘
```

---

## Payroll Processing Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        PAYROLL PROCESSING FLOW                           │
└─────────────────────────────────────────────────────────────────────────┘

  End of Month
       │
       ▼
  ┌───────────────────┐
  │  Fetch Attendance │
  │  Data for Month   │
  │  (All Staff)      │
  └────────┬──────────┘
           │
           ▼
  ┌───────────────────┐
  │  Calculate        │
  │  Working Days     │
  │  & Leave Days     │
  └────────┬──────────┘
           │
           ▼
  ┌───────────────────┐
  │  Apply Salary     │
  │  Formula          │
  │  - Basic          │
  │  - HRA            │
  │  - Allowances     │
  │  - Deductions     │
  │  - PF / TDS       │
  └────────┬──────────┘
           │
           ▼
  ┌───────────────────┐
  │  Generate         │
  │  Payslip (PDF)    │
  │  per Employee     │
  └────────┬──────────┘
           │
           ├──────────────────────────────────────────┐
           │                                          │
           ▼                                          ▼
  ┌───────────────────┐                   ┌───────────────────┐
  │  Admin Reviews    │                   │  Auto Send        │
  │  & Approves       │                   │  Payslip via      │
  │  Payroll          │                   │  Email to Staff   │
  └────────┬──────────┘                   └───────────────────┘
           │
           ▼
  ┌───────────────────┐
  │  Payroll Posted   │──── Linked to Accounting Module
  │  to Accounts      │──── Expense Entry Auto-created
  └───────────────────┘
```

---

## Role-Based Access Control Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      ROLE-BASED ACCESS CONTROL FLOW                      │
└─────────────────────────────────────────────────────────────────────────┘

  User Logs In
       │
       ▼
  ┌───────────────────┐
  │  JWT Token        │
  │  Verified         │
  └────────┬──────────┘
           │
           ▼
  ┌───────────────────┐
  │  Role Fetched     │
  │  from DB          │
  └────────┬──────────┘
           │
           ├─────────────────────────────────────────────────────┐
           │                    │                    │           │
           ▼                    ▼                    ▼           ▼
  ┌──────────────┐   ┌──────────────────┐   ┌────────────┐  ┌────────┐
  │  Super Admin │   │  Branch Admin    │   │  Faculty   │  │Cashier │
  │  All Modules │   │  Branch Modules  │   │  Batches / │  │  Fee   │
  │  All Branches│   │  Own Branch Only │   │  Attendance│  │ Module │
  └──────────────┘   └──────────────────┘   └────────────┘  └────────┘
           │
           ▼
  ┌───────────────────┐
  │  Permission Check │──── Allow / Deny per API endpoint
  │  Middleware       │──── Menu items shown/hidden on UI
  └───────────────────┘
```

---

## Teacher Timesheet Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       TEACHER TIMESHEET FLOW                             │
└─────────────────────────────────────────────────────────────────────────┘

  Faculty Logs In
       │
       ▼
  ┌───────────────────┐
  │  View My          │
  │  Timetable        │
  │  (Weekly View)    │
  └────────┬──────────┘
           │
           ▼
  ┌───────────────────┐
  │  Mark Class       │
  │  Conducted        │
  │  - Batch          │
  │  - Subject        │
  │  - Date & Time    │
  │  - Topics Covered │
  └────────┬──────────┘
           │
           ▼
  ┌───────────────────┐
  │  Timesheet        │
  │  Updated          │──── Total Hours Calculated
  └────────┬──────────┘──── Monthly Summary Generated
           │
           ▼
  ┌───────────────────┐
  │  Admin Reviews    │
  │  Timesheet        │──── Approve / Reject
  └────────┬──────────┘
           │
           ▼
  ┌───────────────────┐
  │  Linked to        │──── Payroll Calculation
  │  Payroll          │──── Per Hour / Per Class Pay
  └───────────────────┘
```

---

## Database Schema

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            DATABASE SCHEMA                               │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────┐         ┌──────────────────────────┐
│          users           │         │          roles           │
├──────────────────────────┤         ├──────────────────────────┤
│ id (PK)                  │         │ id (PK)                  │
│ branch_id (FK)           │         │ name                     │
│ role_id (FK)             ├────────►│ (SuperAdmin/Admin/       │
│ department_id (FK)       │         │  Faculty/Counsellor/     │
│ name                     │         │  Cashier/Clerk)          │
│ email                    │         │ is_active                │
│ mobile                   │         │ created_at               │
│ password_hash            │         └──────────────────────────┘
│ photo_url                │
│ dob                      │         ┌──────────────────────────┐
│ address                  │         │     role_permissions     │
│ joining_date             │         ├──────────────────────────┤
│ is_active                │         │ id (PK)                  │
│ created_at               │         │ role_id (FK)             │
└──────────┬───────────────┘         │ module                   │
           │                         │ can_view                 │
           │                         │ can_create               │
           │                         │ can_edit                 │
           │                         │ can_delete               │
           │                         └──────────────────────────┘
           │
           ▼
┌──────────────────────────┐         ┌──────────────────────────┐
│      salary_structures   │         │        payroll           │
├──────────────────────────┤         ├──────────────────────────┤
│ id (PK)                  │         │ id (PK)                  │
│ user_id (FK)             │         │ user_id (FK)             │
│ basic_salary             ├────────►│ month                    │
│ hra                      │         │ year                     │
│ other_allowances         │         │ working_days             │
│ pf_deduction             │         │ present_days             │
│ tds_deduction            │         │ basic_paid               │
│ other_deductions         │         │ total_allowances         │
│ effective_from           │         │ total_deductions         │
│ created_at               │         │ net_salary               │
└──────────────────────────┘         │ status (Draft/Approved)  │
                                     │ payslip_url              │
                                     │ created_at               │
                                     └──────────────────────────┘

┌──────────────────────────┐         ┌──────────────────────────┐
│     staff_attendance     │         │      timesheets          │
├──────────────────────────┤         ├──────────────────────────┤
│ id (PK)                  │         │ id (PK)                  │
│ user_id (FK)             │         │ user_id (FK)             │
│ date                     │         │ batch_id (FK)            │
│ in_time                  │         │ subject                  │
│ out_time                 │         │ date                     │
│ status                   │         │ start_time               │
│ (Present/Absent/Leave/   │         │ end_time                 │
│  Half-Day)               │         │ topics_covered           │
│ marked_by                │         │ hours                    │
│ (Biometric/Manual)       │         │ status                   │
│ created_at               │         │ (Pending/Approved)       │
└──────────────────────────┘         │ created_at               │
                                     └──────────────────────────┘

┌──────────────────────────┐         ┌──────────────────────────┐
│       departments        │         │        id_cards          │
├──────────────────────────┤         ├──────────────────────────┤
│ id (PK)                  │         │ id (PK)                  │
│ branch_id (FK)           │         │ user_id (FK)             │
│ name                     │         │ card_url (VPS)           │
│ (Teaching/Non-Teaching/  │         │ generated_at             │
│  Admin/Sales)            │         │ is_active                │
│ is_active                │         └──────────────────────────┘
│ created_at               │
└──────────────────────────┘
```

---

## API Endpoints

### Staff Management
```
POST   /api/v1/staff                              → Create new staff
GET    /api/v1/staff                              → List all staff (with filters)
GET    /api/v1/staff/:id                          → Get staff detail
PUT    /api/v1/staff/:id                          → Update staff info
DELETE /api/v1/staff/:id                          → Delete staff
PUT    /api/v1/staff/:id/status                   → Activate / deactivate staff
PUT    /api/v1/staff/:id/reset-password           → Reset staff password
```

### Roles & Permissions
```
POST   /api/v1/roles                              → Create role
GET    /api/v1/roles                              → List all roles
GET    /api/v1/roles/:id                          → Get role detail
PUT    /api/v1/roles/:id                          → Update role
DELETE /api/v1/roles/:id                          → Delete role
PUT    /api/v1/roles/:id/permissions              → Update role permissions
GET    /api/v1/roles/:id/permissions              → Get role permissions
```

### Salary & Payroll
```
POST   /api/v1/staff/:id/salary                   → Set salary structure
GET    /api/v1/staff/:id/salary                   → Get salary structure
PUT    /api/v1/staff/:id/salary                   → Update salary structure
POST   /api/v1/payroll/generate                   → Generate monthly payroll
GET    /api/v1/payroll                            → List all payroll records
GET    /api/v1/payroll/:id                        → Get payroll detail
PUT    /api/v1/payroll/:id/approve                → Approve payroll
GET    /api/v1/payroll/:id/payslip                → Download payslip PDF
GET    /api/v1/staff/:id/payroll                  → Staff payroll history
```

### Staff Attendance
```
POST   /api/v1/staff/attendance                   → Mark staff attendance (manual)
POST   /api/v1/staff/attendance/biometric         → Mark via biometric
GET    /api/v1/staff/attendance                   → List attendance (with filters)
GET    /api/v1/staff/:id/attendance               → Staff attendance history
PUT    /api/v1/staff/attendance/:id               → Edit attendance (Admin only)
GET    /api/v1/staff/attendance/summary           → Monthly attendance summary
```

### Timesheet
```
POST   /api/v1/timesheets                         → Add timesheet entry
GET    /api/v1/timesheets                         → List timesheets (with filters)
GET    /api/v1/staff/:id/timesheets               → Staff timesheet history
PUT    /api/v1/timesheets/:id                     → Update timesheet entry
PUT    /api/v1/timesheets/:id/approve             → Approve timesheet
GET    /api/v1/timesheets/summary/:userId         → Monthly hours summary
```

### ID Card
```
POST   /api/v1/staff/:id/idcard                   → Generate ID card
GET    /api/v1/staff/:id/idcard                   → Download ID card PDF
POST   /api/v1/staff/:id/idcard/regenerate        → Regenerate ID card
```

### Departments
```
POST   /api/v1/departments                        → Create department
GET    /api/v1/departments                        → List departments
PUT    /api/v1/departments/:id                    → Update department
DELETE /api/v1/departments/:id                    → Delete department
```

### Analytics & Reports
```
GET    /api/v1/analytics/staff/attendance         → Staff attendance report
GET    /api/v1/analytics/staff/payroll            → Payroll summary report
GET    /api/v1/analytics/staff/timesheet          → Faculty timesheet report
GET    /api/v1/analytics/staff/department-wise    → Department-wise staff count
```

---

## External Integrations

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        EXTERNAL INTEGRATIONS                             │
└─────────────────────────────────────────────────────────────────────────┘

  ┌─────────────────────┐
  │   Canvas API /      │◄─── ID Card Design ─  POST /api/v1/staff/:id/idcard
  │   Fabric.js         │──── PDF Export ─────► Download ID Card PDF
  │   (ID Card Design)  │
  └─────────────────────┘

  ┌─────────────────────┐
  │   PDFKit / jsPDF    │◄─── Payslip PDF ────  GET /api/v1/payroll/:id/payslip
  │   (PDF Generation)  │                       (Monthly payslip per employee)
  └─────────────────────┘

  ┌─────────────────────┐
  │   Excel.js /        │◄─── Export Report ─  GET /api/v1/analytics/staff/*
  │   SheetJS           │                       (Attendance & payroll Excel export)
  └─────────────────────┘

  ┌─────────────────────┐
  │   Biometric SDK     │◄─── Device Push ───  POST /api/v1/staff/attendance/biometric
  │   (ZKTeco / ESSL)   │                      (Auto-push on fingerprint match)
  └─────────────────────┘

  ┌─────────────────────┐
  │   Cloudinary        │◄─── File Upload ────  Staff photos, ID cards, payslips
  │   (File Storage)    │──── Secure URL ─────► Secure download links
  └─────────────────────┘

  ┌─────────────────────┐
  │   SendGrid /        │◄─── Payslip Email ─  Auto-send payslip on approval
  │   SMTP (Gmail)      │──── Welcome Email ─► New staff onboarding email
  └─────────────────────┘
```

---

## Technology Stack

### Backend
```
Node.js + Express.js
├── bcryptjs           → Password hashing
├── jsonwebtoken       → JWT token generation
├── canvas / fabric.js → ID card design & generation
├── pdfkit             → Payslip PDF generation
├── exceljs / sheetjs  → Excel report export
├── nodemailer         → Email sending (SMTP)
├── bull               → Job queue for payroll processing
├── node-cron          → Monthly payroll auto-generation trigger
└── express-validator  → Input validation
```

### Database
```
MySQL 8.0+
├── users table
├── roles table
├── role_permissions table
├── departments table
├── salary_structures table
├── payroll table
├── staff_attendance table
├── timesheets table
└── id_cards table

Redis
├── Permission cache (role-wise)
└── Payroll generation job queue
```

---

## Module Breakdown

### 1. Unlimited User Creation

#### Features:
- Create unlimited staff accounts
- Unique login credentials per staff
- Staff profile with photo, DOB, address, joining date
- Branch-wise staff management
- Active / inactive toggle
- Password reset by admin

---

### 2. Role-Based Permissions

#### Roles:
- Super Admin → Full access all branches
- Branch Admin → Full access own branch
- Faculty → Batches, attendance, timesheet, LMS
- Counsellor → CRM, leads, admissions
- Cashier → Fee collection, receipts
- Clerk → Student records, documents

#### Features:
- Custom permission per role (View / Create / Edit / Delete)
- Module-level permission control
- UI menu items shown/hidden based on role
- API-level permission middleware
- Permission cache in Redis for performance

---

### 3. Payroll Management

#### Features:
- Salary structure per employee (Basic, HRA, Allowances, Deductions, PF, TDS)
- Monthly payroll auto-generation
- Attendance-based salary calculation
- Leave deduction logic
- Payslip PDF generation
- Admin approval workflow
- Auto-send payslip via email on approval
- Payroll history per employee
- Payroll linked to accounting module

---

### 4. Staff Attendance

#### Features:
- Manual attendance marking by admin/HR
- Biometric integration (ZKTeco / ESSL)
- In-time and out-time tracking
- Status: Present / Absent / Leave / Half-Day
- Monthly attendance summary
- Late arrival tracking
- Attendance report export (Excel / PDF)
- Admin edit with reason log

---

### 5. ID Card Generation

#### Features:
- Auto-generate ID card on staff creation
- Institute logo, name, photo, designation, employee ID
- QR code on ID card (for attendance scanning)
- PDF download and print
- Regenerate if lost
- Stored on VPS Local Storage

---

### 6. Teacher Timesheet Management

#### Features:
- Faculty logs classes conducted per day
- Batch, subject, date, time, topics covered
- Total hours auto-calculated per month
- Admin approval workflow
- Per-hour / per-class pay calculation
- Timesheet linked to payroll
- Monthly timesheet summary report

---

## Security Implementation

```
1. Staff Data Access Control
   - HR / Admin can view all staff
   - Staff can view only their own profile
   - Branch Admin sees only branch staff
   - Super Admin sees all staff across branches

2. Password Security
   - Passwords hashed with bcryptjs (salt rounds: 12)
   - Password reset via secure email link (expires in 1 hour)
   - First login forces password change

3. Permission Security
   - Every API endpoint checks role permission
   - Permission data cached in Redis (TTL: 1 hour)
   - Cache invalidated on permission update

4. Payslip Security
   - Payslips stored on private VPS directory
   - Access via secure API endpoints with JWT authentication
   - Only HR, Admin, and the employee can access own payslip

5. API Security
   - JWT authentication on all endpoints
   - Role-based middleware on every route
   - Rate limiting on login and password reset APIs
```

---

## Development Timeline

### Week 1: Staff & Role Management
- [ ] Create users, roles, role_permissions, departments tables
- [ ] Staff CRUD APIs
- [ ] Role & permission CRUD APIs
- [ ] Permission middleware implementation
- [ ] Redis permission cache
- [ ] Staff photo upload (VPS Local Storage)
- [ ] Login credential generation & welcome email

### Week 2: Payroll & Salary
- [ ] salary_structures, payroll tables
- [ ] Salary structure CRUD APIs
- [ ] Monthly payroll generation logic
- [ ] Attendance-based salary calculation
- [ ] Leave deduction logic
- [ ] Payslip PDF generation (PDFKit)
- [ ] Payroll approval workflow
- [ ] Auto-send payslip via email

### Week 3: Attendance, Timesheet & ID Card
- [ ] staff_attendance, timesheets, id_cards tables
- [ ] Staff attendance APIs (manual + biometric)
- [ ] Timesheet CRUD APIs
- [ ] Timesheet approval workflow
- [ ] ID card generation (Canvas API / Fabric.js)
- [ ] ID card PDF download (VPS Local Storage)
- [ ] QR code on ID card

### Week 4: Reports & Testing
- [ ] Staff attendance report APIs
- [ ] Payroll summary report
- [ ] Faculty timesheet report
- [ ] Excel export (ExcelJS / SheetJS)
- [ ] Department-wise staff report
- [ ] Unit & integration tests
- [ ] Performance optimization

---

## Testing Strategy

```javascript
// Example: Staff Management Tests
describe('Employee & Staff Management', () => {
  test('Create staff with valid data', async () => {
    const response = await request(app)
      .post('/api/v1/staff')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'John Faculty',
        email: 'john@upsurgeerp.com',
        mobile: '9999999999',
        role_id: 3,
        department_id: 1,
        joining_date: '2026-06-01'
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
  });

  test('Generate monthly payroll', async () => {
    const response = await request(app)
      .post('/api/v1/payroll/generate')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ month: 6, year: 2026 });

    expect(response.status).toBe(201);
    expect(response.body.generated_count).toBeGreaterThan(0);
  });

  test('Permission denied for unauthorized role', async () => {
    const response = await request(app)
      .get('/api/v1/payroll')
      .set('Authorization', `Bearer ${facultyToken}`);

    expect(response.status).toBe(403);
  });

  test('Generate ID card for staff', async () => {
    const response = await request(app)
      .post('/api/v1/staff/1/idcard')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('card_url');
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

# Biometric Device
BIOMETRIC_DEVICE_IP=192.168.1.100
BIOMETRIC_DEVICE_PORT=4370
BIOMETRIC_SDK=zkteco

# Auth
JWT_SECRET=<secret_key>
JWT_EXPIRY=7d
BCRYPT_SALT_ROUNDS=12

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
PERMISSION_CACHE_TTL=3600
```

---

## Deliverables

1. ✅ Unlimited Staff / User Creation with Login Credentials
2. ✅ Role-Based Access Control (6 Roles with Custom Permissions)
3. ✅ Salary Structure Setup per Employee
4. ✅ Monthly Payroll Generation with Attendance-based Calculation
5. ✅ Payslip PDF Generation & Email Delivery
6. ✅ Staff Attendance (Manual + Biometric)
7. ✅ Teacher Timesheet Management with Approval Workflow
8. ✅ ID Card Generation with QR Code (PDF)
9. ✅ Staff Reports (Attendance, Payroll, Timesheet, Department-wise)
10. ✅ API Documentation (Swagger)
11. ✅ Unit & Integration Tests

---

## Success Metrics

- [ ] Staff creation to login ready < 2 minutes
- [ ] Payroll generation for 100 staff < 10 seconds
- [ ] Payslip PDF generated within 5 seconds
- [ ] ID card generated within 3 seconds
- [ ] Permission check API response < 50ms (with Redis cache)
- [ ] All APIs response time < 200ms
- [ ] Attendance report export < 2 seconds

---

**Document Version:** 1.0
**Phase:** 5 - Employee & Staff Management
**Duration:** Month 8
**Prepared By:** Development Team
