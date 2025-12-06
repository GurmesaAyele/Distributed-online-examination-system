# Test New Admin Features

## 🧪 Quick Test Script

### Prerequisites
- Backend running on http://localhost:8000
- Frontend running on http://localhost:5173
- Sample data loaded

---

## Test 1: Password Reset ✅

### Steps
1. Open browser → http://localhost:5173
2. Login as admin:
   - Username: `admin`
   - Password: `admin123`
3. Click "Users" tab
4. Find "student1" in the table
5. Click "Reset Password" button
6. In dialog:
   - New Password: `student999`
   - Confirm Password: `student999`
7. Click "Reset Password"
8. Should see: "Password reset successfully for student1!"
9. Click "I Understand"
10. Logout (click logout icon)
11. Login as student1:
    - Username: `student1`
    - Password: `student999` (NEW PASSWORD)
12. Should login successfully! ✅

### Expected Results
- ✅ Dialog opens with student1's username
- ✅ Password fields are type="password" (hidden)
- ✅ Submit button disabled until passwords match
- ✅ Error shown if passwords don't match
- ✅ Success message after reset
- ✅ Can login with new password
- ✅ Old password no longer works

---

## Test 2: Exam Approval ✅

### Part A: Create Exam (Teacher)
1. Logout from admin
2. Login as teacher:
   - Username: `teacher1`
   - Password: `teacher123`
3. Go to "Create Exam" tab
4. Fill in exam details:
   - Title: `Test Approval Exam`
   - Subject: (select any)
   - Duration: `60`
   - Total Marks: `100`
   - Start Time: (today's date, current time)
   - End Time: (today's date, +2 hours)
5. Click "Create Exam"
6. Should see success message
7. Logout

### Part B: Verify Student Cannot See (Before Approval)
1. Login as student:
   - Username: `student1`
   - Password: `student999` (or `student123` if you didn't reset)
2. Go to "My Exams" tab
3. Should NOT see "Test Approval Exam" ❌
4. Logout

### Part C: Admin Approves Exam
1. Login as admin:
   - Username: `admin`
   - Password: `admin123`
2. Go to "Exams" tab
3. Should see orange section at top:
   - "⚠️ Pending Exam Approvals (1)" or more
4. Find "Test Approval Exam" in pending section
5. Should see:
   - Title: Test Approval Exam
   - Teacher: teacher1's name
   - Duration: 60 min
   - Total Marks: 100
6. Click green "Approve" button
7. Should see: "Exam approved"
8. Exam should move to "All Exams" section below
9. Status chip should be green "approved"
10. Logout

### Part D: Verify Student Can Now See (After Approval)
1. Login as student:
   - Username: `student1`
   - Password: `student999`
2. Go to "My Exams" tab
3. Should NOW see "Test Approval Exam" ✅
4. Should have green "approved" chip
5. Should have "Start Exam" button
6. Success! ✅

### Expected Results
- ✅ Pending exam shows in orange section
- ✅ Exam details displayed correctly
- ✅ Approve button works
- ✅ Status changes to "approved"
- ✅ Student cannot see before approval
- ✅ Student CAN see after approval
- ✅ Exam only visible during time window

---

## Test 3: Exam Rejection ✅

### Steps
1. Login as teacher → Create another exam
2. Logout
3. Login as admin → Go to Exams tab
4. Find new exam in pending section
5. Click red "Reject" button
6. Should see: "Exam rejected"
7. Status should change to red "rejected"
8. Logout
9. Login as student
10. Should NOT see rejected exam ❌

### Expected Results
- ✅ Reject button works
- ✅ Status changes to "rejected"
- ✅ Students cannot see rejected exams
- ✅ Exam stays in system but hidden

---

## Test 4: Password Validation ✅

### Steps
1. Login as admin
2. Go to Users tab
3. Click "Reset Password" for any user
4. Try these scenarios:

**Scenario A: Too Short**
- New Password: `abc123` (6 chars)
- Confirm: `abc123`
- Result: Button should be disabled ❌

**Scenario B: Mismatch**
- New Password: `password123`
- Confirm: `password456`
- Result: Error message "Passwords do not match" ❌

**Scenario C: Valid**
- New Password: `password123` (8+ chars)
- Confirm: `password123`
- Result: Button enabled, can submit ✅

### Expected Results
- ✅ Minimum 8 characters enforced
- ✅ Passwords must match
- ✅ Real-time validation
- ✅ Clear error messages
- ✅ Button disabled when invalid

---

## Test 5: UI/UX Check ✅

### Visual Elements to Verify

**Users Tab**:
- ✅ "Reset Password" button visible for each user
- ✅ Button has outline style
- ✅ Positioned between Edit and Toggle icons

**Exams Tab**:
- ✅ Orange section at top for pending exams
- ✅ Warning icon (⚠️) in title
- ✅ Count shows correct number
- ✅ Green "Approve" button with CheckCircle icon
- ✅ Red "Reject" button with Cancel icon
- ✅ Color-coded status chips
- ✅ All exams section below pending

**Password Dialog**:
- ✅ Title shows username
- ✅ Helper text explains requirements
- ✅ Password fields are hidden (dots)
- ✅ Error message for mismatch
- ✅ Submit button disabled when invalid

---

## 🐛 Common Issues & Solutions

### Issue: Cannot see pending exams
**Solution**: Make sure teacher created exam and you're logged in as admin

### Issue: Student can see pending exam
**Solution**: Check StudentDashboard.tsx filter - should include `exam.status === 'approved'`

### Issue: Password reset doesn't work
**Solution**: Check backend is running and user exists

### Issue: Exam not visible after approval
**Solution**: Check exam time window - must be between start_time and end_time

---

## ✅ Success Criteria

All tests should pass with these results:

- [x] Admin can reset any user's password
- [x] Password validation works correctly
- [x] User can login with new password
- [x] Pending exams show in orange section
- [x] Admin can approve exams
- [x] Admin can reject exams
- [x] Students only see approved exams
- [x] Students see exams only in time window
- [x] UI is clear and user-friendly
- [x] No errors in console
- [x] All actions provide feedback

---

## 📊 Test Results Template

```
Date: ___________
Tester: ___________

Test 1 - Password Reset:        [ ] Pass  [ ] Fail
Test 2 - Exam Approval:          [ ] Pass  [ ] Fail
Test 3 - Exam Rejection:         [ ] Pass  [ ] Fail
Test 4 - Password Validation:    [ ] Pass  [ ] Fail
Test 5 - UI/UX Check:            [ ] Pass  [ ] Fail

Notes:
_________________________________
_________________________________
_________________________________

Overall Status: [ ] All Pass  [ ] Some Fail
```

---

**Happy Testing!** 🎉
