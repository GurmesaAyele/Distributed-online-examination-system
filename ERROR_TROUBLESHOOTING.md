# Error Troubleshooting Guide

## ❌ "Error creating exam: Unknown error"

### What Was Fixed

**Problem**: Generic error message didn't show the actual issue

**Solution**: Enhanced error handling to show detailed error messages

---

## 🔧 Improvements Made

### 1. Better Error Messages

**Before**:
```
Error creating exam: Unknown error
```

**After**:
```
Error creating exam: start_time: This field is required
Check browser console for details.
```

### 2. Default Time Values

**Added automatic defaults**:
- If `start_time` is empty → Uses current time
- If `end_time` is empty → Uses current time + 2 hours

**Code**:
```typescript
if (!examData.start_time) {
  const now = new Date()
  examData.start_time = now.toISOString().slice(0, 16)
}

if (!examData.end_time) {
  const twoHoursLater = new Date(Date.now() + 2 * 60 * 60 * 1000)
  examData.end_time = twoHoursLater.toISOString().slice(0, 16)
}
```

### 3. Console Logging

**Added detailed logs**:
```typescript
console.log('Creating exam with data:', examData)
console.log('Exam created:', examResponse.data)
console.log('Adding questions:', parsedQuestions)
console.log('Questions added successfully')
```

### 4. Helper Text

**Added to date/time fields**:
- Start Time: "Leave empty for current time"
- End Time: "Leave empty for 2 hours from now"

---

## 🐛 Common Errors & Solutions

### Error: "start_time: This field is required"

**Cause**: Start time field is empty

**Solution**: 
- Fill in start time manually, OR
- Leave empty (system will use current time)

### Error: "end_time: This field is required"

**Cause**: End time field is empty

**Solution**:
- Fill in end time manually, OR
- Leave empty (system will use current time + 2 hours)

### Error: "subject: This field may not be null"

**Cause**: No subject selected

**Solution**: Select a subject from dropdown

### Error: "title: This field may not be blank"

**Cause**: Title field is empty

**Solution**: Enter exam title

### Error: "teacher: This field is required"

**Cause**: ExamSerializer was requiring teacher field in request

**Solution**: ✅ FIXED - Added `read_only_fields = ['teacher', 'status']` to ExamSerializer
- Teacher is now automatically set from logged-in user
- No need to send teacher in request

### Error: "Network Error"

**Cause**: Backend not running

**Solution**: 
```bash
cd backend
python manage.py runserver
```

### Error: "401 Unauthorized"

**Cause**: Not logged in or token expired

**Solution**: Logout and login again

---

## 🔍 How to Debug

### Step 1: Open Browser Console

**Chrome/Edge**: Press `F12` or `Ctrl+Shift+I`
**Firefox**: Press `F12` or `Ctrl+Shift+K`

### Step 2: Go to Console Tab

Look for error messages in red

### Step 3: Check Logs

You should see:
```
Creating exam with data: {title: "...", subject: 1, ...}
```

If error occurs, you'll see:
```
Full error object: {...}
Error response: {...}
Error response data: {...}
```

### Step 4: Read Error Message

The error data will show exactly what's wrong:
```javascript
{
  "start_time": ["This field is required"],
  "subject": ["This field may not be null"]
}
```

---

## ✅ Testing After Fix

### Test 1: Create Exam Without Times

1. Upload PDF
2. Fill title and subject
3. **Leave start_time and end_time empty**
4. Click "Create Exam"

**Expected**: 
- ✅ Success! Uses default times
- ✅ Exam created

### Test 2: Create Exam With Times

1. Upload PDF
2. Fill title and subject
3. **Fill start_time and end_time**
4. Click "Create Exam"

**Expected**:
- ✅ Success! Uses your times
- ✅ Exam created

### Test 3: Create Exam Without Subject

1. Upload PDF
2. Fill title
3. **Don't select subject**
4. Click "Create Exam"

**Expected**:
- ❌ Alert: "Please fill in exam title and subject"
- ❌ Exam not created

### Test 4: Check Console Logs

1. Open browser console
2. Upload PDF and create exam
3. Check logs

**Expected**:
```
Creating exam with data: {...}
Exam created: {id: 1, ...}
Adding questions: [...]
Questions added successfully
```

---

## 📝 Checklist Before Creating Exam

- [ ] PDF uploaded and questions extracted
- [ ] Title filled in
- [ ] Subject selected
- [ ] Duration set (default: 60 minutes)
- [ ] Total marks set (default: 100)
- [ ] Passing marks set (default: 40)
- [ ] Start time (optional - uses current time if empty)
- [ ] End time (optional - uses +2 hours if empty)
- [ ] Correct answers verified
- [ ] Browser console open (for debugging)

---

## 🆘 Still Having Issues?

### Check Backend Logs

```bash
# In backend terminal, you should see:
POST /api/exams/ 201 Created
POST /api/questions/bulk_create/ 201 Created
```

If you see errors:
```bash
POST /api/exams/ 400 Bad Request
```

Check what the error says in backend terminal.

### Check Database

```bash
cd backend
python manage.py shell
```

```python
from api.models import Exam
Exam.objects.all()
# Should show your exams
```

### Check Authentication

```bash
# In browser console:
localStorage.getItem('token')
# Should show a token
```

If null, login again.

---

## 📊 Error Response Format

### Successful Response:
```json
{
  "id": 1,
  "title": "PDF Test Exam",
  "status": "pending",
  ...
}
```

### Error Response:
```json
{
  "start_time": ["This field is required"],
  "subject": ["This field may not be null"]
}
```

Or:
```json
{
  "detail": "Authentication credentials were not provided."
}
```

Or:
```json
{
  "error": "Exam not found"
}
```

---

## 🎯 Summary

**Problem**: Generic "Unknown error" message

**Root Cause**: Missing start_time/end_time fields

**Solution**:
1. ✅ Added default time values
2. ✅ Enhanced error messages
3. ✅ Added console logging
4. ✅ Added helper text
5. ✅ Better error extraction

**Result**: Clear error messages and automatic defaults

---

**Last Updated**: December 5, 2025  
**Status**: ✅ Fixed
