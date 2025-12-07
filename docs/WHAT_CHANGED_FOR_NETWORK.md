# What Changed for Network Deployment

This document explains all the changes made to support running the system on two separate computers.

---

## 🔧 CODE CHANGES

### 1. Frontend API Configuration (`frontend/src/api/axios.ts`)

**Before:**
```typescript
const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  ...
})
```

**After:**
```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  ...
})
```

**Why:** Now uses environment variable to configure backend URL, allowing frontend to connect to backend on a different computer.

---

### 2. Axios Interceptor Fix (`frontend/src/api/axios.ts`)

**Before:**
```typescript
if (error.response?.status === 401) {
  useAuthStore.getState().logout()
  window.location.href = '/login'
}
```

**After:**
```typescript
if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
  useAuthStore.getState().logout()
  window.location.href = '/login'
}
```

**Why:** Prevents auto-redirect on login page, allowing error messages to display properly.

---

### 3. Media URLs Updated

**Files Changed:**
- `frontend/src/pages/Login.tsx` - System logo
- `frontend/src/pages/AdminDashboard.tsx` - System logo preview
- `frontend/src/pages/StudentDashboard.tsx` - Certificate downloads

**Before:**
```typescript
src={`http://localhost:8000${systemSettings.logo}`}
```

**After:**
```typescript
src={`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}${systemSettings.logo}`}
```

**Why:** Media files (images, PDFs) are served from backend, so URLs must use backend's IP address.

---

### 4. Backend Configuration (`backend/exam_platform/settings.py`)

**Already Configured:**
```python
ALLOWED_HOSTS = ['*']  # Accepts connections from any IP
CORS_ALLOW_ALL_ORIGINS = True  # Allows frontend from any origin
```

**Why:** These settings were already in place, allowing the backend to accept connections from other computers.

---

## 📄 NEW FILES CREATED

### 1. Environment Configuration

**File:** `frontend/.env.example`
```env
VITE_API_URL=http://localhost:8000
# VITE_API_URL=http://192.168.1.100:8000
```

**Purpose:** Template for creating `.env` file with backend IP address.

---

### 2. Documentation Files

| File | Purpose |
|------|---------|
| `docs/NETWORK_DEPLOYMENT_GUIDE.md` | Complete deployment guide with detailed steps |
| `docs/NETWORK_SETUP_CHECKLIST.md` | Step-by-step checklist for deployment |
| `docs/NETWORK_QUICK_START.md` | Quick reference for fast setup |
| `docs/WHAT_CHANGED_FOR_NETWORK.md` | This file - explains all changes |

---

### 3. Helper Scripts

**File:** `docs/start_backend_network.bat`
```batch
python manage.py runserver 0.0.0.0:8000
```

**File:** `docs/start_frontend_network.bat`
```batch
npm run dev -- --host
```

**Purpose:** Easy-to-use scripts for starting servers with network access.

---

## 🎯 HOW IT WORKS

### Local Development (Same Computer)
```
Frontend (localhost:5173) → Backend (localhost:8000)
```
- No `.env` file needed
- Uses default `http://localhost:8000`
- Works exactly as before

### Network Deployment (Two Computers)
```
Frontend Computer (192.168.1.101:5173)
    ↓
Backend Computer (192.168.1.100:8000)
    ↓
MySQL Database
```

**Frontend Computer:**
1. Create `.env` file: `VITE_API_URL=http://192.168.1.100:8000`
2. Start with: `npm run dev -- --host`
3. Access from any device: `http://192.168.1.101:5173`

**Backend Computer:**
1. Start with: `python manage.py runserver 0.0.0.0:8000`
2. Accessible at: `http://192.168.1.100:8000`

---

## 🔄 BACKWARDS COMPATIBILITY

✅ **All existing functionality preserved:**
- Local development still works without any changes
- No `.env` file needed for local development
- Default behavior unchanged
- All features work identically

✅ **New capability added:**
- Can now deploy on separate computers
- Frontend can connect to remote backend
- Multiple devices can access the system

---

## 🚀 DEPLOYMENT OPTIONS

### Option 1: Local Development (Original)
- Both frontend and backend on same computer
- No configuration needed
- Access: `http://localhost:5173`

### Option 2: Network Deployment (New)
- Frontend on Computer 1
- Backend on Computer 2
- Requires `.env` file configuration
- Access: `http://FRONTEND_IP:5173`

### Option 3: Production Build (New)
- Build frontend: `npm run build`
- Serve `dist` folder with web server
- More efficient for production use

---

## 📊 CONFIGURATION MATRIX

| Scenario | Frontend Location | Backend Location | .env Required | Access URL |
|----------|------------------|------------------|---------------|------------|
| Local Dev | localhost:5173 | localhost:8000 | ❌ No | localhost:5173 |
| Network | 192.168.1.101:5173 | 192.168.1.100:8000 | ✅ Yes | 192.168.1.101:5173 |
| Production | Web Server | 192.168.1.100:8000 | ✅ Yes | domain.com |

---

## 🔐 SECURITY NOTES

**Current Configuration (Development):**
- `ALLOWED_HOSTS = ['*']` - Accepts all connections
- `CORS_ALLOW_ALL_ORIGINS = True` - Allows all origins
- `DEBUG = True` - Shows detailed errors

**For Production, Change to:**
```python
DEBUG = False
ALLOWED_HOSTS = ['192.168.1.100', 'yourdomain.com']
CORS_ALLOWED_ORIGINS = [
    'http://192.168.1.101:5173',
    'https://yourdomain.com',
]
```

---

## ✅ TESTING CHECKLIST

After deployment, verify:

- [ ] Login works from frontend computer
- [ ] Login works from another device on network
- [ ] Profile pictures display correctly
- [ ] System logo appears on login page
- [ ] Exams can be created and taken
- [ ] Announcements work
- [ ] Certificate downloads work
- [ ] All media files load properly

---

## 🆘 TROUBLESHOOTING

### Issue: Frontend can't connect to backend

**Check:**
1. Backend is running: `http://BACKEND_IP:8000/api/`
2. `.env` file exists in `frontend` folder
3. `.env` has correct IP: `VITE_API_URL=http://BACKEND_IP:8000`
4. Frontend restarted after creating `.env`
5. Firewall allows port 8000 on backend computer

### Issue: Images not loading

**Check:**
1. `.env` file has correct backend IP
2. Frontend restarted after `.env` changes
3. Backend is serving media files
4. Browser console shows correct media URLs

---

## 📝 SUMMARY

**What was changed:**
- ✅ Frontend now uses environment variable for API URL
- ✅ Media URLs use environment variable
- ✅ Login error handling fixed
- ✅ Documentation created
- ✅ Helper scripts created

**What stayed the same:**
- ✅ All features work identically
- ✅ Local development unchanged
- ✅ No breaking changes
- ✅ Backwards compatible

**What you can now do:**
- ✅ Run backend on one computer
- ✅ Run frontend on another computer
- ✅ Access from multiple devices
- ✅ Deploy on local network
- ✅ Scale to production

---

**Your system is now ready for network deployment! 🎉**
