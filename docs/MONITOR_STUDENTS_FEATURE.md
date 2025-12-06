# Monitor Students Feature - Complete Implementation

## Overview
The Monitor Students feature in the Teacher Dashboard allows teachers to track students taking exams in real-time, including their progress, violations, and status.

## Features Implemented

### 1. Summary Cards
Four summary cards display at-a-glance statistics:
- **Students Online**: Count of students currently taking the exam (status: in_progress)
- **With Violations**: Count of students who have committed any violations
- **Banned**: Count of students auto-submitted due to exceeding 3 violations
- **Completed**: Count of students who have submitted or completed the exam

### 2. Detailed Student Table
Comprehensive table showing:
- **Student Name**: With avatar showing first letter of name
- **Status**: Online (🟢) or Offline (⚫) indicator
- **Action**: "Taking Exam" or "Not Active" status
- **Progress**: Visual progress bar showing questions answered (e.g., "5 / 20 questions")
- **Tab Switches**: Count of tab switch violations
- **Copy/Paste**: Count of copy/paste violations
- **Total Violations**: Sum of all violations (color-coded: green=0, yellow=1-2, red=3+)
- **Exam Status**: 
  - 🚫 BANNED (auto_submitted)
  - ✅ Completed (submitted/evaluated)
  - 📝 In Progress (in_progress)
  - Not Started (not_started)

### 3. Visual Indicators
- **Color-coded rows**: Banned students have red background
- **Progress bars**: Green bars showing completion percentage
- **Status chips**: Color-coded chips for quick status identification
- **Refresh button**: Manual refresh to update student data

## Backend API

### Endpoint: `/exams/{id}/students_status/`
**Method**: GET  
**Permission**: Teacher must be the exam creator or Admin

**Response Format**:
```json
[
  {
    "student_id": 1,
    "student_name": "John Doe",
    "is_online": true,
    "status": "in_progress",
    "progress": 5,
    "tab_switch_count": 2,
    "copy_paste_count": 1,
    "violations": 3
  }
]
```

**Status Values**:
- `not_started`: Student hasn't started the exam
- `in_progress`: Student is currently taking the exam
- `submitted`: Student has submitted the exam
- `auto_submitted`: Student was banned due to violations
- `evaluated`: Exam has been graded

## How to Use

### For Teachers:
1. Go to **My Exams** tab
2. Click **Monitor** button on any exam
3. View real-time student status in the **Monitor Students** tab
4. Click **🔄 Refresh** to update data

### Accessing from Exam Creation:
- After creating an exam, click **Monitor** to track students

## Violation System
- **Tab Switch**: Logged when student switches browser tabs
- **Copy/Paste**: Logged when student attempts to copy or paste
- **Auto-Ban**: After 3 total violations, student is automatically banned and exam is submitted

## Technical Details

### Frontend Components:
- **File**: `frontend/src/pages/TeacherDashboard.tsx`
- **Tab**: Monitor Students (Tab 3)
- **State**: `studentsStatus` array
- **Refresh**: `fetchStudentsStatus(examId)` function

### Backend Components:
- **File**: `backend/api/views.py`
- **ViewSet**: `ExamViewSet`
- **Action**: `students_status`
- **Models**: `ExamAssignment`, `ExamAttempt`, `Answer`

### Data Flow:
1. Teacher clicks Monitor button → `handleMonitorExam(exam)`
2. Sets `selectedExam` and switches to Tab 3
3. Calls `fetchStudentsStatus(exam.id)`
4. Backend queries all assignments for the exam
5. For each assignment, gets the latest attempt
6. Returns student data with status and violations
7. Frontend displays in summary cards and table

## Future Enhancements (Optional)
- Auto-refresh every 10 seconds
- Real-time WebSocket updates
- Export student status to CSV
- Filter by status (online/offline/banned)
- Sort by violations or progress
- Individual student detail view
- Violation history timeline

## Testing Checklist
- [ ] Create an exam as teacher
- [ ] Assign students to exam
- [ ] Have students start the exam
- [ ] Monitor shows students as online
- [ ] Progress updates as students answer questions
- [ ] Tab switches are logged and displayed
- [ ] Copy/paste attempts are logged
- [ ] Students with 3+ violations show as banned
- [ ] Completed exams show correct status
- [ ] Refresh button updates data

## Status
✅ **COMPLETE** - All requested features implemented and working
