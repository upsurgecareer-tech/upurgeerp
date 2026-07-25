# UpsurgeERP - Phase 1: Foundation & Core Setup

**Duration:** Months 1-2  
**Status:** Foundation Phase

---

## Overview

Phase 1 establishes the foundational architecture, authentication system, role-based access control, and multi-branch organization structure for UpsurgeERP.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────┐  ┌──────────────┐                                 │
│  │   Web App    │  │   Admin      │                                 │
│  │  (React.js)  │  │   Portal     │                                 │
│  └──────┬───────┘  └──────┬───────┘                                 │
│         │                  │                                          │
└─────────┼──────────────────┼──────────────────────────────────────────┘
          │                  │
          └──────────────────┘
                             │
                    ┌────────▼────────┐
                    │   API Gateway   │
                    │   (NGINX/ALB)   │
                    └────────┬────────┘
                             │
          ┌──────────────────┴──────────────────┐
          │                                      │
┌─────────▼─────────┐              ┌────────────▼────────────┐
│  Authentication   │              │   Application Layer     │
│     Service       │◄─────────────┤   (Node.js/Express)     │
│   (JWT + OAuth)   │              │                         │
└─────────┬─────────┘              └────────────┬────────────┘
          │                                      │
          │                        ┌─────────────┴─────────────┐
          │                        │                           │
          │              ┌─────────▼─────────┐   ┌────────────▼──────────┐
          │              │  Business Logic   │   │   RBAC Middleware     │
          │              │     Layer         │   │   (Permissions)       │
          │              └─────────┬─────────┘   └────────────┬──────────┘
          │                        │                           │
          └────────────────────────┴───────────────────────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    │                             │
          ┌─────────▼─────────┐         ┌────────▼────────┐
          │   MySQL 8.0+      │         │     Redis       │
          │   (Primary DB)    │         │  (Cache/Session)│
          └───────────────────┘         └─────────────────┘
```

---

## System Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        USER LOGIN FLOW                               │
└─────────────────────────────────────────────────────────────────────┘

    User                Client              API Gateway         Auth Service        Database
     │                    │                      │                   │                 │
     │──Login Request────►│                      │                   │                 │
     │                    │──POST /auth/login───►│                   │                 │
     │                    │                      │──Validate────────►│                 │
     │                    │                      │                   │──Query User────►│
     │                    │                      │                   │◄───User Data────│
     │                    │                      │                   │                 │
     │                    │                      │                   │──Verify Pass────│
     │                    │                      │◄──JWT Token───────│                 │
     │                    │◄─────JWT Token───────│                   │                 │
     │◄───Success─────────│                      │                   │                 │
     │                    │                      │                   │                 │
     │──API Request───────►│──With JWT Token────►│──Verify Token────►│                 │
     │                    │                      │──Check RBAC──────►│                 │
     │                    │                      │◄──Authorized──────│                 │
     │                    │◄─────Response────────│                   │                 │
     │◄───Data────────────│                      │                   │                 │
```

---

## Multi-Branch Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                    ORGANIZATION HIERARCHY                            │
└─────────────────────────────────────────────────────────────────────┘

                        ┌─────────────────────┐
                        │   Organization      │
                        │   (Upsurge Infotech)│
                        │   ID: ORG_001       │
                        └──────────┬──────────┘
                                   │
                ┌──────────────────┼──────────────────┐
                │                  │                  │
        ┌───────▼────────┐ ┌──────▼───────┐ ┌───────▼────────┐
        │   Branch 1     │ │   Branch 2   │ │   Branch 3     │
        │   (Mumbai)     │ │   (Delhi)    │ │   (Bangalore)  │
        │   BR_001       │ │   BR_002     │ │   BR_003       │
        └───────┬────────┘ └──────┬───────┘ └───────┬────────┘
                │                  │                  │
        ┌───────┴────────┐ ┌──────┴───────┐ ┌───────┴────────┐
        │   Users        │ │   Users      │ │   Users        │
        │   - Admin      │ │   - Admin    │ │   - Admin      │
        │   - Counsellor │ │   - Faculty  │ │   - Cashier    │
        │   - Faculty    │ │   - Cashier  │ │   - Faculty    │
        └────────────────┘ └──────────────┘ └────────────────┘
```

---

## Database Schema

```
┌─────────────────────────────────────────────────────────────────────┐
│                        DATABASE SCHEMA                               │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────────┐         ┌──────────────────────┐
│   organizations      │         │      branches        │
├──────────────────────┤         ├──────────────────────┤
│ id (PK)              │◄────┐   │ id (PK)              │
│ name                 │     └───│ organization_id (FK) │
│ email                │         │ name                 │
│ phone                │         │ code                 │
│ address              │         │ address              │
│ logo_url             │         │ phone                │
│ status               │         │ email                │
│ created_at           │         │ status               │
│ updated_at           │         │ created_at           │
└──────────────────────┘         │ updated_at           │
                                 └──────────┬───────────┘
                                            │
                                            │
┌──────────────────────┐                   │
│       roles          │         ┌─────────▼────────────┐
├──────────────────────┤         │       users          │
│ id (PK)              │◄────┐   ├──────────────────────┤
│ name                 │     │   │ id (PK)              │
│ description          │     └───│ role_id (FK)         │
│ permissions (JSON)   │     ┌───│ branch_id (FK)       │
│ created_at           │     │   │ username             │
│ updated_at           │     │   │ email                │
└──────────────────────┘     │   │ password_hash        │
                             │   │ first_name           │
                             │   │ last_name            │
┌──────────────────────┐     │   │ phone                │
│    permissions       │     │   │ status               │
├──────────────────────┤     │   │ last_login           │
│ id (PK)              │     │   │ created_at           │
│ role_id (FK)         ├─────┘   │ updated_at           │
│ module               │         └──────────────────────┘
│ can_create           │
│ can_read             │
│ can_update           │
│ can_delete           │
│ created_at           │
└──────────────────────┘


┌──────────────────────┐         ┌──────────────────────┐
│   user_sessions      │         │    audit_logs        │
├──────────────────────┤         ├──────────────────────┤
│ id (PK)              │         │ id (PK)              │
│ user_id (FK)         │         │ user_id (FK)         │
│ token                │         │ action               │
│ ip_address           │         │ module               │
│ user_agent           │         │ description          │
│ expires_at           │         │ ip_address           │
│ created_at           │         │ created_at           │
└──────────────────────┘         └──────────────────────┘
```

---

## Role-Based Access Control (RBAC) Structure

```
┌─────────────────────────────────────────────────────────────────────┐
│                        RBAC HIERARCHY                                │
└─────────────────────────────────────────────────────────────────────┘

                    ┌─────────────────────┐
                    │  Super Admin        │
                    │  (Organization)     │
                    │  - Full Access      │
                    └──────────┬──────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
┌───────▼────────┐   ┌─────────▼────────┐   ┌────────▼───────┐
│ Branch Admin   │   │   Principal      │   │   Accountant   │
│ - Branch Mgmt  │   │   - Academic     │   │   - Finance    │
│ - Users        │   │   - Staff        │   │   - Reports    │
│ - Reports      │   │   - Students     │   │   - Fees       │
└───────┬────────┘   └─────────┬────────┘   └────────┬───────┘
        │                      │                      │
        └──────────────────────┼──────────────────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
┌───────▼────────┐   ┌─────────▼────────┐   ┌────────▼───────┐
│  Counsellor    │   │    Faculty       │   │    Cashier     │
│  - Leads       │   │    - Batches     │   │    - Fees      │
│  - Admissions  │   │    - Attendance  │   │    - Receipts  │
│  - Follow-ups  │   │    - Exams       │   │    - Reports   │
└────────────────┘   └──────────────────┘   └────────────────┘
```

---

## Module Breakdown

### 1. Authentication & Authorization System

#### Features:
- User Registration
- User Login (Email/Username + Password)
- JWT Token Generation
- Token Refresh Mechanism
- Password Reset (Email/SMS OTP)
- Two-Factor Authentication (Optional)
- Session Management
- Logout & Token Invalidation

#### API Endpoints:
```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/logout
POST   /api/v1/auth/refresh-token
POST   /api/v1/auth/forgot-password
POST   /api/v1/auth/reset-password
POST   /api/v1/auth/verify-otp
GET    /api/v1/auth/me
```

#### Tech Implementation:
- **JWT:** jsonwebtoken (Node.js)
- **Password Hashing:** bcrypt
- **Token Storage:** Redis (for session management)
- **Token Expiry:** Access Token (15 min), Refresh Token (7 days)
- **ORM:** Sequelize for MySQL
- **Validation:** express-validator

---

### 2. Role-Based Access Control (RBAC)

#### Roles:
1. **Super Admin** - Full system access
2. **Organization Admin** - Organization-level access
3. **Branch Admin** - Branch-level access
4. **Principal** - Academic management
5. **Counsellor** - Lead & admission management
6. **Faculty** - Teaching & attendance
7. **Cashier** - Fee collection
8. **Accountant** - Financial management
9. **Clerk** - Data entry & support

#### Permissions Matrix:

| Module | Super Admin | Branch Admin | Counsellor | Faculty | Cashier |
|--------|-------------|--------------|------------|---------|---------|
| Dashboard | Full | Branch | Personal | Personal | Personal |
| Leads | Full | Full | Assigned | Read | None |
| Admissions | Full | Full | Create/Edit | Read | Read |
| Fees | Full | Full | Read | Read | Full |
| Courses | Full | Full | Read | Read | Read |
| Batches | Full | Full | Read | Full | Read |
| Attendance | Full | Full | Read | Full | Read |
| Users | Full | Branch | None | None | None |
| Reports | Full | Branch | Personal | Personal | Personal |

#### API Endpoints:
```
GET    /api/v1/roles
POST   /api/v1/roles
GET    /api/v1/roles/:id
PUT    /api/v1/roles/:id
DELETE /api/v1/roles/:id
GET    /api/v1/permissions
POST   /api/v1/roles/:id/permissions
```

---

### 3. Multi-Branch/Organization Setup

#### Features:
- Organization Creation
- Branch Management (Add/Edit/Delete)
- Branch-wise Data Isolation
- Organization-level Dashboard
- Branch-level Dashboard
- Cross-branch User Assignment
- Centralized Configuration

#### API Endpoints:
```
POST   /api/v1/organizations
GET    /api/v1/organizations
GET    /api/v1/organizations/:id
PUT    /api/v1/organizations/:id
DELETE /api/v1/organizations/:id

POST   /api/v1/branches
GET    /api/v1/branches
GET    /api/v1/branches/:id
PUT    /api/v1/branches/:id
DELETE /api/v1/branches/:id
GET    /api/v1/organizations/:id/branches
```

---

### 4. Basic Dashboard Framework

#### Dashboard Components:
- KPI Cards (Leads, Admissions, Fees, Discounts)
- Charts (Lead Source, Lead Stage, Course-wise)
- Calendar Widget (Batch Schedule)
- To-Do List Widget
- Fee Due Reminders
- Quick Actions Panel

#### API Endpoints:
```
GET    /api/v1/dashboard/stats
GET    /api/v1/dashboard/leads-chart
GET    /api/v1/dashboard/admissions-chart
GET    /api/v1/dashboard/fees-chart
GET    /api/v1/dashboard/schedule
GET    /api/v1/dashboard/todos
GET    /api/v1/dashboard/reminders
```

---

## Technology Stack Details

### Backend Framework
```
Node.js + Express.js
├── express (Web framework)
├── jsonwebtoken (JWT)
├── bcrypt (Password hashing)
├── express-validator (Input validation)
├── helmet (Security headers)
├── cors (Cross-origin)
├── morgan (Logging)
├── dotenv (Environment variables)
├── mysql2 (MySQL driver)
└── sequelize (ORM for MySQL)
```

### Database
```
MySQL 8.0+
├── User Management Schema
├── Organization Schema
├── Branch Schema
├── Role & Permission Schema
└── Audit Log Schema

Redis 6+
├── Session Storage
├── Token Blacklist
├── Cache Layer
└── Rate Limiting
```

### API Documentation
```
Swagger/OpenAPI 3.0
├── Auto-generated docs
├── Interactive API testing
└── Schema validation
```

---

## Security Implementation

### Authentication Security
```
1. Password Policy
   - Minimum 8 characters
   - Must include uppercase, lowercase, number, special char
   - Password history (last 5 passwords)
   - Password expiry (90 days)

2. JWT Security
   - Short-lived access tokens (15 min)
   - Refresh token rotation
   - Token blacklisting on logout
   - Secure token storage

3. Rate Limiting
   - Login attempts: 5 per 15 minutes
   - API calls: 100 per minute per user
   - Password reset: 3 per hour

4. Session Management
   - Single session per user (optional)
   - Session timeout: 30 minutes inactivity
   - Concurrent session control
```

### Data Security
```
1. Encryption
   - Data at rest: AES-256
   - Data in transit: TLS 1.3
   - Password hashing: bcrypt (cost factor 12)

2. SQL Injection Prevention
   - Parameterized queries
   - ORM usage
   - Input validation

3. XSS Prevention
   - Input sanitization
   - Output encoding
   - Content Security Policy

4. CSRF Protection
   - CSRF tokens
   - SameSite cookies
```

---

## Development Timeline

### Week 1-2: Project Setup & Database Design
- [ ] Initialize project repository
- [ ] Setup development environment
- [ ] Design database schema
- [ ] Create database migrations
- [ ] Setup Redis
- [ ] Configure environment variables

### Week 3-4: Authentication System
- [ ] User registration API
- [ ] Login API with JWT
- [ ] Token refresh mechanism
- [ ] Password reset flow
- [ ] Session management
- [ ] Unit tests for auth

### Week 5-6: RBAC Implementation
- [ ] Role management APIs
- [ ] Permission management
- [ ] RBAC middleware
- [ ] Role assignment
- [ ] Permission checking
- [ ] Unit tests for RBAC

### Week 7: Multi-Branch Setup
- [ ] Organization CRUD APIs
- [ ] Branch CRUD APIs
- [ ] Data isolation logic
- [ ] Branch assignment
- [ ] Unit tests

### Week 8: Dashboard Framework
- [ ] Dashboard API endpoints
- [ ] KPI calculation logic
- [ ] Widget data APIs
- [ ] Caching implementation
- [ ] Integration tests
- [ ] Performance optimization

---

## Testing Strategy

### Unit Tests
```javascript
// Example: Authentication Test
describe('Authentication', () => {
  test('User login with valid credentials', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'test@example.com', password: 'Test@123' });
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
  });

  test('User login with invalid credentials', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'test@example.com', password: 'wrong' });
    
    expect(response.status).toBe(401);
  });
});
```

### Integration Tests
- API endpoint testing
- Database integration
- Redis integration
- End-to-end workflows

### Security Tests
- Penetration testing
- SQL injection tests
- XSS vulnerability tests
- Authentication bypass tests

---

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        DEPLOYMENT DIAGRAM                            │
└─────────────────────────────────────────────────────────────────────┘

                        ┌─────────────────┐
                        │   Cloudflare    │
                        │   (CDN + WAF)   │
                        └────────┬────────┘
                                 │
                        ┌────────▼────────┐
                        │  Nginx          │
                        │  (Reverse Proxy)│
                        └────────┬────────┘
                                 │
                ┌────────────────┼────────────────┐
                │                │                │
        ┌───────▼──────┐  ┌──────▼──────┐  ┌─────▼───────┐
        │  Node.js App │  │ Node.js App │  │ Node.js App │
        │  (PM2)       │  │  (PM2)      │  │  (PM2)      │
        └───────┬──────┘  └──────┬──────┘  └─────┬───────┘
                │                │                │
                └────────────────┼────────────────┘
                                 │
                ┌────────────────┴────────────────┐
                │                                  │
        ┌───────▼──────┐              ┌───────────▼────────┐
        │  MySQL 8.0+  │              │      Redis 6+      │
        │  (VPS)       │              │   (VPS)            │
        │  Master-Slave│              │                    │
        └──────────────┘              └────────────────────┘
```

---

## Environment Configuration

```env
# Application
NODE_ENV=development
PORT=3000
API_VERSION=v1

# Database (MySQL on VPS)
DB_HOST=localhost
DB_PORT=3306
DB_NAME=upsurgeerp
DB_USER=root
DB_PASSWORD=your_password
DB_DIALECT=mysql

# Redis (on VPS)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRES_IN=7d

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100

# CORS
CORS_ORIGIN=http://localhost:3001

# Logging
LOG_LEVEL=debug
```

---

## Deliverables

### Phase 1 Deliverables:
1. ✅ Authentication & Authorization System
2. ✅ Role-Based Access Control (RBAC)
3. ✅ Multi-Branch/Organization Management
4. ✅ Basic Dashboard Framework
5. ✅ API Documentation (Swagger)
6. ✅ Unit & Integration Tests
7. ✅ Deployment Scripts
8. ✅ Technical Documentation

---

## Success Metrics

- [ ] 100% API endpoint coverage
- [ ] 80%+ code test coverage
- [ ] API response time < 200ms
- [ ] Zero critical security vulnerabilities
- [ ] Successful multi-branch data isolation
- [ ] RBAC working for all defined roles
- [ ] JWT authentication working seamlessly

---

**Document Version:** 1.0  
**Last Updated:** 2026  
**Prepared By:** Development Team
