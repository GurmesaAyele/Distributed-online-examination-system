# Exam Feedback Feature - Complete Implementation

## Overview
The Exam Feedback feature allows students to leave comments and ratings about exams after completion. Teachers can view all feedback for their exams and respond to students.

## Features Implemented

### 1. Student Dashboard - Submit Feedback
**Location**: Student Dashboard → My Exams Tab & Feedback Tab

**Features**:
- **Leave Feedback Button**: Appears on completed exams (not banned)
- **Feedback Dialog**: 
  - Star rating (1-5 stars, optional)
  - Comment text area (required)
  - Submit button
- **Feedback Tab**: View all submitted feedback
  - See feedback status (Pending/Reviewed)
  - View teacher responses
  - One feedback per exam (unique constraint)

**How to Submit Feedback**:
1. Complete an exam
2. Go to "My Exams" tab
3. Find the completed exam
4. Click "💬 Leave Feedback" button
5. Rate the exam (optional, 1-5 stars)
6. Write your comment
7. Click "Submit Feedback"

### 2. Teacher Dashboard - View & Respond to Feedback
**Location**: Teacher Dashboard → Student Feedback Tab (Tab 5)

**Features**:
- View all feedback for your exams
- See unread feedback count badge (orange)
- Filter by reviewed/pending status
- Respond to student feedback
- Mark feedback as reviewed

**Feedback Display**:
- Exam title
- Student name
- Submission date/time
- Star rating (if provided)
- Student's comment
- Status (Pending/Reviewed)
- Teacher's response (if provided)

**How to Respond**:
1. Go to "Student Feedback" tab
2. See pending feedback (orange badge)
3. Click "Respond" button on feedback
4. Read student's comment
5. Write your response
6. Click "Send Response"
7. Feedback marked as "Reviewed"

## Visual Indicators

### Student Dashboard

#### Feedback Button
- **Location**: Below exam card on completed exams
- **Appearance**: Outlined button with 💬 icon
- **Visibility**: Only shows for completed, non-banned exams

#### Feedback Cards
- **Pending**: Orange "Pending" chip
- **Reviewed**: Green "Reviewed" chip with green border
- **Teacher Response**: Green background box

### Teacher Dashboard

#### Unread Badge
- **Location**: On "Student Feedback" tab label
- **Appearance**: Orange chip with number
- **Shows**: Count of pending (unreviewed) feedback

#### Feedback Cards
- **Pending**: Orange border (2px), "Pending" chip, "Respond" button
- **Reviewed**: Gray border (1px), "Reviewed" chip, no button
- **Response Box**: Green background showing teacher's response

## Database Model

### ExamFeedback Model
```python
class ExamFeedback(models.Model):
    exam = ForeignKey(Exam)
    student = ForeignKey(User)
    attempt = ForeignKey(ExamAttempt, optional)
    comment = TextField()
    rating = IntegerField(1-5, optional)
    is_reviewed = BooleanField(default=False)
    teacher_response = TextField(blank=True)
    created_at = DateTimeField(auto_now_add=True)
    updated_at = DateTimeField(auto_now=True)
    
    unique_together = ('exam', 'student')
```

**Constraints**:
- One feedback per student per exam
- Student must be authenticated
- Only students can create feedback
- Only teachers (of that exam) can respond

## API Endpoints

### Get Feedbacks
**Endpoint**: `GET /feedbacks/`  
**Permission**: Authenticated users  
**Returns**: 
- Students: Their own feedback
- Teachers: Feedback for their exams
- Admins: All feedback

**Response**:
```json
[
  {
    "id": 1,
    "exam": 1,
    "exam_title": "Math Final Exam",
    "student": 5,
    "student_name": "John Doe",
    "attempt": 10,
    "comment": "Great exam, well structured!",
    "rating": 5,
    "is_reviewed": true,
    "teacher_response": "Thank you for your feedback!",
    "created_at": "2024-01-01T10:00:00Z",
    "updated_at": "2024-01-01T11:00:00Z"
  }
]
```

### Submit Feedback
**Endpoint**: `POST /feedbacks/`  
**Permission**: Students only  
**Body**:
```json
{
  "exam": 1,
  "attempt": 10,
  "comment": "Great exam!",
  "rating": 5
}
```

**Validation**:
- Comment is required
- Rating is optional (1-5)
- One feedback per exam per student

### Add Teacher Response
**Endpoint**: `POST /feedbacks/{id}/add_response/`  
**Permission**: Teachers (exam owner) or Admins  
**Body**:
```json
{
  "teacher_response": "Thank you for your feedback!"
}
```

**Effects**:
- Sets `teacher_response` field
- Sets `is_reviewed` to `true`
- Updates `updated_at` timestamp

## User Workflows

### Student Submits Feedback
1. Student completes exam
2. Sees "Leave Feedback" button on exam card
3. Clicks button → Dialog opens
4. Rates exam (optional, clicks stars)
5. Writes comment in text area
6. Clicks "Submit Feedback"
7. Success message appears
8. Feedback appears in "Feedback" tab

### Student Views Feedback Status
1. Goes to "Feedback" tab
2. Sees all submitted feedback
3. Pending feedback shows "Pending" chip
4. Reviewed feedback shows:
   - "Reviewed" chip (green)
   - Teacher's response in green box

### Teacher Reviews Feedback
1. Teacher logs in
2. Sees orange badge on "Student Feedback" tab
3. Clicks tab
4. Sees pending feedback with orange border
5. Clicks "Respond" button
6. Dialog opens showing:
   - Student name
   - Exam title
   - Student's comment
   - Response text area
7. Writes response
8. Clicks "Send Response"
9. Feedback marked as reviewed
10. Badge count decreases

## Rating System

### Star Rating (1-5)
- **Optional field**
- Visual: ★★★★★ (filled/empty stars)
- Interactive in dialog (click to rate)
- Display-only in feedback cards
- Color: Gold (#ffc107) for filled, Gray (#ddd) for empty

### Rating Display
- Student Dashboard: Shows their rating
- Teacher Dashboard: Shows student's rating
- Helps teachers understand satisfaction level

## Unique Constraint

### One Feedback Per Exam
- Database constraint: `unique_together = ('exam', 'student')`
- Student can only submit one feedback per exam
- If student tries to submit again: Error message
- Prevents spam and duplicate feedback

## Permissions & Security

### Student Permissions
- ✅ Can create feedback for completed exams
- ✅ Can view their own feedback
- ✅ Can see teacher responses
- ❌ Cannot edit feedback after submission
- ❌ Cannot delete feedback
- ❌ Cannot respond to feedback

### Teacher Permissions
- ✅ Can view feedback for their exams
- ✅ Can respond to feedback
- ✅ Can mark feedback as reviewed
- ❌ Cannot view feedback for other teachers' exams
- ❌ Cannot edit student comments
- ❌ Cannot delete feedback

### Admin Permissions
- ✅ Can view all feedback
- ✅ Can respond to any feedback
- ✅ Full access to feedback system

## Notification System

### Unread Count Badge
- Shows on "Student Feedback" tab for teachers
- Orange color for visibility
- Shows count of pending (unreviewed) feedback
- Updates in real-time after responding
- Only shows when count > 0

## Testing Checklist

### Student
- [ ] Complete an exam
- [ ] See "Leave Feedback" button
- [ ] Click button and dialog opens
- [ ] Rate exam with stars
- [ ] Write comment
- [ ] Submit feedback successfully
- [ ] See feedback in Feedback tab
- [ ] Try to submit duplicate feedback (should fail)
- [ ] See teacher response when added

### Teacher
- [ ] See feedback badge on tab
- [ ] View pending feedback
- [ ] Click "Respond" button
- [ ] Write response
- [ ] Submit response successfully
- [ ] See feedback marked as reviewed
- [ ] Badge count decreases
- [ ] Cannot respond to other teachers' feedback

### Edge Cases
- [ ] Submit feedback without comment (should fail)
- [ ] Submit feedback without rating (should succeed)
- [ ] Submit duplicate feedback (should fail)
- [ ] Non-student tries to submit feedback (should fail)
- [ ] Non-teacher tries to respond (should fail)
- [ ] Teacher responds to other teacher's exam (should fail)

## Future Enhancements (Optional)
- Edit feedback within 24 hours
- Delete feedback option
- Feedback categories (difficulty, clarity, fairness)
- Anonymous feedback option
- Feedback statistics for teachers
- Export feedback to PDF
- Email notifications for new feedback
- Feedback trends and analytics
- Bulk response templates
- Feedback moderation by admin

## Database Migration

**File**: `backend/api/migrations/0005_examfeedback.py`

**Changes**:
- Created `ExamFeedback` model
- Added unique constraint on (exam, student)
- Added foreign keys to Exam, User, and ExamAttempt

**To Apply**:
```bash
python manage.py migrate
```

## Status
✅ **COMPLETE** - All requested features implemented and working
- Students can leave feedback after completing exams
- Teachers can view and respond to feedback
- Rating system (1-5 stars)
- Unread count badges
- One feedback per exam constraint
- Teacher response system
