# 🎓 Online Exam Platform

A fully-featured, secure online examination system with role-based dashboards, real-time monitoring, and advanced anti-cheating mechanisms.

![Platform](https://img.shields.io/badge/Platform-Web-blue)
![Backend](https://img.shields.io/badge/Backend-Django-green)
![Frontend](https://img.shields.io/badge/Frontend-React-blue)
![Database](https://img.shields.io/badge/Database-MySQL-orange)

## ✨ Key Features

### 🔐 Advanced Security
- **Tab Switch Detection**: Automatically detects and logs when students switch tabs
- **Copy/Paste Prevention**: Blocks copy-paste operations during exams
- **Progressive Warnings**: 3-strike system with auto-submit on violations
- **IP Tracking**: Monitors and logs IP addresses
- **Browser Lockdown**: Disables right-click and context menu

### 👥 Role-Based Dashboards
- **Admin**: User management, exam approvals, system configuration
- **Teacher**: Exam creation, question management, real-time monitoring
- **Student**: Exam taking, results viewing, certificate download

### 📝 Exam Management
- Multiple question types (MCQ, Subjective, True/False)
- Timer with auto-submit
- 3 questions per page navigation
- Auto-save answers
- Negative marking support
- Question shuffling

### 📊 Real-Time Monitoring
- Live student status (online/offline)
- Progress tracking
- Violation monitoring
- Instant updates

### 🎖️ Certificates & Results
- Auto-generated PDF certificates
- Student profile picture inclusion
- Detailed performance metrics
- Downloadable format

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development
- **Material-UI** for modern UI components
- **Zustand** for state management
- **Axios** for API calls
- **jsPDF** for certificate generation

### Backend
- **Django 5.0** with REST Framework
- **JWT** authentication
- **MySQL** database
- **ReportLab** for PDF generation
- **Pillow** for image processing

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- MySQL 8.0+

### Option 1: Automated Setup (Windows)
```bash
quick_start.bat
```

### Option 2: Manual Setup

#### 1. Database Setup
```sql
CREATE DATABASE exam_platform;
```

#### 2. Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
python manage.py shell < create_sample_data.py
python manage.py runserver
```

#### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Access the Platform
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **Admin Panel**: http://localhost:8000/admin

### Default Credentials
```
Admin:    admin / admin123
Teacher:  teacher1 / teacher123
Student:  student1 / student123
```

## 📖 Documentation

- [Complete Setup Guide](SETUP_GUIDE.md)
- [Features List](FEATURES.md)
- [API Documentation](API_DOCS.md)

## 🎯 Core Functionality

### For Students
1. Login and upload profile picture
2. View assigned exams
3. Take exams with timer
4. Auto-save answers
5. Submit exam
6. View results and download certificates

### For Teachers
1. Create exams with questions
2. Set exam parameters (duration, marks, etc.)
3. Monitor students in real-time
4. View violations and progress
5. Grade subjective answers
6. Generate reports

### For Admins
1. Manage users (create, edit, delete)
2. Approve/reject exams
3. Manage departments, courses, subjects
4. Send announcements
5. View system statistics
6. Monitor security logs

## 🔒 Anti-Cheating System

### Violation Detection
- **1st Violation**: Warning notification + alert sound
- **2nd Violation**: Final warning message
- **3rd Violation**: Automatic exam submission

### Tracked Activities
- Tab switching
- Copy/paste attempts
- Multiple IP addresses
- Suspicious behavior patterns

## 📊 Features Breakdown

### Exam Interface
- ✅ Timer countdown with auto-submit
- ✅ 3 questions per screen
- ✅ Next/Previous navigation
- ✅ Progress tracking
- ✅ Auto-save functionality
- ✅ Violation warnings

### Question Types
- ✅ Multiple Choice Questions (MCQ)
- ✅ Subjective/Descriptive
- ✅ True/False

### Grading System
- ✅ Auto-grading for MCQ/True-False
- ✅ Manual grading for subjective
- ✅ Negative marking support
- ✅ Percentage calculation
- ✅ Pass/Fail determination

### Certificate Generation
- ✅ Student profile picture
- ✅ Exam details
- ✅ Marks and percentage
- ✅ Professional PDF format
- ✅ Downloadable

## 🏗️ Project Structure

```
exam-platform/
├── backend/
│   ├── api/
│   │   ├── models.py          # Database models
│   │   ├── views.py           # API endpoints
│   │   ├── serializers.py     # Data serialization
│   │   ├── permissions.py     # Access control
│   │   └── utils.py           # PDF generation
│   ├── exam_platform/
│   │   ├── settings.py        # Django settings
│   │   └── urls.py            # URL routing
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.tsx
│   │   │   ├── StudentDashboard.tsx
│   │   │   ├── TeacherDashboard.tsx
│   │   │   ├── AdminDashboard.tsx
│   │   │   └── ExamInterface.tsx
│   │   ├── components/
│   │   ├── store/             # State management
│   │   └── api/               # API configuration
│   └── package.json
└── README.md
```

## 🔧 Configuration

### Database Configuration
Edit `backend/exam_platform/settings.py`:
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'exam_platform',
        'USER': 'your_username',
        'PASSWORD': 'your_password',
        'HOST': 'localhost',
        'PORT': '3306',
    }
}
```

### API Configuration
Edit `frontend/src/api/axios.ts`:
```typescript
const api = axios.create({
  baseURL: 'http://localhost:8000/api',
})
```

## 🧪 Testing

### Test User Accounts
The sample data script creates:
- 1 Admin
- 2 Teachers
- 5 Students
- Sample departments, courses, subjects
- 1 sample exam with 5 questions

### Test Workflow
1. Login as teacher
2. Create an exam
3. Add questions
4. Login as admin
5. Approve the exam
6. Login as student
7. Take the exam
8. Test violations (switch tabs)
9. Submit exam
10. Download certificate

## 🚨 Troubleshooting

### Common Issues

**MySQL Connection Error**
```bash
pip install mysqlclient
# Ensure MySQL is running
```

**CORS Issues**
- Check CORS settings in `settings.py`
- Verify API URL in `axios.ts`

**Media Files Not Loading**
```bash
mkdir backend/media
mkdir backend/media/profiles
mkdir backend/media/certificates
```

## 🔄 API Endpoints

### Authentication
- `POST /api/auth/register/` - Register user
- `POST /api/auth/login/` - Login

### Exams
- `GET /api/exams/` - List exams
- `POST /api/exams/` - Create exam
- `POST /api/exams/{id}/approve/` - Approve exam
- `GET /api/exams/{id}/students_status/` - Monitor students

### Attempts
- `POST /api/attempts/start_exam/` - Start exam
- `POST /api/attempts/{id}/save_answer/` - Save answer
- `POST /api/attempts/{id}/log_violation/` - Log violation
- `POST /api/attempts/{id}/submit_exam/` - Submit exam
- `GET /api/attempts/{id}/download_certificate/` - Download certificate

## 📈 Future Enhancements

- [ ] Video proctoring
- [ ] AI-based cheating detection
- [ ] Mobile application
- [ ] Advanced analytics
- [ ] Email notifications
- [ ] Bulk question import (CSV/Excel)
- [ ] Question bank management
- [ ] Adaptive testing
- [ ] Integration with LMS

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Support

For issues and questions:
- Check the [Setup Guide](SETUP_GUIDE.md)
- Review [Features Documentation](FEATURES.md)
- Open an issue on GitHub

## 🌟 Acknowledgments

Built with modern web technologies for secure and efficient online examination management.
