# Production Deployment Guide - UpsurgeERP

## Prerequisites

- Hostinger VPS with Ubuntu 20.04+
- Node.js 18+
- MySQL 8.0+
- Redis 6+
- Nginx
- PM2
- Domain with SSL certificate

## 1. Server Setup

### Update System
```bash
sudo apt update && sudo apt upgrade -y
```

### Install Node.js
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

### Install MySQL
```bash
sudo apt install mysql-server -y
sudo mysql_secure_installation
```

### Install Redis
```bash
sudo apt install redis-server -y
sudo systemctl enable redis-server
```

### Install Nginx
```bash
sudo apt install nginx -y
sudo systemctl enable nginx
```

### Install PM2
```bash
sudo npm install -g pm2
```

## 2. Application Deployment

### Clone Repository
```bash
cd /var/www
sudo mkdir upsurgeerp
sudo chown $USER:$USER upsurgeerp
cd upsurgeerp
git clone <repository-url> .
```

### Backend Setup
```bash
cd backend
npm install --production
cp .env.example .env
nano .env  # Configure production variables
```

### Environment Variables
```env
NODE_ENV=production
PORT=3000

DB_HOST=localhost
DB_NAME=upsurgeerp_prod
DB_USER=upsurgeerp_user
DB_PASSWORD=<strong-password>

JWT_SECRET=<generate-strong-secret>
JWT_EXPIRES_IN=7d

REDIS_HOST=localhost
REDIS_PORT=6379

SMTP_HOST=smtp.hostinger.com
SMTP_PORT=587
SMTP_USER=<email>
SMTP_PASS=<password>
SMTP_FROM=noreply@yourdomain.com

CORS_ORIGIN=https://yourdomain.com
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100
```

### Database Setup
```bash
mysql -u root -p
CREATE DATABASE upsurgeerp_prod;
CREATE USER 'upsurgeerp_user'@'localhost' IDENTIFIED BY '<strong-password>';
GRANT ALL PRIVILEGES ON upsurgeerp_prod.* TO 'upsurgeerp_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# Run migrations
npm run migrate
```

### Start with PM2
```bash
pm2 start src/server.js --name upsurgeerp-api
pm2 save
pm2 startup
```

### Frontend Setup
```bash
cd ../frontend
npm install
npm run build
```

## 3. Nginx Configuration

### Create Nginx Config
```bash
sudo nano /etc/nginx/sites-available/upsurgeerp
```

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Frontend
    location / {
        root /var/www/upsurgeerp/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Uploads
    location /uploads/ {
        alias /var/www/upsurgeerp/uploads/;
        expires 30d;
    }
}
```

### Enable Site
```bash
sudo ln -s /etc/nginx/sites-available/upsurgeerp /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 4. SSL Certificate

### Install Certbot
```bash
sudo apt install certbot python3-certbot-nginx -y
```

### Generate Certificate
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### Auto-renewal
```bash
sudo certbot renew --dry-run
```

## 5. Firewall Setup

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

## 6. Monitoring & Logs

### PM2 Monitoring
```bash
pm2 monit
pm2 logs upsurgeerp-api
```

### Nginx Logs
```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## 7. Backup Strategy

### Database Backup
```bash
# Create backup script
nano /home/$USER/backup-db.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u upsurgeerp_user -p<password> upsurgeerp_prod > /backups/db_$DATE.sql
find /backups -name "db_*.sql" -mtime +7 -delete
```

```bash
chmod +x /home/$USER/backup-db.sh
crontab -e
# Add: 0 2 * * * /home/$USER/backup-db.sh
```

## 8. Maintenance

### Update Application
```bash
cd /var/www/upsurgeerp
git pull
cd backend && npm install --production
cd ../frontend && npm install && npm run build
pm2 restart upsurgeerp-api
```

### Database Migrations
```bash
cd /var/www/upsurgeerp/backend
npm run migrate
```

## 9. Health Checks

### API Health
```bash
curl https://yourdomain.com/health
```

### PM2 Status
```bash
pm2 status
```

### Database Connection
```bash
mysql -u upsurgeerp_user -p -e "SELECT 1"
```

---

**Deployment Checklist**:
- [ ] Server configured
- [ ] Database created and migrated
- [ ] Environment variables set
- [ ] PM2 running
- [ ] Nginx configured
- [ ] SSL certificate installed
- [ ] Firewall enabled
- [ ] Backups scheduled
- [ ] Monitoring setup
- [ ] DNS configured
