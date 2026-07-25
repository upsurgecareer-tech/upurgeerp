# Quick Start - UpsurgeERP

## ✅ Pre-configured Setup (Username: root, Password: root)

### Automatic Setup (Recommended)

```bash
cd backend
setup.bat
```

This will:
1. Create database `upsurgeerp`
2. Install all dependencies
3. Run all migrations
4. Setup complete!

---

### Manual Setup

#### Step 1: Create Database
```bash
mysql -u root -proot < setup_database.sql
```

#### Step 2: Install Dependencies
```bash
npm install
```

#### Step 3: Run Migrations
```bash
npm run migrate
```

---

## Start Server

```bash
npm run dev
```

Expected Output:
```
✅ Database connection established successfully
🚀 Server running on port 3000
📍 Environment: development
🔗 API: http://localhost:3000/api/v1
💚 Health: http://localhost:3000/health
```

---

## Test API

### Health Check
```bash
curl http://localhost:3000/health
```

### Login (Default Admin)
```bash
curl -X POST http://localhost:3000/api/v1/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"admin@upsurgeerp.com\",\"password\":\"admin123\"}"
```

---

## Default Credentials

**Email:** admin@upsurgeerp.com  
**Password:** admin123

⚠️ Change password after first login!

---

## Database Info

- **Host:** localhost
- **Port:** 3306
- **Database:** upsurgeerp
- **Username:** root
- **Password:** root
- **Tables:** 40+

---

## Troubleshooting

### MySQL Not Running?
```bash
# Check MySQL service
net start | findstr MySQL

# Start MySQL
net start MySQL80
```

### Port 3000 Already in Use?
```bash
# Find process
netstat -ano | findstr :3000

# Kill process
taskkill /PID <process_id> /F
```

### Reset Database?
```bash
mysql -u root -proot < setup_database.sql
npm run migrate
```

---

**Ready to go! 🚀**
