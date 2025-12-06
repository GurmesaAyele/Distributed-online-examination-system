# Quick Reference Guide

## 🚀 Quick Start

### Start Both Servers
```bash
# Terminal 1 - Backend
cd backend
python manage.py runserver

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

### Access URLs
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **Admin Panel**: http://localhost:8000/admin

---

## 👥 Test Accounts

### Admin
- Username: `admin`
- Password: `admin123`
- Role: Admin

### Teacher
- Username: `teacher1`
- Password: `teacher123`
- Role: Teacher

### Student
- Username: `student1`
- Password: `student123`
- Role: Student

---

## 🎯 Key Features to Test

### 1. Anti-Cheating (3-Strike System)
**Steps**:
1. Login as student
2. Start any exam
3. Switch browser tabs 3 times
4. Observe warnings and auto-submit

**Expected**:
- 1st switch: "WARNING #1" + alert sound
- 2nd switch: "WARNING #2" (last chance)
- 3rd switch: Auto-submit + redirect

---

### 2. Scheduled Exams
**Steps**:
1. Login as teacher
2. Create exam with specific start/end times
3. Login as student
4. Check "My Exams" tab

**Expected**:
- Exam only visible during scheduled time window
- Hidden before start_time
- Hidden after end_time

---

### 3. Profile Pictures & Certificates
**Steps**:
1. Login as student
2. Click upload icon (top right)
3. Upload profile picture
4. Complete an exam
5. Go to "Results" tab
6. Click "Download Certificate"

**Expected**:
- Profile picture appears on result card
- Certificate PDF includes profile picture
- Professional certificate layout

---

### 4. Results Tab
**Location**: Student Dashboard → Results Tab

**Features**:
- ✅ Profile picture on cards
- ✅ Color-coded borders (green=pass, red=fail)
- ✅ Progress bars
- ✅ Violation badges
- ✅ Pass/fail chips
- ✅ Download certificate button

---

### 5. Dashboard Tabs

**Admin Dashboard** (7 tabs):
1. Analytics - Charts
2. Users - CRUD operations
3. Exams - Approve/reject
4. Departments - Manage departments
5. Courses - Manage courses
6. Subjects - Manage subjects
7. Announcements - System messages

**Student Dashboard** (3 tabs):
1. My Exams - Available exams
2. Analytics - Performance charts
3. Results - History & certificates

**Teacher Dashboard** (4 tabs):
1. My Exams - Created exams
2. Analytics - Statistics
3. Create Exam - With PDF upload
4. Monitor Students - Real-time status

---

## 🔧 Common Tasks

### Create Sample Data
```bash
cd backend
python create_sample_data.py
```

### Create Superuser
```bash
cd backend
python create_superuser.py
```

### Reset Database
```bash
cd backend
python manage.py flush
python manage.py migrate
python create_sample_data.py
```

---

## 📊 API Quick Reference

### Authentication
```javascript
POST /api/register/
POST /api/login/
```

### Exams
```javascript
GET /api/exams/
POST /api/exams/
GET /api/exams/{id}/
```

### Exam Attempts
```javascript
POST /api/attempts/start_exam/
POST /api/attempts/{id}/save_answer/
POST /api/attempts/{id}/log_violation/
POST /api/attempts/{id}/submit_exam/
GET /api/attempts/{id}/download_certificate/
```

### User Management
```javascript
GET /api/users/me/
POST /api/users/upload_profile_picture/
```

---

## 🐛 Troubleshooting

### Frontend Not Loading
```bash
cd frontend
npm install
npm run dev
```

### Backend Errors
```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
```

### CORS Issues
- Check `backend/exam_platform/settings.py`
- Verify `CORS_ALLOWED_ORIGINS` includes `http://localhost:5173`

### Database Issues
```bash
cd backend
python manage.py makemigrations
python manage.py migrate
```

---

## 📁 Important Files

### Frontend
- `src/pages/StudentDashboard.tsx` - Student interface
- `src/pages/ExamInterface.tsx` - Exam taking
- `src/pages/TeacherDashboard.tsx` - Teacher interface
- `src/pages/AdminDashboard.tsx` - Admin interface

### Backend
- `api/views.py` - API endpoints
- `api/models.py` - Database models
- `api/serializers.py` - Data serialization
- `api/utils.py` - Certificate generation

---

## ✅ Feature Checklist

- [x] User authentication (JWT)
- [x] Role-based access (Admin/Teacher/Student)
- [x] Exam creation and management
- [x] Question types (MCQ, True/False, Subjective)
- [x] 3-strike anti-cheating system
- [x] Tab switching detection
- [x] Copy/paste prevention
- [x] Scheduled exam display
- [x] Auto-grading for MCQs
- [x] Profile picture upload
- [x] Certificate generation with photos
- [x] Real-time charts (12+ charts)
- [x] Tab-based navigation
- [x] Violation tracking
- [x] Results history
- [x] PDF certificate download

---

## 🎨 UI Components

### Material-UI Components Used
- AppBar, Toolbar
- Card, CardContent
- Button, IconButton
- Grid, Box, Container
- Typography
- Tabs, Tab
- Avatar, Chip
- LinearProgress
- Dialog, Alert
- TextField, Radio, RadioGroup

### Recharts Components Used
- LineChart, Line
- BarChart, Bar
- PieChart, Pie
- RadarChart, Radar
- AreaChart, Area
- ComposedChart

---

## 📞 Support Files

- `README.md` - Project overview
- `SETUP_GUIDE.md` - Detailed setup
- `TROUBLESHOOTING.md` - Common issues
- `API_DOCS.md` - API documentation
- `FEATURE_VERIFICATION.md` - Feature testing
- `SESSION_COMPLETION_SUMMARY.md` - Latest changes

---

**Last Updated**: December 5, 2025  
**Version**: 1.0.0  
**Status**: Production Ready ✅
