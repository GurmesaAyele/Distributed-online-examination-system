# Debug Exam Display Issue

## 🐛 Issue: Exams Not Showing in Student Dashboard

### Root Cause Found

The backend `ExamViewSet.get_queryset()` was filtering exams for students with:
1. `assignments__student=user` - Only showed exams with explicit assignments
2. `start_time__lte=now` and `end_time__gte=now` - Only showed active exams

**Problem**: If you didn't create exam assignments, students couldn't see any exams!

---

## ✅ Fix Applied

### Backend Change

**File**: `backend/api/views.py`

**Before**:
```python
def get_queryset(self):
    user = self.request.user
    if user.role == 'admin':
        return Exam.objects.all()
    elif user.role == 'teacher':
        return Exam.objects.filter(teacher=user)
    else:
        return Exam.objects.filter(
            assignments__student=user,  # ← PROBLEM: Requires assignment
            status='approved',
            start_time__lte=timezone.now(),  # ← PROBLEM: Time filter
            end_time__gte=timezone.now()
        )
```

**After**:
```python
def get_queryset(self):
    user = self.request.user
    if user.role == 'admin':
        return Exam.objects.all()
    elif user.role == 'teacher':
        return Exam.objects.filter(teacher=user)
    else:
        # Students see all approved exams (no assignment or time filtering)
        return Exam.objects.filter(status='approved')  # ← FIXED
```

### Frontend Enhancement

**File**: `frontend/src/pages/StudentDashboard.tsx`

Added console logging for debugging:
```typescript
console.log('All exams from API:', examsRes.data)
console.log('Exams count:', examsRes.data.length)
console.log('Approved exams:', approvedExams)
console.log('Approved exams count:', approvedExams.length)
```

---

## 🔍 How to Debug

### Step 1: Check Backend

**Restart backend** (important!):
```bash
cd backend
# Stop server (Ctrl+C)
python manage.py runserver
```

### Step 2: Check Exam Status

1. Login as admin
2. Go to "Exams" tab
3. Check if your exams are **approved** (green chip)
4. If status is "pending" (orange), click "Approve"

### Step 3: Check Browser Console

1. Login as student
2. Open browser console (F12)
3. Go to "My Exams" tab
4. Look for console logs:

**Expected Output**:
```
All exams from API: [{id: 1, title: "...", status: "approved"}, ...]
Exams count: 5
Approved exams: [{id: 1, title: "...", status: "approved"}, ...]
Approved exams count: 5
```

**If exams count is 0**:
- Backend not returning exams
- Check if backend restarted
- Check if logged in as student

**If approved exams count is 0**:
- Exams exist but not approved
- Login as admin and approve them

### Step 4: Check Network Tab

1. Open browser DevTools (F12)
2. Go to Network tab
3. Refresh page
4. Look for request to `/api/exams/`
5. Click on it and check Response

**Expected Response**:
```json
[
  {
    "id": 1,
    "title": "Math Exam",
    "status": "approved",
    "start_time": "2025-12-10T10:00:00Z",
    ...
  }
]
```

**If empty array `[]`**:
- No approved exams in database
- Or backend filter still wrong

---

## 🧪 Testing Steps

### Test 1: Verify Backend Fix

```bash
# In backend terminal
cd backend
python manage.py shell
```

```python
from api.models import Exam

# Check all exams
exams = Exam.objects.all()
print(f"Total exams: {exams.count()}")

# Check approved exams
approved = Exam.objects.filter(status='approved')
print(f"Approved exams: {approved.count()}")

# List them
for exam in approved:
    print(f"- {exam.title} (status: {exam.status})")
```

**Expected**:
```
Total exams: 5
Approved exams: 3
- Math Exam (status: approved)
- Science Quiz (status: approved)
- History Test (status: approved)
```

### Test 2: Approve Exams

1. Login as admin
2. Go to "Exams" tab
3. See pending exams in orange section
4. Click "Approve" for each exam
5. Verify status changes to "approved"

### Test 3: Check Student View

1. Logout from admin
2. Login as student
3. Go to "My Exams" tab
4. Should see all approved exams
5. Check browser console for logs

---

## 📋 Checklist

Before exams show for students:

- [ ] Backend restarted after code change
- [ ] Exams created by teacher
- [ ] Exams approved by admin (status = "approved")
- [ ] Student logged in
- [ ] Browser console shows exams in logs
- [ ] No errors in browser console
- [ ] No errors in backend terminal

---

## 🔧 Common Issues

### Issue 1: Backend Not Restarted

**Symptom**: Code changed but behavior same

**Solution**: 
```bash
cd backend
# Press Ctrl+C to stop
python manage.py runserver
```

### Issue 2: Exams Not Approved

**Symptom**: Console shows 0 approved exams

**Solution**:
1. Login as admin
2. Approve all pending exams

### Issue 3: Wrong User Role

**Symptom**: Seeing different exams than expected

**Solution**: Check user role in console:
```javascript
// In browser console
localStorage.getItem('user')
// Should show role: "student"
```

### Issue 4: Cache Issue

**Symptom**: Old data showing

**Solution**:
1. Hard refresh: Ctrl+Shift+R
2. Clear cache
3. Logout and login again

---

## 🎯 Expected Behavior

### After Fix

**Students should see**:
- ✅ All approved exams
- ✅ Upcoming exams (with countdown)
- ✅ Active exams (can start)
- ✅ Ended exams (can't start)

**Students should NOT see**:
- ❌ Pending exams (not approved)
- ❌ Rejected exams
- ❌ Draft exams

---

## 📊 Verification

### Quick Test

```bash
# 1. Create exam as teacher
# 2. Check as student - should NOT see it (pending)
# 3. Approve as admin
# 4. Check as student - should NOW see it (approved)
```

### Console Output

**Successful**:
```
All exams from API: [
  {id: 1, title: "Math", status: "approved"},
  {id: 2, title: "Science", status: "approved"}
]
Exams count: 2
Approved exams: [
  {id: 1, title: "Math", status: "approved"},
  {id: 2, title: "Science", status: "approved"}
]
Approved exams count: 2
```

**Problem**:
```
All exams from API: []
Exams count: 0
Approved exams: []
Approved exams count: 0
```

---

## 🚀 Summary

**Problem**: Backend filtered exams by assignments and time

**Solution**: Changed backend to show all approved exams

**Action Required**:
1. ✅ Restart backend
2. ✅ Approve exams as admin
3. ✅ Check browser console
4. ✅ Verify exams appear

---

**Date**: December 5, 2025  
**Status**: ✅ Fixed - Restart Backend Required
