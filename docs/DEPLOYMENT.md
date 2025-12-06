# Deployment Guide

This guide covers deploying the Online Exam Platform to production.

## Pre-Deployment Checklist

- [ ] Database backup strategy in place
- [ ] SSL certificate obtained
- [ ] Domain name configured
- [ ] Email service configured (for notifications)
- [ ] Cloud storage configured (for media files)
- [ ] Monitoring tools set up
- [ ] Error tracking configured

## Backend Deployment (Django)

### 1. Environment Configuration

Create `.env` file in backend directory:
```env
DEBUG=False
SECRET_KEY=your-super-secret-key-here
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
DATABASE_NAME=exam_platform
DATABASE_USER=db_user
DATABASE_PASSWORD=secure_password
DATABASE_HOST=db.yourdomain.com
DATABASE_PORT=3306
CORS_ALLOWED_ORIGINS=https://yourdomain.com
```

### 2. Update settings.py

```python
import os
from decouple import config

DEBUG = config('DEBUG', default=False, cast=bool)
SECRET_KEY = config('SECRET_KEY')
ALLOWED_HOSTS = config('ALLOWED_HOSTS').split(',')

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': config('DATABASE_NAME'),
        'USER': config('DATABASE_USER'),
        'PASSWORD': config('DATABASE_PASSWORD'),
        'HOST': config('DATABASE_HOST'),
        'PORT': config('DATABASE_PORT'),
    }
}

CORS_ALLOWED_ORIGINS = config('CORS_ALLOWED_ORIGINS').split(',')

# Security Settings
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'
```

### 3. Install Production Dependencies

```bash
pip install gunicorn
pip install python-decouple
```

### 4. Collect Static Files

```bash
python manage.py collectstatic --noinput
```

### 5. Run Migrations

```bash
python manage.py migrate
```

### 6. Create Gunicorn Configuration

Create `gunicorn_config.py`:
```python
bind = "0.0.0.0:8000"
workers = 4
worker_class = "sync"
worker_connections = 1000
timeout = 30
keepalive = 2
errorlog = "/var/log/gunicorn/error.log"
accesslog = "/var/log/gunicorn/access.log"
loglevel = "info"
```

### 7. Create Systemd Service

Create `/etc/systemd/system/exam-platform.service`:
```ini
[Unit]
Description=Exam Platform Gunicorn Service
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/exam-platform/backend
Environment="PATH=/var/www/exam-platform/backend/venv/bin"
ExecStart=/var/www/exam-platform/backend/venv/bin/gunicorn \
    --config gunicorn_config.py \
    exam_platform.wsgi:application

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable exam-platform
sudo systemctl start exam-platform
```

### 8. Configure Nginx

Create `/etc/nginx/sites-available/exam-platform`:
```nginx
upstream exam_backend {
    server 127.0.0.1:8000;
}

server {
    listen 80;
    server_name api.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    client_max_body_size 10M;

    location /static/ {
        alias /var/www/exam-platform/backend/staticfiles/;
    }

    location /media/ {
        alias /var/www/exam-platform/backend/media/;
    }

    location / {
        proxy_pass http://exam_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/exam-platform /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Frontend Deployment (React)

### 1. Update Environment Variables

Create `.env.production` in frontend directory:
```env
VITE_API_URL=https://api.yourdomain.com/api
```

### 2. Update axios.ts

```typescript
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
})
```

### 3. Build for Production

```bash
cd frontend
npm run build
```

### 4. Configure Nginx for Frontend

Create `/etc/nginx/sites-available/exam-platform-frontend`:
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

    root /var/www/exam-platform/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/exam-platform-frontend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Database Optimization

### 1. Create Indexes

```sql
CREATE INDEX idx_exam_status ON api_exam(status);
CREATE INDEX idx_attempt_student ON api_examattempt(student_id);
CREATE INDEX idx_attempt_exam ON api_examattempt(exam_id);
CREATE INDEX idx_answer_attempt ON api_answer(attempt_id);
CREATE INDEX idx_violation_attempt ON api_violationlog(attempt_id);
```

### 2. Configure MySQL for Production

Edit `/etc/mysql/my.cnf`:
```ini
[mysqld]
max_connections = 200
innodb_buffer_pool_size = 1G
innodb_log_file_size = 256M
query_cache_size = 64M
query_cache_type = 1
```

### 3. Set Up Automated Backups

Create backup script `/usr/local/bin/backup-exam-db.sh`:
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/exam-platform"
mkdir -p $BACKUP_DIR

mysqldump -u db_user -p'password' exam_platform | gzip > $BACKUP_DIR/exam_platform_$DATE.sql.gz

# Keep only last 7 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete
```

Add to crontab:
```bash
0 2 * * * /usr/local/bin/backup-exam-db.sh
```

## SSL Certificate (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com
```

Auto-renewal:
```bash
sudo certbot renew --dry-run
```

## Monitoring

### 1. Set Up Logging

Create log directories:
```bash
sudo mkdir -p /var/log/exam-platform
sudo chown www-data:www-data /var/log/exam-platform
```

### 2. Configure Django Logging

In `settings.py`:
```python
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'file': {
            'level': 'ERROR',
            'class': 'logging.FileHandler',
            'filename': '/var/log/exam-platform/django.log',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['file'],
            'level': 'ERROR',
            'propagate': True,
        },
    },
}
```

### 3. Monitor System Resources

Install monitoring tools:
```bash
sudo apt install htop iotop nethogs
```

### 4. Set Up Error Tracking (Optional)

Install Sentry:
```bash
pip install sentry-sdk
```

Configure in `settings.py`:
```python
import sentry_sdk
from sentry_sdk.integrations.django import DjangoIntegration

sentry_sdk.init(
    dsn="your-sentry-dsn",
    integrations=[DjangoIntegration()],
    traces_sample_rate=1.0,
)
```

## Performance Optimization

### 1. Enable Caching

Install Redis:
```bash
sudo apt install redis-server
pip install django-redis
```

Configure in `settings.py`:
```python
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': 'redis://127.0.0.1:6379/1',
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
        }
    }
}
```

### 2. Enable Gzip Compression

In Nginx config:
```nginx
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;
```

### 3. Configure CDN (Optional)

For static files and media, consider using:
- AWS CloudFront
- Cloudflare
- Azure CDN

## Security Hardening

### 1. Firewall Configuration

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 2. Fail2Ban

```bash
sudo apt install fail2ban
sudo systemctl enable fail2ban
```

### 3. Regular Updates

```bash
sudo apt update && sudo apt upgrade -y
```

### 4. Database Security

- Use strong passwords
- Limit database access to localhost
- Regular security audits
- Enable MySQL audit plugin

## Scaling Considerations

### Horizontal Scaling

1. **Load Balancer**: Use Nginx or HAProxy
2. **Multiple App Servers**: Run multiple Gunicorn instances
3. **Database Replication**: Master-slave setup
4. **Shared Storage**: Use NFS or S3 for media files

### Vertical Scaling

1. Increase server resources (CPU, RAM)
2. Optimize database queries
3. Use connection pooling
4. Enable query caching

## Maintenance

### Regular Tasks

- [ ] Weekly database backups verification
- [ ] Monthly security updates
- [ ] Quarterly performance review
- [ ] Log rotation and cleanup
- [ ] SSL certificate renewal (automated)

### Update Procedure

1. Backup database
2. Pull latest code
3. Activate virtual environment
4. Install dependencies: `pip install -r requirements.txt`
5. Run migrations: `python manage.py migrate`
6. Collect static files: `python manage.py collectstatic`
7. Restart services: `sudo systemctl restart exam-platform`
8. Test functionality
9. Monitor logs

## Rollback Procedure

1. Restore database from backup
2. Checkout previous code version
3. Restart services
4. Verify functionality

## Troubleshooting

### Service Not Starting

```bash
sudo systemctl status exam-platform
sudo journalctl -u exam-platform -n 50
```

### Database Connection Issues

```bash
mysql -u db_user -p -h localhost exam_platform
```

### High Memory Usage

```bash
htop
ps aux --sort=-%mem | head
```

### Slow Queries

Enable MySQL slow query log:
```sql
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 2;
```

## Support

For deployment issues:
1. Check application logs
2. Check Nginx error logs: `/var/log/nginx/error.log`
3. Check system logs: `sudo journalctl -xe`
4. Verify database connectivity
5. Check firewall rules

## Production Checklist

- [ ] DEBUG = False
- [ ] Strong SECRET_KEY
- [ ] ALLOWED_HOSTS configured
- [ ] Database credentials secured
- [ ] SSL certificate installed
- [ ] Static files collected
- [ ] Media directory permissions set
- [ ] Backup system configured
- [ ] Monitoring enabled
- [ ] Firewall configured
- [ ] Error tracking set up
- [ ] Performance testing completed
- [ ] Security audit performed
- [ ] Documentation updated
