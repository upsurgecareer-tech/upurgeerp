# How to Run Migrations - Step by Step

## Problem
- Migrations 003-015 have wrong format
- Database already has some tables (duplicate error)

## Solution

### Step 1: Reset Database (MySQL Workbench)

1. Open MySQL Workbench
2. Connect to localhost (password: root)
3. Run this query:

```sql
DROP DATABASE IF EXISTS upsurgeerp;
CREATE DATABASE upsurgeerp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Step 2: Run Migrations

```bash
cd d:\webapp\backend
npm run migrate
```

This will create:
- ✅ organizations, branches, roles, users, audit_logs
- ✅ Default admin user (admin@upsurgeerp.com / admin123)
- ✅ account_heads, transactions, expenses

### Step 3: Start Server

```bash
npm run dev
```

## What Tables Will Be Created

After migration:
- organizations
- branches  
- roles
- users
- audit_logs
- account_heads
- transactions
- transaction_entries
- expenses

## Missing Tables (Need Manual Creation or Fixed Migrations)

These tables are NOT created yet:
- leads, lead_sources, lead_stages, follow_ups
- students, admissions, fee_payments
- batches, attendance
- staff, payroll
- exams, certificates
- lms tables
- library, inventory
- communication tables

## Quick Test After Migration

```bash
# Start server
npm run dev

# Test in browser
http://localhost:3000/health

# Test login (Postman/Thunder Client)
POST http://localhost:3000/api/v1/auth/login
{
  "email": "admin@upsurgeerp.com",
  "password": "admin123"
}
```

## Next Steps

Server will start successfully with basic tables. You can:
1. Test authentication
2. Create remaining tables manually if needed
3. Or we can fix the migration files later
