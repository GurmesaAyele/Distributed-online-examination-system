# Install PDF Parsing Feature

## 📦 Installation Steps

### Step 1: Install PyPDF2

Open terminal in backend directory:

```bash
cd backend
pip install PyPDF2==3.0.1
```

Or install from requirements.txt:

```bash
pip install -r requirements.txt
```

### Step 2: Verify Installation

```bash
python -c "import PyPDF2; print('PyPDF2 installed successfully')"
```

Expected output:
```
PyPDF2 installed successfully
```

### Step 3: Restart Backend

```bash
python manage.py runserver
```

### Step 4: Verify Frontend

Frontend changes are already in place. Just ensure it's running:

```bash
cd frontend
npm run dev
```

---

## ✅ Verification

### Check Backend Endpoint

Open browser or use curl:

```bash
curl -X POST http://localhost:8000/api/questions/parse_pdf/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "pdf_file=@test.pdf"
```

Should return JSON with questions.

### Check Frontend

1. Open http://localhost:5173
2. Login as teacher
3. Go to "Create Exam" tab
4. Should see blue PDF upload area

---

## 🐛 Troubleshooting

### Error: "No module named 'PyPDF2'"

**Solution**:
```bash
pip install PyPDF2==3.0.1
```

### Error: "parse_pdf_questions not found"

**Solution**: Ensure `backend/api/pdf_parser.py` exists

### Error: "Failed to parse PDF"

**Solution**: Check PDF format matches examples in documentation

---

## 📋 Files Checklist

Ensure these files exist:

- [x] `backend/api/pdf_parser.py` - New file
- [x] `backend/api/views.py` - Modified (import added)
- [x] `backend/requirements.txt` - Modified (PyPDF2 added)
- [x] `frontend/src/pages/TeacherDashboard.tsx` - Modified

---

## 🎉 Ready to Use!

Once installed, the feature is ready. See:
- `PDF_PARSING_FEATURE.md` for usage guide
- `TEST_PDF_FEATURE.md` for testing steps

---

**Installation Time**: < 5 minutes  
**Difficulty**: Easy  
**Status**: Ready to Install
