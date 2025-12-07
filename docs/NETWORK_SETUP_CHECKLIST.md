# Network Deployment Setup Checklist

Use this checklist to deploy your Online Exam Platform on two separate computers.

---

## 📋 Pre-Deployment Checklist

- [ ] Both computers are on the same network (WiFi or LAN)
- [ ] Backend computer has MySQL/WAMP installed and running
- [ ] Backend computer has Python and Django installed
- [ ] Frontend computer has Node.js and npm installed
- [ ] You have admin access to both computers (for firewall configuration)

---

## 🖥️ BACKEND COMPUTER SETUP

### Step 1: Find Your IP Address
- [ ] Open Command Prompt (cmd)
- [ ] Run: `ipconfig`
- [ ] Note down your IPv4 Address (e.g., `192.168.1.100`)
- [ ] Write it here: `_________________`

### Step 2: Configure Firewall
- [ ] Open Windows Defender Firewall
- [ ] Go to Advanced Settings
- [ ] Create new Inbound Rule for port 8000
- [ ] Allow TCP connections on port 8000

### Step 3: Start Backend Server
- [ ] Open Command Prompt
- [ ] Navigate to project folder
- [ ] Run: `docs\start_backend_network.bat`
- [ ] OR manually run: `cd backend && python manage.py runserver 0.0.0.0:8000`

### Step 4: Verify Backend is Running
- [ ] Open browser on backend computer
- [ ] Go to: `http://localhost:8000/api/`
- [ ] You should see Django REST Framework page
- [ ] Go to: `http://YOUR_IP:8000/api/` (replace YOUR_IP)
- [ ] Should also work with IP address

### Step 5: Test from Another Device
- [ ] From your phone or another computer on same network
- [ ] Open browser and go to: `http://YOUR_BACKEND_IP:8000/api/`
- [ ] If this works, backend is properly configured! ✅

---

## 💻 FRONTEND COMPUTER SETUP

### Step 1: Find Your IP Address
- [ ] Open Command Prompt (cmd)
- [ ] Run: `ipconfig`
- [ ] Note down your IPv4 Address (e.g., `192.168.1.101`)
- [ ] Write it here: `_________________`

### Step 2: Create Environment Configuration
- [ ] Navigate to `frontend` folder
- [ ] Create a new file named `.env` (no extension)
- [ ] Add this line: `VITE_API_URL=http://BACKEND_IP:8000`
- [ ] Replace `BACKEND_IP` with the backend computer's IP from above
- [ ] Example: `VITE_API_URL=http://192.168.1.100:8000`

### Step 3: Install Dependencies (if not done)
- [ ] Open Command Prompt in frontend folder
- [ ] Run: `npm install`
- [ ] Wait for installation to complete

### Step 4: Start Frontend Server
- [ ] Run: `..\docs\start_frontend_network.bat`
- [ ] OR manually run: `npm run dev -- --host`
- [ ] Note the Network URL shown (e.g., `http://192.168.1.101:5173`)

### Step 5: Verify Frontend is Running
- [ ] Open browser on frontend computer
- [ ] Go to: `http://localhost:5173`
- [ ] You should see the login page
- [ ] Try logging in to verify backend connection

### Step 6: Test from Another Device
- [ ] From your phone or another computer on same network
- [ ] Open browser and go to: `http://YOUR_FRONTEND_IP:5173`
- [ ] Should see login page
- [ ] Try logging in
- [ ] If login works, everything is configured correctly! ✅

---

## 🧪 TESTING CHECKLIST

### Basic Functionality Tests
- [ ] Login with admin account
- [ ] Login with teacher account
- [ ] Login with student account
- [ ] Upload profile picture (tests media file access)
- [ ] Create an exam (teacher)
- [ ] View announcements
- [ ] Change password

### Network Access Tests
- [ ] Access from backend computer: `http://localhost:5173`
- [ ] Access from frontend computer: `http://localhost:5173`
- [ ] Access from third device: `http://FRONTEND_IP:5173`
- [ ] All three should work identically

### Media Files Test
- [ ] Upload system logo (Admin Dashboard → System Settings)
- [ ] Logo appears on login page
- [ ] Profile pictures display correctly
- [ ] Certificate downloads work

---

## 🔧 TROUBLESHOOTING

### Problem: Can't access backend from frontend computer

**Check 1: Network connectivity**
```cmd
ping BACKEND_IP
```
- [ ] Ping successful? If not, computers aren't on same network

**Check 2: Port accessibility**
```cmd
telnet BACKEND_IP 8000
```
- [ ] Connection successful? If not, firewall is blocking

**Check 3: Django running on correct interface**
- [ ] Must use `runserver 0.0.0.0:8000`, not just `runserver`
- [ ] Check terminal output shows: "Starting development server at http://0.0.0.0:8000/"

**Check 4: Firewall settings**
- [ ] Windows Firewall allows port 8000
- [ ] Antivirus not blocking connections

### Problem: Frontend shows "Network Error"

**Check 1: .env file**
- [ ] File exists in `frontend` folder
- [ ] File is named exactly `.env` (not `.env.txt`)
- [ ] Contains: `VITE_API_URL=http://BACKEND_IP:8000`
- [ ] IP address is correct

**Check 2: Restart frontend after .env changes**
- [ ] Stop frontend server (Ctrl+C)
- [ ] Start again: `npm run dev -- --host`
- [ ] .env changes only apply after restart

**Check 3: Browser console**
- [ ] Press F12 to open developer tools
- [ ] Check Console tab for errors
- [ ] Check Network tab to see API requests

### Problem: Images/Media not loading

**Check 1: Media URL configuration**
- [ ] Backend running and accessible
- [ ] .env file has correct backend IP
- [ ] Browser console shows correct media URLs

**Check 2: Django media settings**
- [ ] `MEDIA_URL = 'media/'` in settings.py
- [ ] `MEDIA_ROOT` is configured
- [ ] Files exist in `backend/media/` folder

### Problem: CORS errors in browser console

**Check 1: Django CORS settings**
- [ ] `CORS_ALLOW_ALL_ORIGINS = True` in settings.py
- [ ] `corsheaders` in INSTALLED_APPS
- [ ] `CorsMiddleware` in MIDDLEWARE (near the top)

**Check 2: Restart backend**
- [ ] Stop Django server (Ctrl+C)
- [ ] Start again: `python manage.py runserver 0.0.0.0:8000`

---

## 📝 CONFIGURATION SUMMARY

### Backend Computer
- **IP Address:** `_________________`
- **Port:** `8000`
- **Access URL:** `http://YOUR_IP:8000/api/`
- **Start Command:** `python manage.py runserver 0.0.0.0:8000`

### Frontend Computer
- **IP Address:** `_________________`
- **Port:** `5173`
- **Access URL:** `http://YOUR_IP:5173`
- **Start Command:** `npm run dev -- --host`
- **.env File:** `VITE_API_URL=http://BACKEND_IP:8000`

### Network Diagram
```
Your Network (192.168.1.x)
    │
    ├── Backend Computer (192.168.1.100)
    │   ├── Django Server :8000
    │   └── MySQL Database
    │
    └── Frontend Computer (192.168.1.101)
        └── Vite Dev Server :5173
```

---

## ✅ SUCCESS CRITERIA

Your deployment is successful when:

1. ✅ Backend accessible at `http://BACKEND_IP:8000/api/`
2. ✅ Frontend accessible at `http://FRONTEND_IP:5173`
3. ✅ Can login from any device on the network
4. ✅ All features work (exams, announcements, profile pictures)
5. ✅ Media files (images, PDFs) load correctly
6. ✅ No CORS errors in browser console

---

## 🚀 QUICK START COMMANDS

### On Backend Computer:
```cmd
cd backend
python manage.py runserver 0.0.0.0:8000
```

### On Frontend Computer:
```cmd
cd frontend
npm run dev -- --host
```

### Access Application:
```
http://FRONTEND_IP:5173
```

---

## 📞 SUPPORT

If you encounter issues:

1. Check this checklist step by step
2. Review the troubleshooting section
3. Check browser console (F12) for errors
4. Verify both servers are running
5. Confirm both computers are on same network
6. Test with `ping` and `telnet` commands

---

**Last Updated:** December 2025
**Version:** 1.0
