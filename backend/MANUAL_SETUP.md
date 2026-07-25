# Manual Setup Guide (MySQL Not in PATH)

## Problem
`mysql` command not found - MySQL is installed but not added to system PATH.

---

## Solution 1: Use MySQL Workbench (Easiest) ✅

### Step 1: Open MySQL Workbench
- Start MySQL Workbench application
- Click on your local connection (usually "Local instance MySQL80")
- Enter password: `root`

### Step 2: Create Database
Copy and paste this query in the SQL editor:

```sql
DROP DATABASE IF EXISTS upsurgeerp;
CREATE DATABASE upsurgeerp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Click the lightning bolt icon ⚡ to execute.

### Step 3: Install Dependencies
Open Command Prompt in `d:\webapp\backend` folder:
```bash
npm install
```

### Step 4: Run Migrations
```bash
npm run migrate
```

### Step 5: Start Server
```bash
npm run dev
```

---

## Solution 2: Use Full MySQL Path

### Step 1: Find MySQL Installation

Common locations:
- `C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe`
- `C:\xampp\mysql\bin\mysql.exe`
- `C:\wamp64\bin\mysql\mysql8.0.x\bin\mysql.exe`
- `C:\laragon\bin\mysql\mysql-8.0.x\bin\mysql.exe`

### Step 2: Create Database with Full Path

```bash
cd d:\webapp\backend

"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -proot < setup_database.sql
```

Replace the path with your actual MySQL installation path.

### Step 3: Continue Setup
```bash
npm install
npm run migrate
npm run dev
```

---

## Solution 3: Add MySQL to PATH (Permanent Fix)

### Step 1: Find MySQL bin folder
Example: `C:\Program Files\MySQL\MySQL Server 8.0\bin`

### Step 2: Add to System PATH

**Windows 10/11:**
1. Press `Win + X` → Select "System"
2. Click "Advanced system settings"
3. Click "Environment Variables"
4. Under "System variables", find "Path"
5. Click "Edit"
6. Click "New"
7. Add: `C:\Program Files\MySQL\MySQL Server 8.0\bin`
8. Click "OK" on all windows

### Step 3: Restart Command Prompt
Close and reopen Command Prompt

### Step 4: Test MySQL
```bash
mysql --version
```

### Step 5: Run Setup
```bash
cd d:\webapp\backend
setup.bat
```

---

## Solution 4: Use XAMPP/WAMP Control Panel

### If using XAMPP:
1. Open XAMPP Control Panel
2. Start MySQL service
3. Click "Shell" button
4. Run:
```bash
cd /d/webapp/backend
mysql -u root -proot < setup_database.sql
```

### If using WAMP:
1. Open WAMP
2. Left-click WAMP icon → MySQL → MySQL Console
3. Enter password: `root`
4. Run:
```sql
DROP DATABASE IF EXISTS upsurgeerp;
CREATE DATABASE upsurgeerp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

Then continue with:
```bash
cd d:\webapp\backend
npm install
npm run migrate
npm run dev
```

---

## Verify MySQL is Running

### Check Service Status
```bash
# Windows
net start | findstr MySQL

# If not running, start it:
net start MySQL80
```

### Check with Task Manager
1. Press `Ctrl + Shift + Esc`
2. Go to "Services" tab
3. Look for "MySQL80" or "MySQL"
4. Status should be "Running"

---

## Quick Database Creation (Copy-Paste)

### Option A: One-line Command
```bash
echo DROP DATABASE IF EXISTS upsurgeerp; CREATE DATABASE upsurgeerp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci; | "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -proot
```

### Option B: Using phpMyAdmin (if installed)
1. Open http://localhost/phpmyadmin
2. Click "New" in left sidebar
3. Database name: `upsurgeerp`
4. Collation: `utf8mb4_unicode_ci`
5. Click "Create"

---

## After Database is Created

```bash
cd d:\webapp\backend

# Install dependencies
npm install

# Run migrations
npm run migrate

# Start server
npm run dev
```

---

## Expected Success Output

```
✅ Database connection established successfully
🚀 Server running on port 3000
📍 Environment: development
🔗 API: http://localhost:3000/api/v1
💚 Health: http://localhost:3000/health
```

---

## Still Having Issues?

### Check MySQL Installation
```bash
# Try these commands to find MySQL:
dir "C:\Program Files\MySQL" /s /b | findstr mysql.exe
dir "C:\xampp" /s /b | findstr mysql.exe
dir "C:\wamp64" /s /b | findstr mysql.exe
```

### Check if Port 3306 is in Use
```bash
netstat -ano | findstr :3306
```

### Reinstall MySQL
If nothing works, consider reinstalling MySQL:
- Download: https://dev.mysql.com/downloads/installer/
- During installation, select "Add to PATH" option

---

**Need Help?** Check the error message and refer to the appropriate solution above.
