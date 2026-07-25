# UpsurgeERP API Documentation

## Base URL
```
Production: https://api.upsurgeerp.com/api/v1
Development: http://localhost:3000/api/v1
```

## Authentication
All endpoints require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

---

## 1. Authentication APIs

### POST /auth/login
Login user and get JWT token
```json
Request:
{
  "email": "admin@upsurgeerp.com",
  "password": "admin123"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "admin@upsurgeerp.com",
    "role": "Admin"
  }
}
```

### POST /auth/register
Register new user (Admin only)

### POST /auth/forgot-password
Request password reset

### POST /auth/reset-password
Reset password with token

---

## 2. Lead Management APIs

### POST /leads
Create new lead
```json
Request:
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "courseInterest": "Web Development",
  "source": "Website",
  "remarks": "Interested in full-stack course"
}

Validation:
- name: 2-100 characters, required
- phone: 10 digits, required
- email: valid email format
- source: Website|Walk-in|Referral|Social Media|Advertisement|Other
```

### GET /leads
Get all leads with filters
```
Query Params:
- status: New|Contacted|Qualified|Converted|Lost
- source: Website|Walk-in|Referral|etc
- assignedTo: userId
- startDate: YYYY-MM-DD
- endDate: YYYY-MM-DD
```

### GET /leads/:id
Get single lead by ID

### PUT /leads/:id
Update lead details

### PUT /leads/:id/stage
Update lead stage/status

### PUT /leads/:id/assign
Assign lead to counsellor

### DELETE /leads/:id
Delete lead (soft delete)

---

## 3. Student Management APIs

### POST /students
Create new student
```json
Request:
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@example.com",
  "phone": "9876543210",
  "dateOfBirth": "2000-01-15",
  "gender": "Female",
  "address": "123 Main St",
  "courseId": 1,
  "batchId": 2,
  "guardianName": "John Smith",
  "guardianPhone": "9876543211"
}

Validation:
- firstName, lastName: 2-50 characters, required
- email: valid email, required
- phone: 10 digits, required
- dateOfBirth: past date, required
- gender: Male|Female|Other
```

### GET /students
Get all students with filters
```
Query Params:
- status: Active|Inactive|Graduated|Dropped
- batchId: number
- courseId: number
- search: name/email/phone search
```

### GET /students/:id
Get student details with course, batch, fee info

### PUT /students/:id
Update student details

### DELETE /students/:id
Delete student

### POST /students/:id/generate-idcard
Generate student ID card PDF

### POST /students/:student_id/documents
Upload student document

### GET /students/:student_id/documents
Get student documents

---

## 4. Fee Management APIs

### POST /fee-payments
Create fee payment
```json
Request:
{
  "studentId": 1,
  "amount": 5000,
  "paymentMethod": "UPI",
  "paymentDate": "2024-01-15",
  "dueDate": "2024-02-15",
  "transactionId": "TXN123456",
  "remarks": "First installment"
}

Validation:
- studentId: positive integer, required
- amount: positive number, required
- paymentMethod: Cash|Card|UPI|Bank Transfer|Cheque
- paymentDate: date, required
```

### GET /fee-payments
Get all fee payments
```
Query Params:
- studentId: number
- status: Pending|Paid|Overdue
- startDate: YYYY-MM-DD
- endDate: YYYY-MM-DD
```

### GET /fee-payments/:id
Get payment details

### PATCH /fee-payments/:id/status
Update payment status

---

## 5. Attendance APIs

### POST /attendance/mark
Mark attendance
```json
Request:
{
  "batchId": 1,
  "date": "2024-01-15",
  "attendanceRecords": [
    { "studentId": 1, "status": "Present" },
    { "studentId": 2, "status": "Absent" }
  ]
}
```

### GET /attendance
Get attendance records
```
Query Params:
- batchId: number
- studentId: number
- startDate: YYYY-MM-DD
- endDate: YYYY-MM-DD
```

### POST /qr/generate
Generate QR code for attendance

### POST /qr/scan
Mark attendance via QR scan

---

## 6. Exam Management APIs

### POST /exams
Create exam
```json
Request:
{
  "name": "Mid-term Exam",
  "courseId": 1,
  "batchId": 2,
  "examDate": "2024-02-15",
  "duration": 120,
  "totalMarks": 100,
  "passingMarks": 40,
  "examType": "Theory"
}

Validation:
- name: 3-100 characters, required
- examDate: future date, required
- duration: positive integer (minutes)
- totalMarks, passingMarks: positive numbers
- examType: Theory|Practical|Online|Assignment
```

### GET /exams
Get all exams

### POST /exams/:id/results
Submit exam results

### GET /exams/:id/results
Get exam results

---

## 7. Certificate APIs

### POST /certificates/generate
Generate certificate
```json
Request:
{
  "studentId": 1,
  "certificateType": "Course Completion",
  "issueDate": "2024-01-15",
  "grade": "A"
}
```

### GET /certificates/:id/download
Download certificate PDF

### GET /certificates/verify/:certificateNumber
Verify certificate authenticity

---

## 8. Library Management APIs

### POST /library/books
Add new book

### GET /library/books
Get all books
```
Query Params:
- search: title/author/isbn
- category: string
- status: Available|Issued|Lost|Damaged
```

### POST /library/issues
Issue book to student
```json
Request:
{
  "bookId": 1,
  "studentId": 5,
  "dueDate": "2024-02-15"
}

Validation:
- bookId, studentId: positive integers, required
- dueDate: future date, required
```

### PATCH /library/issues/:id/return
Return book
```json
Response:
{
  "message": "Book returned successfully",
  "fineAmount": 25,
  "issue": {...}
}

Note: Fine calculated at Rs. 5 per day after due date
```

### GET /library/issues/overdue
Get overdue books

---

## 9. Accounting APIs

### POST /accounting/account-heads
Create account head

### GET /accounting/account-heads
Get account heads
```
Query Params:
- type: Asset|Liability|Income|Expense|Equity
```

### POST /accounting/transactions
Create transaction
```json
Request:
{
  "transactionDate": "2024-01-15",
  "type": "Receipt",
  "description": "Fee collection",
  "entries": [
    {
      "accountHeadId": 1,
      "debit": 5000,
      "credit": 0
    },
    {
      "accountHeadId": 2,
      "debit": 0,
      "credit": 5000
    }
  ]
}

Validation:
- entries: minimum 2 entries required
- Total debit must equal total credit
```

### GET /accounting/reports/balance-sheet
Get balance sheet
```
Query Params:
- date: YYYY-MM-DD (defaults to today)

Response:
{
  "asOfDate": "2024-01-15",
  "assets": [...],
  "liabilities": [...],
  "equity": [...],
  "totalAssets": 500000,
  "totalLiabilities": 300000,
  "totalEquity": 200000,
  "balanced": true
}
```

### GET /accounting/reports/profit-loss
Get profit & loss statement
```
Query Params:
- startDate: YYYY-MM-DD
- endDate: YYYY-MM-DD

Response:
{
  "startDate": "2024-01-01",
  "endDate": "2024-01-31",
  "income": [...],
  "expenses": [...],
  "totalIncome": 100000,
  "totalExpenses": 60000,
  "netProfit": 40000,
  "profitMargin": "40.00"
}
```

### GET /accounting/reports/trial-balance
Get trial balance

---

## 10. Notice Board APIs

### POST /notices
Create notice
```json
Request:
{
  "title": "Holiday Announcement",
  "content": "Institute will remain closed on...",
  "targetAudience": "All",
  "priority": "High",
  "publishDate": "2024-01-15",
  "expiryDate": "2024-01-20",
  "attachments": ["file1.pdf", "file2.jpg"]
}

Validation:
- title: 5-200 characters, required
- content: minimum 10 characters, required
- targetAudience: All|Students|Staff|Parents|Specific
- priority: Low|Medium|High|Urgent
- expiryDate: must be after publishDate
```

### GET /notices
Get notices with filters
```
Query Params:
- audience: All|Students|Staff|Parents
- priority: Low|Medium|High|Urgent
- active: true|false
```

### GET /notices/active
Get top 10 active notices

### PUT /notices/:id
Update notice

### DELETE /notices/:id
Delete notice

---

## 11. Analytics APIs

### GET /analytics/lead-source
Lead source analytics (cached 10 min)

### GET /analytics/lead-conversion
Lead conversion rate (cached 10 min)

### GET /reports/dashboard
Dashboard summary
```
Response:
{
  "totalStudents": 500,
  "activeLeads": 120,
  "monthlyRevenue": 250000,
  "pendingFees": 50000,
  "attendanceRate": 85.5,
  "recentActivities": [...]
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "must be a valid email"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "status": "error",
  "message": "Invalid or expired token"
}
```

### 404 Not Found
```json
{
  "status": "error",
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "status": "error",
  "message": "Internal server error"
}
```

---

## Rate Limiting
- 100 requests per 15 minutes per IP
- Exceeding limit returns 429 Too Many Requests

## Caching
Analytics endpoints cached for 10 minutes using Redis

## Performance
- Database indexes on frequently queried columns
- Redis caching for heavy queries
- Response time: <200ms for most endpoints

---

**Last Updated:** 2024
**Version:** 1.0
**Support:** support@upsurgeerp.com
