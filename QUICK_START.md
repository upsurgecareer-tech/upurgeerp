# UpsurgeERP - Quick Start Guide

## 🚀 5-Minute Setup

### 1. Prerequisites Check
```bash
node --version  # Should be 18+
mysql --version # Should be 8.0+
redis-cli ping  # Should return PONG (optional)
```

### 2. Clone & Install
```bash
cd backend
npm install
```

### 3. Environment Setup
```bash
cp .env.example .env
# Edit .env with your credentials
```

### 4. Database Setup
```bash
mysql -u root -p
CREATE DATABASE upsurgeerp;
exit;

npm run migrate
```

### 5. Start Server
```bash
npm run dev
```

Server running at: `http://localhost:3000`

---

## 🧪 Quick Test

### Health Check
```bash
curl http://localhost:3000/health
```

### Login
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@upsurgeerp.com","password":"admin123"}'
```

### API Documentation
Open: `http://localhost:3000/api-docs`

---

## 🐳 Docker Quick Start

```bash
# Start everything
npm run docker:up

# Check logs
npm run docker:logs

# Stop everything
npm run docker:down
```

---

## 🧪 Run Tests

```bash
# All tests
npm test

# Load test
npm run load-test:quick
```

---

## 📝 Common Commands

```bash
# Development
npm run dev              # Start with nodemon

# Testing
npm test                 # Run all tests
npm run test:watch       # Watch mode
npm run test:unit        # Unit tests only
npm run load-test        # Load testing

# Database
npm run migrate          # Run migrations

# Docker
npm run docker:build     # Build containers
npm run docker:up        # Start containers
npm run docker:down      # Stop containers
npm run docker:logs      # View logs

# Production
npm start                # Start server
```

---

## 🔑 Default Credentials

**Email:** admin@upsurgeerp.com  
**Password:** admin123

⚠️ Change after first login!

---

## 📚 Key Endpoints

### Authentication
- POST `/api/v1/auth/login` - Login
- POST `/api/v1/auth/register` - Register

### Students
- GET `/api/v1/students` - List students
- POST `/api/v1/students` - Create student
- GET `/api/v1/students/:id` - Get student

### Leads
- GET `/api/v1/leads` - List leads
- POST `/api/v1/leads` - Create lead

### Notices
- GET `/api/v1/notices/active` - Active notices
- POST `/api/v1/notices` - Create notice

### Reports
- GET `/api/v1/accounting/reports/balance-sheet`
- GET `/api/v1/accounting/reports/profit-loss`

---

## 🔧 Environment Variables

### Required
```env
DB_HOST=localhost
DB_NAME=upsurgeerp
DB_USER=root
DB_PASSWORD=your_password
JWT_SECRET=your-secret-key
PORT=3000
```

### Optional
```env
REDIS_URL=redis://localhost:6379
SMTP_HOST=smtp.gmail.com
TWILIO_ACCOUNT_SID=your-sid
```

---

## 🐛 Troubleshooting

### Port already in use
```bash
# Kill process on port 3000
npx kill-port 3000
```

### Database connection error
```bash
# Check MySQL is running
sudo systemctl status mysql

# Check credentials in .env
```

### Redis connection error
```bash
# Start Redis
sudo systemctl start redis

# Or disable Redis in code (optional)
```

### Migration errors
```bash
# Drop and recreate database
mysql -u root -p
DROP DATABASE upsurgeerp;
CREATE DATABASE upsurgeerp;
exit;

npm run migrate
```

---

## 📊 Project Structure

```
backend/
├── src/
│   ├── config/          # Database, Redis, Swagger
│   ├── controllers/     # Business logic (30+)
│   ├── models/          # Database models (40+)
│   ├── routes/          # API routes (30+)
│   ├── middlewares/     # Auth, validation
│   ├── validators/      # Joi schemas
│   ├── utils/           # Services (SMS, Email, PDF, etc)
│   ├── migrations/      # Database migrations (17)
│   └── __tests__/       # Test files
├── uploads/             # File storage
├── Dockerfile           # Docker config
├── docker-compose.yml   # Docker Compose
└── package.json         # Dependencies
```

---

## 🎯 Next Steps

1. ✅ Change default password
2. ✅ Configure SMTP for emails
3. ✅ Configure Twilio for SMS
4. ✅ Set up Redis for caching
5. ✅ Review security audit
6. ✅ Run tests
7. ✅ Deploy to production

---

## 📞 Support

- Email: support@upsurgeerp.com
- Docs: `/FINAL_COMPLETION.md`
- API: `http://localhost:3000/api-docs`

---

**Happy Coding! 🚀**
