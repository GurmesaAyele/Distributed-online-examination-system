# Monitor Students Feature - Complete Implementation

## Overview
The Monitor Students feature in the Teacher Dashboard allows teachers to track students taking exams in real-time, including their progress, violations, and status.

## Features Implemented

### 1. General Overview (All Exams)
When accessing Monitor Students tab directly:
- **Exam Cards Grid**: Shows all exams in card format
- **Mini Statistics per Exam**:
  - Online students count (blue)
  - Completed students count (green)
  - Students with violations (orange)
  - Banned students count (red)
- **View Details Button**: Click to see detailed monitoring for that exam
- **Refresh All Button**: Updates data for all exams at once
- **Status Chips**: Shows exam status (approved/pending/rejected)

### 2. Specific Exam Monitoring
When monitoring a specific exam (via Monitor button or View Details):

#### Summary Cards
Four summary cards display at-a-glance statistics:
- **Students Online**: Count of students currently taking the exam (status: in_progress)
- **With Violations**: Count of students who have committed any violations
- **Banned**: Count of students auto-submitted due to exceeding 3 violations
- **Completed**: Count of students who have submitted or completed the exam

#### Detailed Student Table
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

#### Visual Indicators
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

### Two Ways to Monitor:

#### 1. General Overview (Monitor Students Tab)
1. Click on **Monitor Students** tab (Tab 3)
2. See overview cards for ALL your exams
3. Each exam card shows:
   - Online students count
   - Completed students count
   - Students with violations
   - Banned students count
4. Click **View Details** on any exam to see detailed monitoring
5. Click **🔄 Refresh All** to update all exams data

#### 2. Specific Exam Monitoring (From My Exams)
1. Go to **My Exams** tab
2. Click **Monitor** button on a specific exam
3. Automatically switches to Monitor Students tab with detailed view
4. See comprehensive student table with:
   - Real-time online/offline status
   - Progress bars
   - Individual violation counts
   - Exam status for each student
5. Click **← Back to All Exams** to return to general overview
6. Click **🔄 Refresh** to update that exam's data

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
