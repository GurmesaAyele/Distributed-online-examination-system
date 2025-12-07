# Network Deployment Guide

This guide explains how to deploy the Online Exam Platform on two separate computers on the same network.

## Architecture
- **Computer 1 (Backend Server)**: Runs Django backend + MySQL database
- **Computer 2 (Frontend Server)**: Runs React frontend
- **Network**: Both computers must be on the same local network (WiFi/LAN)

---

## STEP 1: Setup Backend Computer

### 1.1 Find Backend Computer's IP Address

**On Windows:**
```cmd
ipconfig
```
Look for "IPv4 Address" under your active network adapter (e.g., `192.168.1.100`)

**On Linux/Mac:**
```bash
ifconfig
# or
ip addr show
```

**Example IP:** Let's say your backend computer IP is `192.168.1.100`

### 1.2 Configure Django Settings

The `backend/exam_platform/settings.py` is already configured with:
```python
ALLOWED_HOSTS = ['*']  # Allows connections from any IP
CORS_ALLOW_ALL_ORIGINS = True  # Allows frontend from any origin
```

### 1.3 Start Django Server on Network

Instead of running on localhost, run Django on `0.0.0.0` to accept connections from other computers:

```cmd
cd backend
python manage.py runserver 0.0.0.0:8000
```

This makes the backend accessible at: `http://192.168.1.100:8000`

### 1.4 Configure Windows Firewall (if needed)

If the frontend can't connect, allow port 8000 through Windows Firewall:

1. Open Windows Defender Firewall
2. Click "Advanced settings"
3. Click "Inbound Rules" → "New Rule"
4. Select "Port" → Next
5. Select "TCP" and enter port `8000` → Next
6. Select "Allow the connection" → Next
7. Check all profiles → Next
8. Name it "Django Backend" → Finish

### 1.5 Verify Backend is Accessible

From the backend computer, test:
```
http://192.168.1.100:8000/api/
```

You should see the Django REST Framework browsable API.

---

## STEP 2: Setup Frontend Computer

### 2.1 Create Environment Configuration

Create a `.env` file in the `frontend` folder:

```env
VITE_API_URL=http://192.168.1.100:8000
```

Replace `192.168.1.100` with your actual backend computer's IP address.

### 2.2 Update axios Configuration

The `frontend/src/api/axios.ts` will automatically use the environment variable.

### 2.3 Start Frontend Server

```cmd
cd frontend
npm run dev -- --host
```

The `--host` flag makes the frontend accessible from other computers on the network.

You'll see output like:
```
Local:   http://localhost:5173/
Network: http://192.168.1.101:5173/
```

### 2.4 Access the Application

From any computer on the same network, open a browser and go to:
```
http://192.168.1.101:5173
```

Replace `192.168.1.101` with your frontend computer's IP address.

---

## STEP 3: Testing the Setup

### 3.1 Test from Frontend Computer
1. Open browser: `http://localhost:5173`
2. Try to login
3. Check browser console (F12) for any errors

### 3.2 Test from Another Computer
1. Open browser: `http://192.168.1.101:5173` (frontend computer IP)
2. Try to login
3. Should work exactly like on the frontend computer

### 3.3 Common Issues

**Issue: "Network Error" or "Failed to fetch"**
- Check if backend is running: `http://192.168.1.100:8000/api/`
- Check firewall settings on backend computer
- Verify both computers are on the same network

**Issue: CORS errors**
- Already configured in `settings.py` with `CORS_ALLOW_ALL_ORIGINS = True`

**Issue: Images/Media not loading**
- Media files are served from backend
- URLs automatically use backend IP from environment variable

---

## STEP 4: Production Deployment (Optional)

For a more permanent setup:

### 4.1 Build Frontend for Production

```cmd
cd frontend
npm run build
```

This creates optimized files in `frontend/dist/`

### 4.2 Serve Frontend with a Web Server

**Option A: Using Python's HTTP Server**
```cmd
cd frontend/dist
python -m http.server 5173
```

**Option B: Using Node.js serve**
```cmd
npm install -g serve
cd frontend/dist
serve -s . -l 5173
```

### 4.3 Configure Backend for Production

Update `backend/exam_platform/settings.py`:
```python
DEBUG = False
ALLOWED_HOSTS = ['192.168.1.100', 'localhost']
```

---

## Quick Reference

### Backend Computer (192.168.1.100)
```cmd
cd backend
python manage.py runserver 0.0.0.0:8000
```
Access: `http://192.168.1.100:8000/api/`

### Frontend Computer (192.168.1.101)
```cmd
cd frontend
npm run dev -- --host
```
Access: `http://192.168.1.101:5173`

### Environment Variables
Create `frontend/.env`:
```
VITE_API_URL=http://192.168.1.100:8000
```

---

## Network Diagram

```
┌─────────────────────────────────────────┐
│         Local Network (WiFi/LAN)        │
│              192.168.1.x                 │
└─────────────────────────────────────────┘
           │                    │
           │                    │
    ┌──────▼──────┐      ┌─────▼──────┐
    │  Computer 1 │      │ Computer 2 │
    │  (Backend)  │      │ (Frontend) │
    │             │      │            │
    │ Django      │◄─────┤ React      │
    │ MySQL       │ API  │ Vite       │
    │             │      │            │
    │ :8000       │      │ :5173      │
    └─────────────┘      └────────────┘
         │
         │
    ┌────▼─────┐
    │  MySQL   │
    │ Database │
    └──────────┘
```

---

## Security Notes

⚠️ **Important for Production:**

1. **Change SECRET_KEY** in `settings.py`
2. **Set DEBUG = False** in production
3. **Configure specific ALLOWED_HOSTS** instead of `['*']`
4. **Use HTTPS** for production deployment
5. **Configure proper CORS** settings with specific origins
6. **Use environment variables** for sensitive data
7. **Setup proper database authentication**

---

## Troubleshooting

### Can't connect to backend from frontend computer

1. **Ping test:**
   ```cmd
   ping 192.168.1.100
   ```
   If this fails, computers aren't on same network.

2. **Port test:**
   ```cmd
   telnet 192.168.1.100 8000
   ```
   If this fails, firewall is blocking or Django isn't running.

3. **Check Django is listening on 0.0.0.0:**
   Must use `runserver 0.0.0.0:8000`, not just `runserver`

### Media files (images) not loading

Check `frontend/src/pages/Login.tsx` and other files that reference media:
- Should use: `${import.meta.env.VITE_API_URL}${systemSettings.logo}`
- Not hardcoded: `http://localhost:8000${systemSettings.logo}`

---

## Summary

✅ Backend runs on Computer 1 at `192.168.1.100:8000`
✅ Frontend runs on Computer 2 at `192.168.1.101:5173`
✅ Frontend configured to call backend API via environment variable
✅ Both accessible from any device on the same network
✅ Firewall configured to allow connections
✅ CORS configured to allow cross-origin requests

Your system is now distributed across two computers! 🎉
