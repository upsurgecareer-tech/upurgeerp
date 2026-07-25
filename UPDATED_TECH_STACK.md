# UpsurgeERP - Updated Tech Stack (Hostinger VPS Only)

**Last Updated:** 2024
**Status:** AWS Removed - Hostinger VPS Only

---

## Complete Technology Stack

### Backend
```
Node.js + Express.js
├── express              → Web framework
├── jsonwebtoken         → JWT authentication
├── bcrypt               → Password hashing
├── express-validator    → Input validation
├── helmet               → Security headers
├── cors                 → Cross-origin
├── morgan               → Logging
├── dotenv               → Environment variables
├── mysql2               → MySQL driver
├── sequelize            → ORM for MySQL
├── multer               → File upload handling
├── pdfkit / jspdf       → PDF generation
├── qrcode               → QR code generation
├── socket.io            → Real-time communication
├── bull                 → Job queue
├── node-cron            → Scheduled tasks
├── nodemailer           → Email sending
├── axios                → HTTP client
└── canvas / fabric.js   → Image/ID card generation
```

### Database
```
MySQL 8.0+ (Hostinger VPS)
├── Master-Slave Replication
├── Connection Pooling
├── Automated Backups
└── Query Optimization

Redis 6+ (Hostinger VPS)
├── Session Storage
├── Cache Layer
├── Job Queue
└── Rate Limiting
```

### File Storage
```
Hostinger VPS Local Storage
├── Base Path: /var/www/upsurgeerp/uploads/
├── student-documents/
├── student-photos/
├── receipts/
├── lms-videos/
├── lms-materials/
├── lms-ebooks/
├── lms-assignments/
├── lms-submissions/
├── live-recordings/
├── certificates/
├── id-cards/
└── payslips/
```

### CDN & Delivery
```
Cloudflare
├── CDN for static assets
├── Video streaming
├── DDoS protection
├── SSL/TLS
└── WAF (Web Application Firewall)
```

### Frontend
```
React.js
├── Redux / Context API    → State management
├── Material-UI / Ant Design → UI components
├── Chart.js / D3.js       → Data visualization
├── FullCalendar.js        → Calendar/Timetable
├── Socket.io Client       → Real-time updates
├── Axios                  → API calls
├── React Router           → Routing
└── TinyMCE / CKEditor     → Rich text editor
```

### External Integrations

#### Payment Gateway
```
Razorpay / Stripe / PayU
├── Online payment processing
├── Webhook handling
├── Payment status tracking
└── Refund management
```

#### SMS Gateway
```
Twilio / MSG91
├── Bulk SMS sending
├── OTP delivery
├── Delivery status tracking
└── Unicode support
```

#### Email Service
```
SendGrid / SMTP (Gmail/Hostinger)
├── Bulk email campaigns
├── Transactional emails
├── Email templates
├── Open/Click tracking
└── Bounce handling
```

#### Live Classroom
```
Zoom / Jitsi / Agora.io
├── Live class hosting
├── Meeting link generation
├── Recording storage (VPS)
└── Participant tracking
```

#### Biometric Integration
```
ZKTeco / ESSL SDK
├── Fingerprint attendance
├── Device communication
└── Real-time sync
```

### Deployment & Infrastructure

#### Hosting
```
Hostinger VPS
├── Operating System: Ubuntu 20.04 LTS
├── Web Server: Nginx (Reverse Proxy)
├── Application Server: Node.js + PM2
├── Database: MySQL 8.0+ (Master-Slave)
├── Cache: Redis 6+
├── SSL: Let's Encrypt (Free)
└── Firewall: UFW
```

#### Process Management
```
PM2
├── Application clustering
├── Auto-restart on crash
├── Log management
├── Zero-downtime deployment
└── Monitoring dashboard
```

#### CI/CD
```
GitHub Actions / Jenkins
├── Automated testing
├── Code quality checks
├── Build automation
├── Deployment automation
└── Rollback mechanism
```

#### Monitoring & Logging
```
Application Monitoring:
├── New Relic / Datadog (optional)
├── Sentry (Error tracking)
└── Custom logging (Winston)

Server Monitoring:
├── PM2 Monitoring
├── MySQL Performance Schema
├── Redis INFO
└── Nginx access/error logs

Uptime Monitoring:
├── UptimeRobot
└── Pingdom
```

### Security Stack

#### Application Security
```
├── JWT Authentication
├── bcrypt Password Hashing
├── Helmet.js (Security headers)
├── express-rate-limit (Rate limiting)
├── express-validator (Input validation)
├── CORS configuration
├── CSRF protection
└── XSS prevention
```

#### Infrastructure Security
```
├── UFW Firewall
├── SSH Key Authentication
├── Fail2Ban (Brute force protection)
├── SSL/TLS (Let's Encrypt)
├── Regular security updates
└── Database access restrictions
```

### Development Tools

#### Code Quality
```
├── ESLint (JavaScript linting)
├── Prettier (Code formatting)
├── SonarQube (Code analysis)
└── Husky (Git hooks)
```

#### Testing
```
├── Jest (Unit testing)
├── Supertest (API testing)
├── Cypress / Selenium (E2E testing)
├── JMeter / Artillery (Load testing)
└── OWASP ZAP (Security testing)
```

#### Documentation
```
├── Swagger / OpenAPI (API docs)
├── JSDoc (Code documentation)
├── Markdown (README files)
└── Draw.io (Diagrams)
```

---

## Environment Variables Template

```env
# Application
NODE_ENV=production
PORT=3000
API_VERSION=v1
BASE_URL=https://yourdomain.com

# Database (MySQL on Hostinger VPS)
DB_HOST=localhost
DB_PORT=3306
DB_NAME=upsurgeerp
DB_USER=root
DB_PASSWORD=your_secure_password
DB_DIALECT=mysql
DB_POOL_MIN=5
DB_POOL_MAX=100

# Redis (on Hostinger VPS)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password

# JWT
JWT_SECRET=your_jwt_secret_key_min_32_chars
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your_refresh_secret_key
JWT_REFRESH_EXPIRES_IN=7d

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100

# CORS
CORS_ORIGIN=https://yourdomain.com

# File Storage (Hostinger VPS Local)
UPLOAD_PATH=/var/www/upsurgeerp/uploads
MAX_FILE_SIZE=10485760

# Cloudflare CDN
CLOUDFLARE_ZONE_ID=your_zone_id
CLOUDFLARE_API_TOKEN=your_token

# Payment Gateway (Razorpay)
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# SMS Gateway (Twilio / MSG91)
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_FROM_NUMBER=+1234567890
# OR
MSG91_AUTH_KEY=your_key
MSG91_SENDER_ID=UPSRGE

# Email (SMTP)
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=587
SMTP_USER=noreply@yourdomain.com
SMTP_PASS=your_email_password
SMTP_FROM=noreply@yourdomain.com
# OR SendGrid
SENDGRID_API_KEY=your_sendgrid_key

# Zoom API
ZOOM_API_KEY=your_api_key
ZOOM_API_SECRET=your_api_secret
ZOOM_WEBHOOK_SECRET=your_webhook_secret

# Biometric Device
BIOMETRIC_DEVICE_IP=192.168.1.100
BIOMETRIC_DEVICE_PORT=4370
BIOMETRIC_SDK=zkteco

# Logging
LOG_LEVEL=info
LOG_FILE_PATH=/var/www/upsurgeerp/logs
```

---

## Server Requirements

### Minimum Requirements (Small Institute - Up to 500 students)
```
CPU: 2 vCPU
RAM: 4 GB
Storage: 50 GB SSD
Bandwidth: 1 TB/month
```

### Recommended Requirements (Medium Institute - 500-2000 students)
```
CPU: 4 vCPU
RAM: 8 GB
Storage: 100 GB SSD
Bandwidth: 2 TB/month
```

### High Performance (Large Institute - 2000+ students)
```
CPU: 8 vCPU
RAM: 16 GB
Storage: 200 GB SSD
Bandwidth: 5 TB/month
```

---

## Installation Commands (Hostinger VPS)

### 1. Initial Server Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install MySQL 8.0
sudo apt install -y mysql-server
sudo mysql_secure_installation

# Install Redis
sudo apt install -y redis-server
sudo systemctl enable redis-server

# Install Nginx
sudo apt install -y nginx
sudo systemctl enable nginx

# Install PM2
sudo npm install -g pm2
pm2 startup
```

### 2. Application Deployment
```bash
# Clone repository
cd /var/www
git clone https://github.com/yourusername/upsurgeerp.git
cd upsurgeerp

# Install dependencies
npm install --production

# Create uploads directory
mkdir -p uploads/{student-documents,student-photos,receipts,lms-videos,lms-materials,lms-ebooks,lms-assignments,lms-submissions,live-recordings,certificates,id-cards,payslips}

# Set permissions
sudo chown -R www-data:www-data uploads
sudo chmod -R 755 uploads

# Setup environment
cp .env.example .env
nano .env  # Edit with your values

# Run database migrations
npm run migrate

# Start application with PM2
pm2 start ecosystem.config.js
pm2 save
```

### 3. Nginx Configuration
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Proxy to Node.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static files
    location /uploads {
        alias /var/www/upsurgeerp/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # File upload size
    client_max_body_size 100M;
}
```

### 4. SSL Certificate (Let's Encrypt)
```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo certbot renew --dry-run
```

---

## Backup Strategy

### Database Backup (Daily)
```bash
# Create backup script
nano /var/www/upsurgeerp/scripts/backup-db.sh

#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/www/upsurgeerp/backups/database"
mkdir -p $BACKUP_DIR
mysqldump -u root -p'your_password' upsurgeerp | gzip > $BACKUP_DIR/upsurgeerp_$DATE.sql.gz
find $BACKUP_DIR -type f -mtime +7 -delete

# Make executable
chmod +x /var/www/upsurgeerp/scripts/backup-db.sh

# Add to crontab (daily at 2 AM)
crontab -e
0 2 * * * /var/www/upsurgeerp/scripts/backup-db.sh
```

### File Backup (Weekly)
```bash
# Create backup script
nano /var/www/upsurgeerp/scripts/backup-files.sh

#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/www/upsurgeerp/backups/files"
mkdir -p $BACKUP_DIR
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz /var/www/upsurgeerp/uploads
find $BACKUP_DIR -type f -mtime +30 -delete

# Make executable
chmod +x /var/www/upsurgeerp/scripts/backup-files.sh

# Add to crontab (weekly on Sunday at 3 AM)
crontab -e
0 3 * * 0 /var/www/upsurgeerp/scripts/backup-files.sh
```

---

## Performance Optimization Tips

1. **Enable Gzip Compression** (Nginx)
2. **Use Redis for Session Storage**
3. **Implement Database Connection Pooling**
4. **Enable Cloudflare CDN for Static Assets**
5. **Use PM2 Cluster Mode** (multiple instances)
6. **Optimize MySQL Queries** (add indexes)
7. **Enable Browser Caching**
8. **Compress Images Before Upload**
9. **Use Lazy Loading for Large Lists**
10. **Implement API Response Caching**

---

**✅ All AWS Services Removed - 100% Hostinger VPS Based Solution**
