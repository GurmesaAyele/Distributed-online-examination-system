# Network Deployment - Quick Start Guide

## 🎯 Goal
Run backend on Computer 1 and frontend on Computer 2, both accessible on the same network.

---

## ⚡ QUICK STEPS

### COMPUTER 1 (Backend) - 3 Steps

1. **Find your IP:**
   ```cmd
   ipconfig
   ```
   Look for IPv4 Address (e.g., `192.168.1.100`)

2. **Allow port 8000 in Windows Firewall:**
   - Windows Defender Firewall → Advanced Settings
   - New Inbound Rule → Port → TCP 8000 → Allow

3. **Start backend:**
   ```cmd
   cd backend
   python manage.py runserver 0.0.0.0:8000
   ```

### COMPUTER 2 (Frontend) - 3 Steps

1. **Create `.env` file in `frontend` folder:**
   ```
   VITE_API_URL=http://192.168.1.100:8000
   ```
   *(Replace with your backend IP)*

2. **Install dependencies (first time only):**
   ```cmd
   cd frontend
   npm install
   ```

3. **Start frontend:**
   ```cmd
   npm run dev -- --host
   ```

### ACCESS THE APPLICATION

From any device on the same network:
```
http://FRONTEND_IP:5173
```
*(Replace FRONTEND_IP with Computer 2's IP address)*

---

## 🔍 VERIFY IT WORKS

1. **Test backend:** Open `http://BACKEND_IP:8000/api/` in browser
2. **Test frontend:** Open `http://FRONTEND_IP:5173` in browser
3. **Test login:** Try logging in with your credentials
4. **Test from phone:** Access the frontend URL from your phone (on same WiFi)

---

## 🛠️ USING THE BATCH FILES

We've created helper scripts for you:

### Backend Computer:
```cmd
docs\start_backend_network.bat
```

### Frontend Computer:
```cmd
docs\start_frontend_network.bat
```

---

## ❌ COMMON ISSUES

| Problem | Solution |
|---------|----------|
| Can't connect to backend | Check firewall allows port 8000 |
| "Network Error" on frontend | Check `.env` file has correct backend IP |
| Images not loading | Restart frontend after creating `.env` file |
| Can't access from other devices | Make sure all devices on same WiFi/network |

---

## 📚 DETAILED GUIDES

For more information, see:
- `NETWORK_DEPLOYMENT_GUIDE.md` - Complete deployment guide
- `NETWORK_SETUP_CHECKLIST.md` - Step-by-step checklist

---

## 💡 TIPS

- **Backend IP changed?** Update the `.env` file and restart frontend
- **Testing locally?** You can still use `http://localhost:5173` on the frontend computer
- **Production deployment?** Run `npm run build` and serve the `dist` folder
- **Multiple students?** They all access the same frontend URL from their devices

---

## 🎉 SUCCESS!

If you can:
- ✅ Access login page from another device
- ✅ Login successfully
- ✅ See profile pictures and logos
- ✅ Create and take exams

**Your network deployment is working perfectly!**

---

**Need help?** Check the troubleshooting section in `NETWORK_SETUP_CHECKLIST.md`
