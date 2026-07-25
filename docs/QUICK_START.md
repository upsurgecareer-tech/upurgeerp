# Quick Start Guide - UpsurgeERP

## 🚀 Get Started in 5 Minutes

### Prerequisites
- Node.js 18+
- MySQL 8.0+
- Git

---

## Step 1: Clone Repository

```bash
git clone <repository-url>
cd upsurgeerp
```

---

## Step 2: Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

### Configure .env
```env
NODE_ENV=development
PORT=3000

DB_HOST=localhost
DB_NAME=upsurgeerp
DB_USER=root
DB_PASSWORD=your_password

JWT_SECRET=your-secret-key-min-32-chars
JWT_EXPIRES_IN=7d

CORS_ORIGIN=http://localhost:3001
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100
```

---

## Step 3: Database Setup

```bash
# Create database
mysql -u root -p
CREATE DATABASE upsurgeerp;
EXIT;

# Run migrations
npm run migrate
```

---

## Step 4: Start Backend

```bash
npm run dev
```

Backend running at: http://localhost:3000

---

## Step 5: Test API

### Health Check
```bash
curl http://localhost:3000/health
```

### Login
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@upsurgeerp.com",
    "password": "admin123"
  }'
```

---

## Step 6: Frontend Setup (Optional)

```bash
cd ../frontend
npm install
npm run dev
```

Frontend running at: http://localhost:3001

---

## 🎯 What's Next?

### Explore APIs
- Check [API Documentation](./docs/API_DOCUMENTATION.md)
- Use Postman/Insomnia for testing
- Review [Database Schema](./docs/DATABASE_SCHEMA.md)

### Development
- Create new features
- Run tests: `npm test`
- Check code quality: `npm run lint`

### Deployment
- Follow [Deployment Guide](./docs/DEPLOYMENT_GUIDE.md)
- Configure production environment
- Set up monitoring

---

## 📚 Key Endpoints

### Authentication
```
POST /api/v1/auth/login
POST /api/v1/auth/register
GET  /api/v1/auth/me
```

### Students
```
GET    /api/v1/students
POST   /api/v1/students
GET    /api/v1/students/:id
PATCH  /api/v1/students/:id
```

### Leads
```
GET    /api/v1/leads
POST   /api/v1/leads
PATCH  /api/v1/leads/:id
```

### Reports
```
GET /api/v1/reports/dashboard
GET /api/v1/reports/students
GET /api/v1/reports/fee-collection
```

---

## 🔑 Default Credentials

**Email**: admin@upsurgeerp.com  
**Password**: admin123

⚠️ **Change password after first login!**

---

## 🛠️ Common Commands

### Backend
```bash
npm run dev          # Start development server
npm start            # Start production server
npm test             # Run tests
npm run migrate      # Run database migrations
```

### Database
```bash
# Backup
mysqldump -u root -p upsurgeerp > backup.sql

# Restore
mysql -u root -p upsurgeerp < backup.sql

# Reset
DROP DATABASE upsurgeerp;
CREATE DATABASE upsurgeerp;
npm run migrate
```

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Database Connection Error
- Check MySQL is running: `sudo systemctl status mysql`
- Verify credentials in .env
- Ensure database exists

### Migration Errors
```bash
# Reset migrations
DROP DATABASE upsurgeerp;
CREATE DATABASE upsurgeerp;
npm run migrate
```

---

## 📖 Documentation

- [README](../README.md) - Project overview
- [API Documentation](./API_DOCUMENTATION.md) - All endpoints
- [Database Schema](./DATABASE_SCHEMA.md) - Table structure
- [Security Audit](./SECURITY_AUDIT.md) - Security guidelines
- [Deployment Guide](./DEPLOYMENT_GUIDE.md) - Production setup

---

## 💡 Tips

1. **Use Postman Collection**: Import API endpoints for easy testing
2. **Enable Hot Reload**: Use nodemon for auto-restart
3. **Check Logs**: Monitor console for errors
4. **Use Git Branches**: Create feature branches for development
5. **Follow Conventions**: Maintain code style consistency

---

## 🤝 Need Help?

- Check documentation in `/docs` folder
- Review code comments
- Contact: support@upsurgeerp.com

---

**Happy Coding! 🚀**
