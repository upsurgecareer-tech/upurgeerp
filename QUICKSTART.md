# 🚀 Quick Start Guide - UpsurgeERP

## Step-by-Step Setup (5 Minutes)

### 1️⃣ Prerequisites Check
```bash
node --version    # Should be 18+
mysql --version   # Should be 8.0+
```

### 2️⃣ Database Setup
```bash
# Login to MySQL
mysql -u root -p

# Create database
CREATE DATABASE upsurgeerp;
exit;
```

### 3️⃣ Backend Setup
```bash
# Navigate to backend
cd d:\webapp\backend

# Install dependencies (first time only)
npm install

# Create .env file
copy .env.example .env

# Edit .env file with your MySQL password
# Open .env in notepad and change:
# DB_PASSWORD=your_mysql_password

# Run database migrations
npm run migrate

# Start backend server
npm run dev
```

✅ Backend running at: http://localhost:3000

### 4️⃣ Frontend Setup (New Terminal)
```bash
# Navigate to frontend
cd d:\webapp\frontend

# Install dependencies (first time only)
npm install

# Start frontend server
npm run dev
```

✅ Frontend running at: http://localhost:3001

### 5️⃣ Login to System

Open browser: http://localhost:3001

**Default Credentials:**
- Email: `admin@upsurgeerp.com`
- Password: `admin123`

---

## 🎯 What You Get

✅ **Login System** - JWT authentication
✅ **Dashboard** - Admin dashboard with stats
✅ **User Management** - Role-based access
✅ **Multi-Branch** - Organization & branch support
✅ **Secure API** - Protected endpoints

---

## 🔧 Troubleshooting

### Backend won't start?
```bash
# Check if MySQL is running
# Check .env file has correct DB credentials
# Check port 3000 is not in use
```

### Frontend won't start?
```bash
# Check if backend is running first
# Check port 3001 is not in use
# Clear npm cache: npm cache clean --force
```

### Can't login?
```bash
# Make sure you ran: npm run migrate
# Check backend console for errors
# Use correct credentials: admin@upsurgeerp.com / admin123
```

---

## 📚 Next Steps

1. Change default admin password
2. Create new users with different roles
3. Add branches
4. Explore the dashboard

---

## 🆘 Need Help?

Check the main README.md for detailed documentation.

**Happy Coding! 🎉**
