# Database Setup Guide

## Step 1: Install MySQL

### Windows
Download and install MySQL 8.0+ from: https://dev.mysql.com/downloads/installer/

### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install mysql-server
sudo mysql_secure_installation
```

### macOS
```bash
brew install mysql
brew services start mysql
```

---

## Step 2: Create Database

### Option A: Using MySQL Command Line
```bash
mysql -u root -p
```

```sql
CREATE DATABASE upsurgeerp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE USER 'upsurgeerp_user'@'localhost' IDENTIFIED BY 'your_strong_password';

GRANT ALL PRIVILEGES ON upsurgeerp.* TO 'upsurgeerp_user'@'localhost';

FLUSH PRIVILEGES;

EXIT;
```

### Option B: Using MySQL Workbench
1. Open MySQL Workbench
2. Connect to your MySQL server
3. Click "Create Schema" icon
4. Name: `upsurgeerp`
5. Charset: `utf8mb4`
6. Collation: `utf8mb4_unicode_ci`
7. Click Apply

---

## Step 3: Configure Environment Variables

```bash
cd backend
cp .env.example .env
```

Edit `.env` file:
```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=upsurgeerp
DB_USER=root
DB_PASSWORD=your_mysql_password

JWT_SECRET=generate-a-random-32-character-secret-key-here
```

### Generate JWT Secret
```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Or use online generator
# https://www.grc.com/passwords.htm
```

---

## Step 4: Install Dependencies

```bash
npm install
```

---

## Step 5: Run Migrations

```bash
npm run migrate
```

Expected output:
```
🔄 Starting database migrations...
✅ Database connected
📝 Running migration: 001_create_base_tables.js
✅ Completed: 001_create_base_tables.js
...
🎉 All migrations completed successfully!
```

---

## Step 6: Verify Database

```bash
mysql -u root -p upsurgeerp
```

```sql
SHOW TABLES;
```

You should see 40+ tables:
- organizations
- branches
- roles
- users
- students
- leads
- batches
- etc.

---

## Step 7: Start Server

```bash
npm run dev
```

Expected output:
```
✅ Database connection established successfully
🚀 Server running on port 3000
📍 Environment: development
🔗 API: http://localhost:3000/api/v1
💚 Health: http://localhost:3000/health
```

---

## Step 8: Test Connection

### Health Check
```bash
curl http://localhost:3000/health
```

Response:
```json
{
  "status": "success",
  "message": "UpsurgeERP API is running",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Login Test
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@upsurgeerp.com",
    "password": "admin123"
  }'
```

---

## Troubleshooting

### Error: Access denied for user
**Solution**: Check DB_USER and DB_PASSWORD in .env file

### Error: Unknown database 'upsurgeerp'
**Solution**: Create database using Step 2

### Error: connect ECONNREFUSED
**Solution**: 
- Check if MySQL is running: `sudo systemctl status mysql`
- Start MySQL: `sudo systemctl start mysql`

### Error: ER_NOT_SUPPORTED_AUTH_MODE
**Solution**: Update MySQL user authentication
```sql
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'your_password';
FLUSH PRIVILEGES;
```

### Error: Too many connections
**Solution**: Increase MySQL max_connections
```sql
SET GLOBAL max_connections = 200;
```

---

## Database Backup

### Create Backup
```bash
mysqldump -u root -p upsurgeerp > backup_$(date +%Y%m%d).sql
```

### Restore Backup
```bash
mysql -u root -p upsurgeerp < backup_20240115.sql
```

---

## Reset Database

```bash
mysql -u root -p
```

```sql
DROP DATABASE upsurgeerp;
CREATE DATABASE upsurgeerp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

```bash
npm run migrate
```

---

## Production Database Setup

### 1. Create Production Database
```sql
CREATE DATABASE upsurgeerp_prod CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Create Production User
```sql
CREATE USER 'upsurgeerp_prod'@'localhost' IDENTIFIED BY 'strong_production_password';
GRANT ALL PRIVILEGES ON upsurgeerp_prod.* TO 'upsurgeerp_prod'@'localhost';
FLUSH PRIVILEGES;
```

### 3. Update Production .env
```env
NODE_ENV=production
DB_NAME=upsurgeerp_prod
DB_USER=upsurgeerp_prod
DB_PASSWORD=strong_production_password
```

### 4. Enable SSL (Recommended)
```env
DB_SSL=true
DB_SSL_CA=/path/to/ca-cert.pem
```

---

## Database Monitoring

### Check Connection Status
```sql
SHOW PROCESSLIST;
```

### Check Database Size
```sql
SELECT 
  table_schema AS 'Database',
  ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'Size (MB)'
FROM information_schema.tables
WHERE table_schema = 'upsurgeerp'
GROUP BY table_schema;
```

### Check Table Sizes
```sql
SELECT 
  table_name AS 'Table',
  ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'Size (MB)'
FROM information_schema.tables
WHERE table_schema = 'upsurgeerp'
ORDER BY (data_length + index_length) DESC;
```

---

**Database setup complete! 🎉**
