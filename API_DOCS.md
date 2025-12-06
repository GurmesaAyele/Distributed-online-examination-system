# API Documentation

Base URL: `http://localhost:8000/api`

## Authentication

All endpoints except `/auth/register/` and `/auth/login/` require JWT authentication.

Include the token in the Authorization header:
```
Authorization: Bearer <your_access_token>
```

### Register
**POST** `/auth/register/`

Create a new user account.

**Request Body:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "first_name": "string",
  "last_name": "string",
  "role": "student|teacher|admin"
}
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "role": "student"
  },
  "access": "jwt_access_token",
  "refresh": "jwt_refresh_token"
}
```

### Login
**POST** `/auth/login/`

Authenticate and receive JWT tokens.

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "username": "john_doe",
    "role": "student"
  },
  "access": "jwt_access_token",
  "refresh": "jwt_refresh_token"
}
```

## Users

### List Users
**GET** `/users/`

Get list of users (Admin only).

**Response:**
```json
[
  {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "student",
    "is_active": true,
    "profile_picture": "/media/profiles/john.jpg"
  }
]
```

### Get Current User
**GET** `/users/me/`

Get authenticated user's profile.

### Upload Profile Picture
**POST** `/users/upload_profile_picture/`

Upload profile picture for current user.

**Request:** multipart/form-data
```
profile_picture: <file>
```

### Create User
**POST** `/users/`

Create new user (Admin only).

### Update User
**PATCH** `/users/{id}/`

Update user details (Admin only).

### Delete User
**DELETE** `/users/{id}/`

Delete user (Admin only).

## Departments

### List Departments
**GET** `/departments/`

### Create Department
**POST** `/departments/`

**Request Body:**
```json
{
  "name": "Computer Science",
  "code": "CS"
}
```

### Update Department
**PATCH** `/departments/{id}/`

### Delete Department
**DELETE** `/departments/{id}/`

## Courses

### List Courses
**GET** `/courses/`

**Response:**
```json
[
  {
    "id": 1,
    "name": "B.Tech Computer Science",
    "code": "BTECH-CS",
    "department": 1,
    "department_name": "Computer Science"
  }
]
```

### Create Course
**POST** `/courses/`

**Request Body:**
```json
{
  "name": "B.Tech Computer Science",
  "code": "BTECH-CS",
  "department": 1
}
```

## Subjects

### List Subjects
**GET** `/subjects/`

**Response:**
```json
[
  {
    "id": 1,
    "name": "Data Structures",
    "code": "CS101",
    "course": 1,
    "course_name": "B.Tech CS",
    "teacher": 2,
    "teacher_name": "John Smith"
  }
]
```

### Create Subject
**POST** `/subjects/`

**Request Body:**
```json
{
  "name": "Data Structures",
  "code": "CS101",
  "course": 1,
  "teacher": 2
}
```

## Exams

### List Exams
**GET** `/exams/`

Returns exams based on user role:
- Admin: All exams
- Teacher: Own exams
- Student: Assigned approved exams

**Response:**
```json
[
  {
    "id": 1,
    "title": "Mid-Term Exam",
    "description": "Covers chapters 1-5",
    "subject": 1,
    "subject_name": "Data Structures",
    "teacher": 2,
    "teacher_name": "John Smith",
    "duration_minutes": 60,
    "total_marks": 50,
    "passing_marks": 20,
    "negative_marking": true,
    "negative_marks_per_question": 0.25,
    "shuffle_questions": true,
    "status": "approved",
    "start_time": "2024-01-15T10:00:00Z",
    "end_time": "2024-01-15T11:00:00Z",
    "questions_count": 25
  }
]
```

### Get Exam Details
**GET** `/exams/{id}/`

Returns exam with all questions.

**Response:**
```json
{
  "id": 1,
  "title": "Mid-Term Exam",
  "questions": [
    {
      "id": 1,
      "question_text": "What is the time complexity of binary search?",
      "question_type": "mcq",
      "marks": 2,
      "option_a": "O(1)",
      "option_b": "O(log n)",
      "option_c": "O(n)",
      "option_d": "O(n^2)",
      "order": 1
    }
  ]
}
```

### Create Exam
**POST** `/exams/`

Create new exam (Teacher only).

**Request Body:**
```json
{
  "title": "Mid-Term Exam",
  "description": "Covers chapters 1-5",
  "subject": 1,
  "duration_minutes": 60,
  "total_marks": 50,
  "passing_marks": 20,
  "negative_marking": true,
  "negative_marks_per_question": 0.25,
  "shuffle_questions": true,
  "shuffle_options": true,
  "start_time": "2024-01-15T10:00:00Z",
  "end_time": "2024-01-15T11:00:00Z"
}
```

### Approve Exam
**POST** `/exams/{id}/approve/`

Approve exam (Admin only).

### Reject Exam
**POST** `/exams/{id}/reject/`

Reject exam (Admin only).

### Get Students Status
**GET** `/exams/{id}/students_status/`

Get real-time status of students taking exam (Teacher only).

**Response:**
```json
[
  {
    "student_id": 5,
    "student_name": "Jane Doe",
    "is_online": true,
    "status": "in_progress",
    "progress": 15,
    "violations": 2
  }
]
```

## Questions

### List Questions
**GET** `/questions/`

### Create Question
**POST** `/questions/`

**Request Body:**
```json
{
  "exam": 1,
  "question_text": "What is the time complexity?",
  "question_type": "mcq",
  "marks": 2,
  "option_a": "O(1)",
  "option_b": "O(log n)",
  "option_c": "O(n)",
  "option_d": "O(n^2)",
  "correct_answer": "B",
  "explanation": "Binary search divides the array in half",
  "order": 1
}
```

### Bulk Create Questions
**POST** `/questions/bulk_create/`

Create multiple questions at once.

**Request Body:**
```json
{
  "exam_id": 1,
  "questions": [
    {
      "question_text": "Question 1",
      "question_type": "mcq",
      "marks": 2,
      "option_a": "A",
      "option_b": "B",
      "option_c": "C",
      "option_d": "D",
      "correct_answer": "A"
    }
  ]
}
```

## Exam Assignments

### Assign Students to Exam
**POST** `/assignments/assign_students/`

Assign multiple students to an exam.

**Request Body:**
```json
{
  "exam_id": 1,
  "student_ids": [5, 6, 7, 8]
}
```

## Exam Attempts

### Start Exam
**POST** `/attempts/start_exam/`

Start a new exam attempt.

**Request Body:**
```json
{
  "exam_id": 1
}
```

**Response:**
```json
{
  "id": 1,
  "exam": 1,
  "student": 5,
  "start_time": "2024-01-15T10:00:00Z",
  "status": "in_progress",
  "total_marks": 50,
  "tab_switch_count": 0,
  "copy_paste_count": 0
}
```

### Save Answer
**POST** `/attempts/{id}/save_answer/`

Save answer for a question (auto-save).

**Request Body:**
```json
{
  "question_id": 1,
  "answer_text": "B"
}
```

### Log Violation
**POST** `/attempts/{id}/log_violation/`

Log a security violation.

**Request Body:**
```json
{
  "violation_type": "tab_switch",
  "details": "User switched to another tab"
}
```

**Response:**
```json
{
  "message": "Violation logged",
  "total_violations": 1,
  "auto_submit": false
}
```

Or if 3rd violation:
```json
{
  "message": "Exam auto-submitted due to violations",
  "auto_submit": true
}
```

### Submit Exam
**POST** `/attempts/{id}/submit_exam/`

Submit exam for grading.

**Response:**
```json
{
  "message": "Exam submitted successfully"
}
```

### Download Certificate
**GET** `/attempts/{id}/download_certificate/`

Download PDF certificate for completed exam.

**Response:**
```json
{
  "pdf_url": "/media/certificates/certificate_student1_1_20240115.pdf"
}
```

## Notifications

### List Notifications
**GET** `/notifications/`

Get notifications for current user.

**Response:**
```json
[
  {
    "id": 1,
    "title": "New Exam Assigned",
    "message": "You have been assigned to Mid-Term Exam",
    "is_read": false,
    "created_at": "2024-01-15T09:00:00Z"
  }
]
```

### Mark Notification as Read
**POST** `/notifications/{id}/mark_read/`

## Announcements

### List Announcements
**GET** `/announcements/`

Get announcements for current user's role.

**Response:**
```json
[
  {
    "id": 1,
    "title": "System Maintenance",
    "content": "The system will be down for maintenance on...",
    "created_by": 1,
    "created_by_name": "Admin User",
    "target_role": "student",
    "created_at": "2024-01-15T08:00:00Z"
  }
]
```

### Create Announcement
**POST** `/announcements/`

Create announcement (Admin only).

**Request Body:**
```json
{
  "title": "System Maintenance",
  "content": "The system will be down...",
  "target_role": "student"
}
```

## Error Responses

### 400 Bad Request
```json
{
  "error": "Invalid data provided",
  "details": {
    "field_name": ["Error message"]
  }
}
```

### 401 Unauthorized
```json
{
  "detail": "Authentication credentials were not provided."
}
```

### 403 Forbidden
```json
{
  "error": "You do not have permission to perform this action."
}
```

### 404 Not Found
```json
{
  "detail": "Not found."
}
```

### 500 Internal Server Error
```json
{
  "error": "An error occurred while processing your request."
}
```

## Rate Limiting

Currently no rate limiting is implemented. For production, consider implementing rate limiting on sensitive endpoints.

## Pagination

List endpoints support pagination:
```
GET /api/exams/?page=1&page_size=10
```

## Filtering

Some endpoints support filtering:
```
GET /api/exams/?status=approved
GET /api/users/?role=student
```

## Ordering

Some endpoints support ordering:
```
GET /api/exams/?ordering=-created_at
GET /api/attempts/?ordering=start_time
```

## WebSocket Support (Future)

Real-time features currently use polling. WebSocket support planned for:
- Live exam monitoring
- Real-time notifications
- Instant violation alerts
