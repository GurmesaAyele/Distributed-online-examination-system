# Test PDF Parsing Feature

## 🧪 Quick Test Guide

### Prerequisites
1. Backend running: `cd backend && python manage.py runserver`
2. Frontend running: `cd frontend && npm run dev`
3. Install PyPDF2: `pip install PyPDF2==3.0.1`

---

## Test 1: Create Sample PDF

### Create a test PDF with this content:

```
Sample Exam Questions

1. What is the capital of France?
A) London
B) Paris
C) Berlin
D) Madrid
Answer: B

2. Which programming language is known for data science?
A) Java
B) C++
C) Python
D) Ruby
Answer: C

3. Is HTML a programming language?
Answer: False

4. What does CPU stand for?
A) Central Processing Unit
B) Computer Personal Unit
C) Central Program Utility
D) Computer Processing Unit
Answer: A

5. Which company developed React?
A) Google
B) Microsoft
C) Facebook
D) Amazon
Answer: C
```

**How to create PDF**:
1. Copy text above
2. Paste into Word/Google Docs
3. Save/Export as PDF
4. Name it `test_questions.pdf`

---

## Test 2: Upload and Parse

### Steps:
1. Open browser → http://localhost:5173
2. Login as teacher:
   - Username: `teacher1`
   - Password: `teacher123`
3. Click "Create Exam" tab
4. Drag `test_questions.pdf` onto blue upload area
5. Wait 2-3 seconds

### Expected Result:
- ✅ Message: "Successfully extracted 5 questions from PDF"
- ✅ Green chip: "✓ 5 questions extracted"
- ✅ 5 question cards displayed below
- ✅ Each card shows:
  - Question text
  - 4 options (A, B, C, D)
  - Correct answer dropdown
  - Marks field

---

## Test 3: Edit Questions

### Steps:
1. Click on Question 1 text field
2. Change text to: "What is the capital city of France?"
3. Click on Option A
4. Change to: "Rome"
5. Change correct answer dropdown to "B"
6. Change marks to "2"

### Expected Result:
- ✅ All changes saved in real-time
- ✅ No page refresh needed
- ✅ Changes visible immediately

---

## Test 4: Remove Question

### Steps:
1. Find Question 3 (True/False)
2. Click "Remove Question" button
3. Confirm removal

### Expected Result:
- ✅ Question removed from list
- ✅ Question count updates: "✓ 4 questions extracted"
- ✅ Remaining questions renumbered

---

## Test 5: Fill Exam Details

### Steps:
1. Fill in exam details:
   - Title: `Sample PDF Exam`
   - Subject: (select any)
   - Description: `Test exam from PDF`
   - Duration: `30` minutes
   - Total Marks: `100`
   - Passing Marks: `40`
   - Start Time: (today, current time)
   - End Time: (today, +2 hours)

### Expected Result:
- ✅ All fields accept input
- ✅ No validation errors
- ✅ Date/time pickers work

---

## Test 6: Create Exam

### Steps:
1. Click "✓ Create Exam with 4 Questions" button
2. Wait for response

### Expected Result:
- ✅ Success message: "Exam created successfully with 4 questions!"
- ✅ Message: "Status: Pending (awaiting admin approval)"
- ✅ Form clears
- ✅ Questions cleared
- ✅ Can create another exam

---

## Test 7: Verify Exam Created

### Steps:
1. Click "My Exams" tab
2. Find "Sample PDF Exam"

### Expected Result:
- ✅ Exam appears in list
- ✅ Status: "pending"
- ✅ Shows 4 questions
- ✅ Shows correct duration

---

## Test 8: Admin Approval

### Steps:
1. Logout from teacher account
2. Login as admin:
   - Username: `admin`
   - Password: `admin123`
3. Go to "Exams" tab
4. Find "Sample PDF Exam" in pending section
5. Click "Approve"

### Expected Result:
- ✅ Success message: "Exam approved"
- ✅ Status changes to "approved"
- ✅ Exam moves to approved section

---

## Test 9: Student View

### Steps:
1. Logout from admin
2. Login as student:
   - Username: `student1`
   - Password: `student123`
3. Go to "My Exams" tab
4. Look for "Sample PDF Exam"

### Expected Result:
- ✅ Exam visible (if within time window)
- ✅ Shows "approved" status
- ✅ "Start Exam" button available
- ✅ Shows duration and marks

---

## Test 10: Take Exam

### Steps:
1. Click "Start Exam" on "Sample PDF Exam"
2. Answer questions
3. Submit exam

### Expected Result:
- ✅ Questions match PDF content
- ✅ Options correct
- ✅ Can select answers
- ✅ Submit works
- ✅ Results calculated

---

## 🐛 Error Testing

### Test 11: Invalid PDF

**Steps**:
1. Try uploading a non-PDF file (e.g., .txt, .docx)

**Expected**:
- ❌ Error: "File must be a PDF"

### Test 12: Empty PDF

**Steps**:
1. Create empty PDF
2. Upload it

**Expected**:
- ❌ Error: "No questions found in PDF"
- ❌ Shows format example

### Test 13: Malformed Questions

**Steps**:
1. Create PDF with questions but no answers
2. Upload it

**Expected**:
- ⚠️ Questions extracted but answers default to "A"
- ✅ Teacher can edit correct answers

---

## ✅ Success Criteria

All tests should pass:
- [x] PDF uploads successfully
- [x] Questions extracted correctly
- [x] Questions editable
- [x] Questions removable
- [x] Exam details fillable
- [x] Exam creates with questions
- [x] Admin can approve
- [x] Students can see approved exam
- [x] Students can take exam
- [x] Error handling works

---

## 📊 Test Results Template

```
Date: ___________
Tester: ___________

Test 1 - Create PDF:           [ ] Pass  [ ] Fail
Test 2 - Upload & Parse:       [ ] Pass  [ ] Fail
Test 3 - Edit Questions:       [ ] Pass  [ ] Fail
Test 4 - Remove Question:      [ ] Pass  [ ] Fail
Test 5 - Fill Details:         [ ] Pass  [ ] Fail
Test 6 - Create Exam:          [ ] Pass  [ ] Fail
Test 7 - Verify Created:       [ ] Pass  [ ] Fail
Test 8 - Admin Approval:       [ ] Pass  [ ] Fail
Test 9 - Student View:         [ ] Pass  [ ] Fail
Test 10 - Take Exam:           [ ] Pass  [ ] Fail
Test 11 - Invalid PDF:         [ ] Pass  [ ] Fail
Test 12 - Empty PDF:           [ ] Pass  [ ] Fail
Test 13 - Malformed:           [ ] Pass  [ ] Fail

Overall: [ ] All Pass  [ ] Some Fail

Notes:
_________________________________
```

---

**Happy Testing!** 🎉
