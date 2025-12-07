@echo off
echo ========================================
echo  Starting Frontend Server on Network
echo ========================================
echo.

cd /d "%~dp0\..\frontend"

echo.
echo IMPORTANT: Make sure you have created a .env file with your backend IP!
echo.
echo Example .env file content:
echo   VITE_API_URL=http://192.168.1.100:8000
echo.
echo Replace 192.168.1.100 with your backend computer's IP address
echo.
pause

echo.
echo Starting Vite development server with network access...
echo This makes the frontend accessible from other computers on the network
echo.
echo Press Ctrl+C to stop the server
echo.

npm run dev -- --host

pause
