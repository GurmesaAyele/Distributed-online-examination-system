@echo off
echo ========================================
echo Creating MySQL Database for Exam Platform
echo ========================================
echo.

echo Please ensure MySQL is installed and running.
echo.

set /p MYSQL_PATH="Enter MySQL bin path (or press Enter if in PATH): "
set /p MYSQL_USER="Enter MySQL username (default: root): "
if "%MYSQL_USER%"=="" set MYSQL_USER=root

echo.
echo Creating database 'exam_platform'...
echo.

if "%MYSQL_PATH%"=="" (
    mysql -u %MYSQL_USER% -p < backend\create_database.sql
) else (
    "%MYSQL_PATH%\mysql" -u %MYSQL_USER% -p < backend\create_database.sql
)

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo Database created successfully!
    echo ========================================
    echo.
    echo Next steps:
    echo 1. Update backend/exam_platform/settings.py with your MySQL credentials
    echo 2. Run: cd backend
    echo 3. Run: python -m venv venv
    echo 4. Run: venv\Scripts\activate
    echo 5. Run: pip install -r requirements.txt
    echo 6. Run: python manage.py makemigrations
    echo 7. Run: python manage.py migrate
    echo 8. Run: python manage.py createsuperuser
    echo.
) else (
    echo.
    echo ========================================
    echo Error creating database!
    echo ========================================
    echo Please check:
    echo - MySQL is installed and running
    echo - MySQL credentials are correct
    echo - MySQL bin path is correct
    echo.
)

pause
