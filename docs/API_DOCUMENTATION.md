# API Documentation - UpsurgeERP

## Base URL
```
Development: http://localhost:3000/api/v1
Production: https://yourdomain.com/api/v1
```

## Authentication
All endpoints (except login/register) require JWT token in header:
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
  "user": { "id": 1, "email": "admin@upsurgeerp.com", "role": "Admin" }
}
```

### POST /auth/register
Register new user
```json
Request:
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "Pass@123",
  "roleId": 2,
  "organizationId": 1
}
```

### GET /auth/me
Get current user profile

---

## 2. Lead Management APIs

### POST /leads
Create new lead
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@example.com",
  "phone": "1234567890",
  "sourceId": 1,
  "courseInterest": "Web Development"
}
```

### GET /leads
Get all leads (with filters)
```
Query params: ?stage=New&sourceId=1&search=Jane
```

### GET /leads/:id
Get lead by ID

### PATCH /leads/:id
Update lead

### POST /follow-ups
Create follow-up
```json
{
  "leadId": 1,
  "followUpDate": "2024-01-15",
  "notes": "Called and discussed course details",
  "nextAction": "Send brochure"
}
```

---

## 3. Student Management APIs

### POST /students
Create student
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "dateOfBirth": "2000-01-01",
  "gender": "Male",
  "address": "123 Main St"
}
```

### GET /students
Get all students

### GET /students/:id
Get student details

### PATCH /students/:id
Update student

---

## 4. Admission & Fee APIs

### POST /admissions
Create admission
```json
{
  "studentId": 1,
  "coursePackageId": 1,
  "admissionDate": "2024-01-01",
  "totalFees": 50000,
  "discount": 5000
}
```

### POST /fee-payments
Record fee payment
```json
{
  "studentId": 1,
  "amount": 10000,
  "paymentMode": "Cash",
  "paymentDate": "2024-01-15"
}
```

### GET /fee-payments
Get payment history

---

## 5. Batch & Attendance APIs

### POST /batches
Create batch
```json
{
  "name": "Web Dev Batch 1",
  "courseId": 1,
  "startDate": "2024-01-01",
  "endDate": "2024-06-30",
  "capacity": 30
}
```

### POST /attendance/sessions
Create attendance session
```json
{
  "batchId": 1,
  "date": "2024-01-15",
  "startTime": "09:00",
  "endTime": "12:00"
}
```

### POST /attendance/mark
Mark attendance
```json
{
  "sessionId": 1,
  "studentId": 1,
  "status": "Present"
}
```

### GET /attendance/qr/:sessionId
Get QR code for session

---

## 6. Staff & Payroll APIs

### POST /staff
Create staff member
```json
{
  "firstName": "Jane",
  "lastName": "Teacher",
  "email": "jane@example.com",
  "phone": "1234567890",
  "departmentId": 1,
  "designation": "Senior Faculty",
  "joiningDate": "2024-01-01"
}
```

### POST /payroll
Process payroll
```json
{
  "userId": 2,
  "month": "2024-01",
  "basicSalary": 50000,
  "allowances": 5000,
  "deductions": 2000
}
```

---

## 7. Exam & Certificate APIs

### POST /questions
Create question
```json
{
  "courseId": 1,
  "questionText": "What is React?",
  "questionType": "MCQ",
  "options": ["Library", "Framework", "Language", "Tool"],
  "correctAnswer": "Library",
  "marks": 2
}
```

### POST /exams
Create exam
```json
{
  "title": "React Fundamentals",
  "courseId": 1,
  "examDate": "2024-02-01",
  "duration": 120,
  "totalMarks": 100,
  "passMarks": 50
}
```

### POST /certificates
Generate certificate
```json
{
  "studentId": 1,
  "courseId": 1,
  "issueDate": "2024-06-30",
  "grade": "A"
}
```

---

## 8. LMS APIs

### POST /lms/videos
Upload video lecture
```json
{
  "courseId": 1,
  "title": "Introduction to React",
  "description": "Learn React basics",
  "videoUrl": "/uploads/videos/react-intro.mp4",
  "duration": 3600
}
```

### POST /lms/assignments
Create assignment
```json
{
  "courseId": 1,
  "title": "Build Todo App",
  "description": "Create a React todo application",
  "dueDate": "2024-02-15",
  "maxMarks": 50
}
```

### POST /lms/live-classes
Schedule live class
```json
{
  "courseId": 1,
  "title": "Live Q&A Session",
  "scheduledAt": "2024-01-20T10:00:00Z",
  "duration": 60,
  "meetingLink": "https://zoom.us/j/123456789"
}
```

---

## 9. Portal & Chat APIs

### GET /portal/student/dashboard
Get student dashboard

### GET /portal/parent/dashboard
Get parent dashboard

### POST /chat/send
Send chat message
```json
{
  "receiverId": 2,
  "message": "Hello, I have a question about the assignment"
}
```

### GET /chat/conversations
Get all conversations

---

## 10. Accounting APIs

### POST /accounting/account-heads
Create account head
```json
{
  "name": "Salary Expense",
  "code": "ACC009",
  "type": "Expense"
}
```

### POST /accounting/transactions
Create transaction
```json
{
  "transactionDate": "2024-01-15",
  "type": "Payment",
  "description": "Salary payment",
  "entries": [
    { "accountHeadId": 4, "debit": 50000 },
    { "accountHeadId": 1, "credit": 50000 }
  ]
}
```

### POST /accounting/expenses
Create expense
```json
{
  "accountHeadId": 5,
  "expenseDate": "2024-01-15",
  "amount": 5000,
  "paymentMethod": "Cash",
  "description": "Office rent"
}
```

---

## 11. Library & Inventory APIs

### POST /library/books
Add book
```json
{
  "isbn": "9780134685991",
  "title": "Effective Java",
  "author": "Joshua Bloch",
  "quantity": 5,
  "rackNumber": "A1"
}
```

### POST /library/issues
Issue book
```json
{
  "bookId": 1,
  "studentId": 1,
  "issueDate": "2024-01-15",
  "dueDate": "2024-02-15"
}
```

### POST /inventory/items
Add inventory item
```json
{
  "itemCode": "INV003",
  "name": "Laptop",
  "category": "Electronics",
  "quantity": 10,
  "unitPrice": 50000
}
```

---

## 12. Communication APIs

### POST /communication/send-email
Send email
```json
{
  "recipientType": "Student",
  "recipientId": 1,
  "recipientEmail": "student@example.com",
  "subject": "Fee Reminder",
  "message": "Your fee is due",
  "templateId": 1
}
```

### POST /communication/send-sms
Send SMS
```json
{
  "recipientType": "Parent",
  "recipientId": 1,
  "recipientPhone": "1234567890",
  "message": "Your child was absent today",
  "templateId": 2
}
```

### POST /communication/announcements
Create announcement
```json
{
  "title": "Holiday Notice",
  "message": "Institute will be closed on 26th Jan",
  "type": "Holiday",
  "targetAudience": "All",
  "publishDate": "2024-01-20"
}
```

---

## 13. Reports & Analytics APIs

### GET /reports/dashboard
Get dashboard statistics

### GET /reports/students
Get student report
```
Query: ?status=Active&startDate=2024-01-01&endDate=2024-12-31
```

### GET /reports/fee-collection
Get fee collection report

### GET /reports/attendance
Get attendance report

### GET /reports/export
Export report as CSV
```
Query: ?reportType=students&format=csv
```

### GET /analytics-new/student-growth
Get student growth trends

### GET /analytics-new/revenue-trends
Get revenue trends

### GET /analytics-new/at-risk-students
Get at-risk students list

---

## Error Responses

### 400 Bad Request
```json
{
  "status": "error",
  "message": "Validation error",
  "errors": ["Email is required"]
}
```

### 401 Unauthorized
```json
{
  "status": "error",
  "message": "Invalid token"
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
- Window: 15 minutes
- Max Requests: 100 per IP
- Applies to all /api/ routes

## Pagination
For list endpoints, use:
```
?page=1&limit=20
```

## Filtering
Most GET endpoints support filtering:
```
?status=Active&search=John&startDate=2024-01-01
```

## Sorting
```
?sortBy=createdAt&order=DESC
```

---

**For detailed implementation, refer to controller files in `/backend/src/controllers/`**
