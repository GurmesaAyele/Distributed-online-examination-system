# Online Exam Platform - Complete Setup Guide

## Prerequisites
- Python 3.8+
- Node.js 16+
- MySQL 8.0+

## Backend Setup

### 1. Create MySQL Database
```sql
CREATE DATABASE exam_platform CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'exam_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON exam_platform.* TO 'exam_user'@'localhost';
FLUSH PRIVILEGES;
```

### 2. Configure Database
Edit `backend/exam_platform/settings.py` and update the database credentials:
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'exam_platform',
        'USER': 'exam_user',
        'PASSWORD': 'your_password',
        'HOST': 'localhost',
        'PORT': '3306',
    }
}
```

### 3. Install Backend Dependencies
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # On Windows
# source venv/bin/activate  # On Linux/Mac
pip install -r requirements.txt
```

### 4. Run Migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

### 5. Create Superuser
```bash
python manage.py createsuperuser
```

### 6. Create Media Directories
```bash
mkdir media
mkdir media\profiles
mkdir media\certificates
```

### 7. Start Backend Server
```bash
python manage.py runserver
```
Backend will run on: http://localhost:8000

## Frontend Setup

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
Frontend will run on: http://localhost:5173

## Initial Data Setup

### 1. Access Admin Panel
Navigate to: http://localhost:8000/admin
Login with superuser credentials

### 2. Create Sample Data
1. Create Departments (e.g., Computer Science, Mathematics)
2. Create Courses (e.g., B.Tech CS, M.Sc Math)
3. Create Subjects (e.g., Data Structures, Algorithms)
4. Create Users (Teachers and Students)

## Testing the Platform

### As Admin:
1. Login at http://localhost:5173/login
2. Create departments, courses, subjects
3. Manage users
4. Approve/reject exams
5. Send announcements

### As Teacher:
1. Login with teacher credentials
2. Create exams
3. Add questions to exams
4. Monitor students during exams
5. View real-time violations

### As Student:
1. Login with student credentials
2. Upload profile picture
3. View assigned exams
4. Take exams (3 questions per page)
5. Download certificates after evaluation

## Key Features

### Security Features:
- Tab switch detection (auto-submit after 3 violations)
- Copy/paste prevention
- Right-click disabled during exam
- Auto-save answers
- Timer with auto-submit

### Anti-Cheating:
- 1st violation: Warning + alert sound
- 2nd violation: Final warning
- 3rd violation: Auto-submit exam

### Certificate Generation:
- Includes student profile picture
- Shows marks, percentage, pass/fail status
- Downloadable as PDF

## API Endpoints

### Authentication:
- POST `/api/auth/register/` - Register new user
- POST `/api/auth/login/` - Login

### Users:
- GET `/api/users/` - List users
- GET `/api/users/me/` - Current user
- POST `/api/users/upload_profile_picture/` - Upload profile

### Exams:
- GET `/api/exams/` - List exams
- POST `/api/exams/` - Create exam
- POST `/api/exams/{id}/approve/` - Approve exam
- GET `/api/exams/{id}/students_status/` - Monitor students

### Exam Attempts:
- POST `/api/attempts/start_exam/` - Start exam
- POST `/api/attempts/{id}/save_answer/` - Save answer
- POST `/api/attempts/{id}/log_violation/` - Log violation
- POST `/api/attempts/{id}/submit_exam/` - Submit exam
- GET `/api/attempts/{id}/download_certificate/` - Download certificate

## Troubleshooting

### MySQL Connection Error:
- Verify MySQL is running
- Check database credentials in settings.py
- Ensure mysqlclient is installed: `pip install mysqlclient`

### CORS Issues:
- Backend CORS is configured for all origins in development
- For production, update CORS_ALLOWED_ORIGINS in settings.py

### Media Files Not Loading:
- Ensure media directories exist
- Check MEDIA_ROOT and MEDIA_URL in settings.py
- Verify file permissions

## Production Deployment

### Backend:
1. Set DEBUG = False in settings.py
2. Configure ALLOWED_HOSTS
3. Set up proper SECRET_KEY
4. Use production database
5. Collect static files: `python manage.py collectstatic`
6. Use gunicorn or uwsgi

### Frontend:
1. Build: `npm run build`
2. Deploy dist folder to web server
3. Update API base URL in axios.ts

## Default Test Credentials

After running migrations, create test users:
- Admin: admin / admin123
- Teacher: teacher1 / teacher123
- Student: student1 / student123

## Support

For issues or questions, check:
- Django logs in console
- Browser console for frontend errors
- Network tab for API call failures
