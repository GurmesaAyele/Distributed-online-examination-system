@echo off
echo ========================================
echo Online Exam Platform - Quick Start
echo ========================================
echo.

echo Step 1: Setting up Backend...
cd backend
echo Creating virtual environment...
python -m venv venv
call venv\Scripts\activate

echo Installing dependencies...
pip install -r requirements.txt

echo.
echo ========================================
echo IMPORTANT: Database Setup Required
echo ========================================
echo Please ensure MySQL is running and create the database:
echo.
echo   CREATE DATABASE exam_platform;
echo.
echo Then update database credentials in:
echo   backend/exam_platform/settings.py
echo.
pause

echo Running migrations...
python manage.py makemigrations
python manage.py migrate

echo.
echo Creating superuser...
python manage.py createsuperuser

echo.
echo Creating sample data...
python manage.py shell < create_sample_data.py

echo.
echo Starting backend server...
start cmd /k "cd /d %CD% && venv\Scripts\activate && python manage.py runserver"

cd ..

echo.
echo Step 2: Setting up Frontend...
cd frontend
echo Installing dependencies...
call npm install

echo.
echo Starting frontend server...
start cmd /k "cd /d %CD% && npm run dev"

cd ..

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo Backend: http://localhost:8000
echo Frontend: http://localhost:5173
echo Admin Panel: http://localhost:8000/admin
echo.
echo Default credentials:
echo   Admin: admin / admin123
echo   Teacher: teacher1 / teacher123
echo   Student: student1 / student123
echo.
pause
