@echo off
echo ========================================
echo  Starting Backend Server on Network
echo ========================================
echo.

cd /d "%~dp0\..\backend"

echo Activating virtual environment...
call venv\Scripts\activate

echo.
echo Starting Django server on 0.0.0.0:8000
echo This makes the backend accessible from other computers on the network
echo.
echo Your backend will be accessible at:
echo   http://YOUR_IP_ADDRESS:8000
echo.
echo To find your IP address, open another terminal and run: ipconfig
echo Look for "IPv4 Address" (e.g., 192.168.1.100)
echo.
echo Press Ctrl+C to stop the server
echo.

python manage.py runserver 0.0.0.0:8000

pause
