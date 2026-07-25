# Complete Reset and Setup

## Step 1: MySQL Workbench Mein Database Completely Reset Karo

```sql
-- Complete reset
DROP DATABASE IF EXISTS upsurgeerp;
CREATE DATABASE upsurgeerp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE upsurgeerp;

-- Verify it's empty
SHOW TABLES;
```

Result should be: **Empty set (0.00 sec)**

## Step 2: Migrations Run Karo

```bash
cd d:\webapp\backend
npm run migrate
```

## Step 3: Server Start Karo

```bash
npm run dev
```

---

## If Still Getting Error

### Option A: Manual Table Creation (MySQL Workbench)

Run this complete SQL:

```sql
USE upsurgeerp;

-- Organizations
CREATE TABLE organizations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100),
  phone VARCHAR(15),
  address TEXT,
  logo_url VARCHAR(255),
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Branches
CREATE TABLE branches (
  id INT PRIMARY KEY AUTO_INCREMENT,
  organization_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(20) NOT NULL UNIQUE,
  address TEXT,
  phone VARCHAR(15),
  email VARCHAR(100),
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Roles
CREATE TABLE roles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  permissions JSON,
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Users
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  organization_id INT NOT NULL,
  branch_id INT,
  role_id INT NOT NULL,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50),
  phone VARCHAR(15),
  status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
  last_login DATETIME,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  FOREIGN KEY (organization_id) REFERENCES organizations(id),
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL,
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Audit Logs
CREATE TABLE audit_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  action VARCHAR(100) NOT NULL,
  module VARCHAR(50) NOT NULL,
  description TEXT,
  ip_address VARCHAR(45),
  created_at DATETIME NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert default data
INSERT INTO organizations (name, email, phone, status, created_at, updated_at)
VALUES ('Upsurge Infotech', 'info@upsurgeinfotech.com', '9876543210', 'active', NOW(), NOW());

INSERT INTO branches (organization_id, name, code, status, created_at, updated_at)
VALUES (1, 'Main Branch', 'BR001', 'active', NOW(), NOW());

INSERT INTO roles (name, description, permissions, is_active, created_at, updated_at)
VALUES 
('Super Admin', 'Full system access', '{"all":true}', TRUE, NOW(), NOW()),
('Branch Admin', 'Branch level access', '{"branch":true}', TRUE, NOW(), NOW()),
('Faculty', 'Teaching access', '{"batches":true}', TRUE, NOW(), NOW()),
('Counsellor', 'CRM access', '{"leads":true}', TRUE, NOW(), NOW()),
('Cashier', 'Fee access', '{"fees":true}', TRUE, NOW(), NOW());

INSERT INTO users (organization_id, branch_id, role_id, username, email, password_hash, first_name, last_name, status, created_at, updated_at)
VALUES (1, 1, 1, 'admin', 'admin@upsurgeerp.com', '$2a$12$k9dLDfDa2G2w1VTJaSksouQey1SwPZ1sWtOgQn.KgxmsZXgvQMG.S', 'Super', 'Admin', 'active', NOW(), NOW());

-- Verify
SELECT * FROM organizations;
SELECT * FROM branches;
SELECT * FROM roles;
SELECT * FROM users;
```

### Option B: Skip Migrations, Start Server Directly

```bash
npm run dev
```

Server will try to connect. If tables exist, it will work.

---

## Test After Setup

```bash
# Start server
npm run dev

# Test
curl http://localhost:3000/health

# Login
curl -X POST http://localhost:3000/api/v1/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"admin@upsurgeerp.com\",\"password\":\"admin123\"}"
```

---

**Choose Option A (Manual SQL) - It's faster and guaranteed to work!**
