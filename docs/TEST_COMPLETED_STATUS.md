# Quick Test Guide - Completed Exam Status & Tab Switching

## 🎯 What to Test

### Feature 1: Completed Exam Status
After submitting an exam, it should show as "Completed" instead of "Active" or "Ended"

### Feature 2: Tab Switching Detection
Opening new tabs during exam should trigger warnings (2 times) then auto-submit (3rd time)

---

## 🧪 TEST 1: Completed Exam Status

### Steps:
1. **Start both servers:**
   ```bash
   # Terminal 1 - Backend
   cd backend
   python manage.py runserver

   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

2. **Login as Student:**
   - Go to http://localhost:5173
   - Login with student credentials

3. **Take an Exam:**
   - Find an "Active" exam (green border)
   - Click "▶️ Start Exam Now"
   - Answer some questions
   - Click "Submit Exam"

4. **Check Student Dashboard:**
   - Return to dashboard
   - The exam you just completed should now show:
     - ✅ **Purple border** (not green/blue/red)
     - ✅ **"Completed" chip** (purple)
     - ✅ **Purple box** with completion details
     - ✅ **Completion date and time**
     - ✅ **"Already Completed" button** (disabled)

5. **If Exam is Evaluated:**
   - Should also show:
     - 📊 Score: X/Y
     - 🎯 Percentage: XX.XX%
     - Color: Green if passed, Red if failed

### Expected Result:
```
┌─────────────────────────────────────┐
│ Math Final Exam    [Completed]      │ ← Purple chip
│ Mathematics                          │
│ ┌─────────────────────────────────┐ │
│ │ ✅ Exam Completed               │ │ ← Purple background
│ │ 📅 Completed: Dec 5, 2025 3:45 │ │
│ │ ⏳ Awaiting evaluation...       │ │ ← If not graded yet
│ └─────────────────────────────────┘ │
│ [✅ Already Completed]              │ ← Disabled
└─────────────────────────────────────┘
```

---

## 🧪 TEST 2: Tab Switching Detection

### Steps:
1. **Open Browser Console:**
   - Press F12 to open Developer Tools
   - Go to "Console" tab
   - Keep it open to see logs

2. **Start an Exam:**
   - Login as student
   - Click "▶️ Start Exam Now" on an active exam
   - You should see exam interface with questions

3. **First Tab Switch:**
   - Switch to another browser tab (or minimize window)
   - **Expected:**
     - Console shows: `🚨 Tab switch detected! Current violations: 0`
     - Console shows: `📝 Logging violation: tab_switch`
     - Console shows: `⚠️ Total violations now: 1`
     - Console shows: `🔔 First warning shown`
     - Dialog appears: "⚠️ WARNING #1: Tab switching and copy/paste are not allowed! You have 2 more chances."
     - Violations counter shows: "Violations: 1/3"

4. **Second Tab Switch:**
   - Switch tabs again
   - **Expected:**
     - Console shows: `⚠️ Total violations now: 2`
     - Console shows: `🔔 Second warning shown`
     - Dialog appears: "⚠️ WARNING #2: This is your LAST chance! One more violation will auto-submit your exam."
     - Violations counter shows: "Violations: 2/3"

5. **Third Tab Switch:**
   - Switch tabs one more time
   - **Expected:**
     - Console shows: `⚠️ Total violations now: 3`
     - Console shows: `🚫 Exam auto-submitted due to violations`
     - Dialog appears: "🚫 EXAM AUTO-SUBMITTED: You exceeded the maximum violations (3). Your exam has been saved and submitted."
     - After 3 seconds, redirects to Student Dashboard
     - Exam now shows as "Completed" with "Auto-submitted due to violations" message

### Console Output Example:
```
🚨 Tab switch detected! Current violations: 0
📝 Logging violation: tab_switch - User switched tabs or minimized window
⚠️ Total violations now: 1
🔔 First warning shown

🚨 Tab switch detected! Current violations: 1
📝 Logging violation: tab_switch - User switched tabs or minimized window
⚠️ Total violations now: 2
🔔 Second warning shown

🚨 Tab switch detected! Current violations: 2
📝 Logging violation: tab_switch - User switched tabs or minimized window
⚠️ Total violations now: 3
🚫 Exam auto-submitted due to violations
```

---

## 🧪 TEST 3: Copy/Paste Detection

### Steps:
1. **During Exam:**
   - Try to copy text (Ctrl+C)
   - Try to paste text (Ctrl+V)
   - **Expected:**
     - Copy/paste is blocked
     - Violation logged
     - Warning dialog appears
     - Counts toward 3-strike limit

2. **Right-Click:**
   - Try to right-click on the page
   - **Expected:**
     - Context menu is disabled
     - No violation logged (just prevented)

---

## 🧪 TEST 4: Check Results Tab

### Steps:
1. **Go to Results Tab:**
   - In Student Dashboard, click "Results" tab
   - Find the exam you auto-submitted

2. **Check Violation Display:**
   - Should show warning chip: "3 Violations"
   - Status should show: "Auto-submitted"
   - Score might be lower due to incomplete answers

---

## ✅ SUCCESS CRITERIA

### Completed Exam Status:
- ✅ Completed exams have purple border
- ✅ Shows "Completed" chip
- ✅ Shows completion date/time
- ✅ Shows score if evaluated
- ✅ Button is disabled
- ✅ Cannot retake exam

### Tab Switching:
- ✅ First violation: Warning #1
- ✅ Second violation: Warning #2
- ✅ Third violation: Auto-submit
- ✅ Console logs show all events
- ✅ Violations counter updates
- ✅ Redirects to dashboard after auto-submit
- ✅ Exam shows as "Completed" with violation warning

---

## 🐛 TROUBLESHOOTING

### Issue: Completed exam not showing purple
**Solution:** Refresh the page, check console for errors

### Issue: Tab switching not detected
**Solution:** 
- Make sure you're actually switching tabs (not just clicking elsewhere)
- Check browser console for errors
- Try minimizing the window instead

### Issue: No warnings appearing
**Solution:**
- Check if attempt was created (console should show attempt ID)
- Check backend is running
- Check network tab for API errors

### Issue: Auto-submit not working
**Solution:**
- Check console logs
- Verify backend received 3 violations
- Check if exam status changed to 'auto_submitted'

---

## 📊 WHAT TO LOOK FOR

### In Student Dashboard:
1. Exam cards with different colors:
   - 🔵 Blue = Upcoming
   - 🟢 Green = Active
   - 🔴 Red = Ended
   - 🟣 Purple = Completed

2. Completed exam details:
   - Completion date
   - Score (if evaluated)
   - Status message

### In Exam Interface:
1. Violations counter in header
2. Warning dialogs on violations
3. Console logs for debugging

### In Results Tab:
1. Violation count chips
2. Auto-submit status
3. Score and percentage

---

## 🎉 EXPECTED BEHAVIOR

Everything is working correctly if:
1. ✅ Completed exams show with purple styling
2. ✅ Tab switching triggers warnings (1st, 2nd)
3. ✅ Third tab switch auto-submits exam
4. ✅ Console shows detailed logs
5. ✅ Violations are tracked and displayed
6. ✅ Cannot retake completed exams
