# UpsurgeERP - Educational Institution Management System

Complete ERP solution for educational institutions built with React + Node.js + Express + MySQL.

## 🚀 Features

### Phase 1 - Foundation (✅ COMPLETED)
- ✅ Authentication & Authorization (JWT)
- ✅ Role-Based Access Control (RBAC)
- ✅ Multi-Branch/Organization Management
- ✅ Dashboard Framework
- ✅ User Management
- ✅ Audit Logging

### Phase 2 - CRM & Lead Management (✅ COMPLETED)
- ✅ Lead Capture & Tracking
- ✅ Inquiry Management
- ✅ Follow-up System
- ✅ Lead Conversion
- ✅ Lead Source & Stage Management
- ✅ Lead Assignment
- ✅ CRM Analytics & Reports

### Phase 3 - Student Admissions & Fee Management (✅ COMPLETED)
- ✅ Online Application Forms
- ✅ Document Verification
- ✅ Fee Structure & Payment Gateway
- ✅ Receipt Generation
- ✅ Student Registration
- ✅ Course Package Management
- ✅ Discount Management
- ✅ Fee Schedule & Installments

### Phase 4 - Course, Batch & Attendance (✅ COMPLETED)
- ✅ Course & Batch Management
- ✅ Timetable Scheduling
- ✅ Attendance Tracking (QR/Manual)
- ✅ Leave Management
- ✅ QR Code Generation
- ✅ Attendance Analytics
- ✅ At-Risk Student Detection

### Phase 5 - Employee & Staff Management (✅ COMPLETED)
- ✅ HR Management
- ✅ Payroll Processing
- ✅ Performance Tracking
- ✅ Leave & Attendance
- ✅ Unlimited User Creation
- ✅ Role-Based Permissions
- ✅ Salary Structure Management
- ✅ Staff Attendance Tracking

### Phase 6 - Examination & Certificates (✅ COMPLETED)
- ✅ Exam Scheduling
- ✅ Result Management
- ✅ Certificate Generation
- ✅ Marksheet Printing
- ✅ Question Bank Management
- ✅ Online Exam System
- ✅ Auto Result Calculation
- ✅ Certificate Verification

### Phase 7 - e-Learning / LMS (✅ COMPLETED)
- ✅ Video Lectures
- ✅ Assignments & Quizzes
- ✅ Progress Tracking
- ✅ Discussion Forums
- ✅ Live Classroom Integration
- ✅ Study Materials Management
- ✅ Notice Board
- ✅ e-Books Management

### Phase 8 - Student & Parent Portal (✅ COMPLETED)
- ✅ Student Dashboard
- ✅ Parent Access
- ✅ Fee Payment
- ✅ Progress Reports
- ✅ Attendance Monitoring
- ✅ Exam Results View
- ✅ LMS Access
- ✅ Online Chat

### Phase 9 - Accounting & Inventory (✅ COMPLETED)
- ✅ Accounts Management
- ✅ Library Management
- ✅ Inventory Tracking
- ✅ Financial Reports
- ✅ Account Heads (Asset/Liability/Income/Expense/Equity)
- ✅ Transaction Management (Receipt/Payment/Journal/Contra)
- ✅ Expense Tracking & Approval
- ✅ Book Issue & Return System
- ✅ Stock Management with Low Stock Alerts
- ✅ Balance Sheet & Profit/Loss Reports

### Phase 10 - Communication & Notifications (✅ COMPLETED)
- ✅ Email & SMS
- ✅ WhatsApp Integration
- ✅ Push Notifications
- ✅ Announcement System
- ✅ Email Templates with Variables
- ✅ SMS Templates with Variables
- ✅ Communication Logs & Tracking
- ✅ Multi-Channel Broadcasting
- ✅ Push Token Management
- ✅ Target Audience Selection

### Phase 11 - Reports & Analytics (✅ COMPLETED)
- ✅ Custom Reports
- ✅ Data Visualization
- ✅ Export Functionality
- ✅ Business Intelligence
- ✅ Dashboard Analytics (Students/Leads/Revenue/Expenses)
- ✅ Student & Fee Collection Reports
- ✅ Attendance & Lead Conversion Reports
- ✅ Revenue & Expense Trends
- ✅ Library & Inventory Reports
- ✅ CSV Export for All Reports
- ✅ Student Growth Analytics
- ✅ Lead Source Performance
- ✅ Course Popularity Analysis
- ✅ Staff Performance Metrics
- ✅ Financial Summary & Profit Margins
- ✅ Batch Performance Tracking
- ✅ At-Risk Student Detection

### Phase 12 - Testing & Deployment (✅ COMPLETED)
- ✅ Unit & Integration Testing
- ✅ Security Audit
- ✅ Performance Optimization
- ✅ Production Deployment

## 🛠️ Tech Stack

### Backend
- Node.js + Express.js
- MySQL 8.0+ (Sequelize ORM)
- Redis (Cache & Sessions)
- JWT Authentication
- Socket.io (Real-time)

### Frontend
- React 18
- Material-UI (MUI)
- Vite
- Axios
- React Router v6
- Chart.js

### Hosting
- Hostinger VPS
- Nginx (Reverse Proxy)
- PM2 (Process Manager)
- Cloudflare (CDN)

## 📦 Installation

### Prerequisites
- Node.js 18+
- MySQL 8.0+
- Redis 6+

### Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your database credentials
# DB_HOST=localhost
# DB_NAME=upsurgeerp
# DB_USER=root
# DB_PASSWORD=your_password

# Create database
mysql -u root -p
CREATE DATABASE upsurgeerp;
exit;

# Run migrations
npm run migrate

# Start development server
npm run dev
```

Backend will run on: `http://localhost:3000`

### Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will run on: `http://localhost:3001`

## 🔑 Default Login Credentials

After running migrations, use these credentials:

- **Email:** admin@upsurgeerp.com
- **Password:** admin123

⚠️ **Important:** Change the default password after first login!

## 📁 Project Structure

```
upsurgeerp/
├── backend/                 # Node.js + Express API
│   ├── src/
│   │   ├── config/         # Database, Redis config
│   │   ├── controllers/    # Request handlers
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── middlewares/    # Auth, validation
│   │   ├── services/       # Business logic
│   │   ├── utils/          # Helper functions
│   │   ├── migrations/     # Database migrations
│   │   └── server.js       # Entry point
│   └── uploads/            # File storage
│
├── frontend/               # React + Material-UI
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── utils/          # Helper functions
│   │   └── App.jsx         # Main app
│   └── public/             # Static files
│
└── docs/                   # Documentation (12 phases)
```

## 🔒 Security Features

- JWT Authentication
- Password Hashing (bcrypt)
- Rate Limiting
- Helmet Security Headers
- CORS Protection
- Input Validation
- SQL Injection Prevention
- XSS Protection

## 📊 Database Schema

### Core Tables
- `organizations` - Organization details
- `branches` - Branch management
- `roles` - User roles
- `users` - User accounts
- `audit_logs` - Activity tracking

## 🧪 Testing

```bash
# Backend tests
cd backend

# Run all tests with coverage
npm test

# Run tests in watch mode
npm run test:watch

# Run unit tests only
npm run test:unit

# Run integration tests
npm run test:integration

# Run load tests
npm run load-test

# Run quick load test
npm run load-test:quick
```

## 🚀 Production Deployment

### Using Docker (Recommended)
```bash
cd backend

# Build and start all services
npm run docker:up

# View logs
npm run docker:logs

# Stop all services
npm run docker:down
```

### Manual Deployment

#### Backend
```bash
cd backend
npm start
```

#### Frontend
```bash
cd frontend
npm run build
# Deploy dist/ folder to web server
```

## 📝 API Documentation

Swagger API documentation available at: `http://localhost:3000/api-docs`

### Features:
- Interactive API testing
- Request/response examples
- Schema definitions
- Authentication testing

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

MIT License

## 👥 Team

**UpsurgeERP Development Team**

## 📞 Support

For support, email: support@upsurgeerp.com

## 📚 Documentation

- [API Documentation](./backend/API_DOCUMENTATION.md)
- [Swagger UI](http://localhost:3000/api-docs)
- [Security Audit](./backend/SECURITY_AUDIT.md)
- [Final Completion Report](./FINAL_COMPLETION.md)
- [Implementation Phase 1](./IMPLEMENTATION_PHASE1.md)
- [Implementation Phase 2](./IMPLEMENTATION_PHASE2.md)
- [Implementation Phase 3](./IMPLEMENTATION_PHASE3.md)

## 🎉 Project Status

**100% COMPLETED** - All 12 phases successfully implemented!

### Backend Statistics:
- 40+ Database Models
- 30+ Controllers
- 30+ Route Files
- 180+ API Endpoints
- 17 Database Migrations
- 50+ Performance Indexes
- 33+ Test Cases
- Complete Documentation
- Docker Ready
- Production Ready

### Key Features:
- ✅ QR Code Attendance System
- ✅ SMS/Email Integration (Twilio/SMTP)
- ✅ PDF Generation (Certificates, ID Cards)
- ✅ Financial Reports (Balance Sheet, P&L, Trial Balance)
- ✅ Automated Reminders (Cron Jobs)
- ✅ Notice Board System
- ✅ Redis Caching (Performance)
- ✅ Input Validation (Joi)
- ✅ API Documentation (Swagger)
- ✅ Unit & Integration Tests
- ✅ Load Testing (Artillery)
- ✅ Security Audit (OWASP)
- ✅ Docker Containerization

---

**Made with ❤️ for Educational Institutions**
