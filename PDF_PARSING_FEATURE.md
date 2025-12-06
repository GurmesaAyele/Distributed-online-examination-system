# PDF Question Parsing Feature

## 🎯 Overview

Teachers can now upload PDF files containing exam questions, and the system will automatically extract and parse them into editable questions. This dramatically speeds up exam creation.

## ✨ Features

### 1. PDF Upload
- **Drag & Drop**: Drag PDF file directly onto the upload area
- **Click to Browse**: Click the upload button to select file
- **Real-time Parsing**: Questions extracted immediately
- **Progress Indicator**: Shows "Parsing PDF..." while processing

### 2. Question Extraction
Supports multiple PDF formats:

**Format 1: Numbered with A) B) C) D)**
```
1. What is the capital of France?
A) London
B) Paris
C) Berlin
D) Madrid
Answer: B
```

**Format 2: Q1: with a. b. c. d.**
```
Q1: Which planet is closest to the sun?
a. Venus
b. Mercury
c. Earth
d. Mars
Correct: b
```

**Format 3: True/False**
```
1. Python is a programming language.
Answer: True
```

### 3. Question Review & Edit
- All extracted questions displayed in editable cards
- Modify question text
- Edit options (A, B, C, D)
- Change correct answer
- Adjust marks per question
- Remove unwanted questions

### 4. Exam Creation
- Fill in exam details (title, subject, duration, etc.)
- Review parsed questions
- Edit as needed
- Click "Create Exam with X Questions"
- Exam created with all questions
- Status: Pending (awaits admin approval)

---

## 📋 How to Use

### Step 1: Navigate to Create Exam Tab
1. Login as teacher
2. Go to Teacher Dashboard
3. Click "Create Exam" tab

### Step 2: Upload PDF
1. Drag PDF file onto blue upload area, OR
2. Click "📎 Upload PDF" button
3. Select your PDF file
4. Wait for parsing (usually < 5 seconds)

### Step 3: Review Questions
1. System displays all extracted questions
2. Each question shown in a card with:
   - Question text
   - Options (A, B, C, D)
   - Correct answer
   - Marks
3. Edit any field by clicking on it
4. Remove questions if needed

### Step 4: Fill Exam Details
1. Enter exam title (required)
2. Select subject (required)
3. Set duration in minutes
4. Set total marks
5. Set passing marks
6. Choose start and end times
7. Configure other settings

### Step 5: Create Exam
1. Click "✓ Create Exam with X Questions"
2. System creates exam and adds all questions
3. Success message displayed
4. Exam status: Pending (awaits admin approval)

---

## 🔧 Technical Details

### Backend

**New Files**:
- `backend/api/pdf_parser.py` - PDF parsing logic

**Dependencies**:
- `PyPDF2==3.0.1` - PDF text extraction

**API Endpoint**:
```
POST /api/questions/parse_pdf/
Content-Type: multipart/form-data
Body: { pdf_file: <file> }

Response:
{
  "questions": [...],
  "count": 10,
  "message": "Successfully extracted 10 questions"
}
```

**Parsing Logic**:
1. Extract text from all PDF pages
2. Apply regex patterns to find questions
3. Extract question text, options, and answers
4. Return structured question objects

### Frontend

**Modified Files**:
- `frontend/src/pages/TeacherDashboard.tsx`

**New State Variables**:
```typescript
const [parsedQuestions, setParsedQuestions] = useState<any[]>([])
const [uploadingPdf, setUploadingPdf] = useState(false)
```

**New Functions**:
- `handlePdfUpload(file)` - Upload and parse PDF
- `handleCreateExamWithQuestions()` - Create exam with questions

**UI Components**:
- PDF upload area (drag & drop)
- Question cards (editable)
- Create button (with question count)

---

## 📝 PDF Format Guidelines

### Best Practices

**DO**:
- ✅ Number questions sequentially (1, 2, 3...)
- ✅ Use consistent option labels (A, B, C, D or a, b, c, d)
- ✅ Include "Answer:" or "Correct:" before the answer
- ✅ Keep one question per section
- ✅ Use clear formatting

**DON'T**:
- ❌ Mix different formats in same PDF
- ❌ Use images for questions (text only)
- ❌ Skip question numbers
- ❌ Use inconsistent option labels
- ❌ Forget to include answers

### Example PDF Content

```
1. What is 2 + 2?
A) 3
B) 4
C) 5
D) 6
Answer: B

2. Is the sky blue?
Answer: True

3. Which is a programming language?
A) HTML
B) CSS
C) Python
D) JSON
Answer: C
```

---

## 🧪 Testing

### Test Case 1: Valid PDF
1. Create PDF with 5 questions in correct format
2. Upload to system
3. Verify all 5 questions extracted
4. Check options are correct
5. Verify answers match

### Test Case 2: Invalid PDF
1. Upload PDF with no questions
2. Should show error message
3. Should suggest correct format

### Test Case 3: Edit Questions
1. Upload PDF with questions
2. Edit question text
3. Change correct answer
4. Remove one question
5. Create exam
6. Verify changes saved

### Test Case 4: Complete Flow
1. Upload PDF (10 questions)
2. Fill exam details
3. Create exam
4. Logout
5. Login as admin
6. Approve exam
7. Login as student
8. Verify exam visible (if in time window)
9. Start exam
10. Verify questions match PDF

---

## ⚠️ Limitations

### Current Limitations
1. **Text Only**: Cannot extract questions from images
2. **Format Specific**: Requires specific question format
3. **Manual Review**: Always review extracted questions
4. **No Tables**: Cannot parse questions in table format
5. **English Only**: Best results with English text

### Workarounds
- **Images**: Manually type questions with images
- **Tables**: Convert to text format first
- **Complex Formatting**: Use manual question entry
- **Mixed Formats**: Split into multiple PDFs

---

## 🔒 Security

### Validation
- ✅ File type checked (must be .pdf)
- ✅ Teacher authentication required
- ✅ File size limits enforced
- ✅ Malicious content filtered

### Privacy
- ✅ PDFs not stored permanently
- ✅ Only text extracted
- ✅ Teacher-only access
- ✅ Questions linked to teacher's exam

---

## 🚀 Benefits

### For Teachers
- ⚡ **Fast**: Create exams in minutes, not hours
- 📝 **Easy**: No manual typing of questions
- ✏️ **Editable**: Review and modify before creating
- 🔄 **Reusable**: Use existing question banks

### For Students
- ✅ **Quality**: Reviewed questions
- 📚 **Variety**: More exams available
- ⏱️ **Timely**: Faster exam creation

### For Institution
- 💰 **Cost-effective**: Less time spent on data entry
- 📈 **Scalable**: Handle more exams
- 🎯 **Consistent**: Standardized format

---

## 📊 Workflow Diagram

```
Teacher Creates PDF
       ↓
Upload to System
       ↓
System Parses PDF
       ↓
Questions Extracted
       ↓
Teacher Reviews/Edits
       ↓
Teacher Fills Exam Details
       ↓
Click "Create Exam"
       ↓
Exam Created (Pending)
       ↓
Admin Approves
       ↓
Students Can Access
```

---

## 🆘 Troubleshooting

### Problem: No questions extracted
**Solution**: Check PDF format matches examples above

### Problem: Wrong answers extracted
**Solution**: Review and edit correct answer dropdown

### Problem: Missing options
**Solution**: Ensure PDF has all 4 options (A, B, C, D)

### Problem: Upload fails
**Solution**: Check file is actually a PDF, not image

### Problem: Questions garbled
**Solution**: Ensure PDF has selectable text (not scanned image)

---

## 📚 Additional Resources

### Sample PDFs
- Create sample PDFs using the format examples
- Test with small PDFs first (5-10 questions)
- Gradually increase complexity

### Tips
- Use consistent formatting throughout PDF
- Double-check answers before uploading
- Always review extracted questions
- Edit marks if needed (default is 1)
- Remove duplicate questions

---

**Version**: 1.0.0  
**Last Updated**: December 5, 2025  
**Status**: ✅ Production Ready
