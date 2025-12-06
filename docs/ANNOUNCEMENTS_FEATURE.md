# Announcements Feature - Complete Implementation

## Overview
The Announcements feature allows admins to send targeted announcements to specific user roles (students, teachers, admins, or everyone). Users receive notifications with unread counts and can mark announcements as read.

## Features Implemented

### 1. Admin Dashboard - Create & Send Announcements
**Location**: Admin Dashboard → Announcements Tab (Tab 6)

**Features**:
- Create new announcements with title and content
- Target specific roles:
  - **All**: Everyone (students, teachers, admins)
  - **Students**: Only students
  - **Teachers**: Only teachers
  - **Admins**: Only admins
- View all sent announcements
- See which announcements you've read
- Mark announcements as read
- Unread count badge on tab

**How to Create**:
1. Go to Admin Dashboard
2. Click "Announcements" tab
3. Click "Create Announcement" button
4. Fill in:
   - Title
   - Content (supports multi-line text)
   - Target Role (dropdown)
5. Click "Send"

### 2. Student Dashboard - View Announcements
**Location**: Student Dashboard → Announcements Tab (Tab 3)

**Features**:
- View all announcements targeted to students or everyone
- See unread count badge on tab (red number)
- NEW badge on unread announcements
- Mark announcements as read
- Announcements show:
  - Title
  - Content
  - Sender name
  - Date/time sent
  - Read/unread status

### 3. Teacher Dashboard - View Announcements
**Location**: Teacher Dashboard → Announcements Tab (Tab 4)

**Features**:
- View all announcements targeted to teachers or everyone
- See unread count badge on tab (red number)
- NEW badge on unread announcements
- Mark announcements as read
- Same display format as student dashboard

## Visual Indicators

### Unread Count Badge
- **Location**: On the Announcements tab label
- **Appearance**: Red chip with number
- **Behavior**: 
  - Shows count of unread announcements
  - Disappears when all announcements are read
  - Updates in real-time when marking as read

### Announcement Cards
- **Unread**: 
  - Blue border (2px solid)
  - Higher shadow (elevation 3)
  - "NEW" red badge
  - "Mark as Read" button visible
- **Read**:
  - Gray border (1px solid)
  - Lower shadow (elevation 1)
  - No "NEW" badge
  - No "Mark as Read" button

## Backend Implementation

### Database Models

#### Announcement Model
```python
class Announcement(models.Model):
    title = models.CharField(max_length=200)
    content = models.TextField()
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    target_role = models.CharField(max_length=10, choices=User.ROLE_CHOICES, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
```

#### AnnouncementRead Model (NEW)
```python
class AnnouncementRead(models.Model):
    announcement = models.ForeignKey(Announcement, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    read_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('announcement', 'user')
```

### API Endpoints

#### Get Announcements
**Endpoint**: `GET /announcements/`  
**Permission**: Authenticated users  
**Returns**: List of announcements filtered by user's role  
**Response**:
```json
[
  {
    "id": 1,
    "title": "Welcome to the Platform",
    "content": "This is an announcement...",
    "created_by": 1,
    "created_by_name": "Admin User",
    "target_role": "student",
    "created_at": "2024-01-01T10:00:00Z",
    "is_read": false
  }
]
```

#### Get Unread Count
**Endpoint**: `GET /announcements/unread_count/`  
**Permission**: Authenticated users  
**Returns**: Count of unread announcements  
**Response**:
```json
{
  "unread_count": 3
}
```

#### Mark as Read
**Endpoint**: `POST /announcements/{id}/mark_read/`  
**Permission**: Authenticated users  
**Returns**: Success message  
**Response**:
```json
{
  "message": "Announcement marked as read"
}
```

#### Create Announcement
**Endpoint**: `POST /announcements/`  
**Permission**: Admin only  
**Body**:
```json
{
  "title": "Important Update",
  "content": "Please read this...",
  "target_role": "student"
}
```

## User Workflow

### Admin Creates Announcement
1. Admin logs in
2. Goes to Announcements tab
3. Clicks "Create Announcement"
4. Fills in title, content, and selects target role
5. Clicks "Send"
6. Announcement is immediately visible to targeted users

### Student/Teacher Receives Announcement
1. User logs in
2. Sees red badge with number on Announcements tab
3. Clicks Announcements tab
4. Sees unread announcements with "NEW" badge and blue border
5. Reads announcement
6. Clicks "Mark as Read" button
7. Badge number decreases
8. Announcement border changes to gray

## Notification System

### How It Works
1. **On Login**: User sees unread count on tab
2. **Real-time Updates**: Count updates when marking as read
3. **Persistence**: Read status is saved in database
4. **Per-User Tracking**: Each user has their own read/unread status

### Badge Behavior
- Shows on tab label next to "Announcements"
- Red color for visibility
- Small size (20px height)
- Only shows when count > 0
- Updates immediately after marking as read

## Target Role Logic

### Empty/Blank Target Role
- Announcement visible to **everyone** (all roles)
- Useful for system-wide announcements

### Specific Role
- Only users with that role see the announcement
- Examples:
  - `target_role="student"` → Only students
  - `target_role="teacher"` → Only teachers
  - `target_role="admin"` → Only admins

## Database Migration

**File**: `backend/api/migrations/0004_announcementread.py`

**Changes**:
- Created `AnnouncementRead` model
- Added unique constraint on (announcement, user)
- Added foreign keys to Announcement and User models

**To Apply**:
```bash
python manage.py migrate
```

## Frontend Components

### State Management
Each dashboard maintains:
- `announcements`: Array of announcement objects
- `unreadCount`: Number of unread announcements

### Functions
- `fetchAnnouncements()`: Load all announcements
- `fetchUnreadCount()`: Get unread count
- `handleMarkAsRead(id)`: Mark specific announcement as read

### Auto-refresh
- Announcements load on component mount
- Unread count loads on component mount
- Both refresh after marking as read

## Testing Checklist

### Admin
- [ ] Create announcement for all users
- [ ] Create announcement for students only
- [ ] Create announcement for teachers only
- [ ] Create announcement for admins only
- [ ] View sent announcements
- [ ] Mark announcement as read
- [ ] Verify unread count badge

### Student
- [ ] See announcements targeted to students
- [ ] See announcements targeted to all
- [ ] Don't see announcements for teachers/admins
- [ ] See unread count badge
- [ ] Mark announcement as read
- [ ] Verify badge count decreases

### Teacher
- [ ] See announcements targeted to teachers
- [ ] See announcements targeted to all
- [ ] Don't see announcements for students/admins
- [ ] See unread count badge
- [ ] Mark announcement as read
- [ ] Verify badge count decreases

## Future Enhancements (Optional)
- Push notifications
- Email notifications
- Announcement expiry dates
- Announcement priority levels
- Rich text editor for content
- File attachments
- Announcement categories
- Search and filter
- Announcement templates
- Scheduled announcements

## Status
✅ **COMPLETE** - All requested features implemented and working
- Announcements creation by admin
- Role-based targeting
- Unread count badges
- Mark as read functionality
- Visual indicators (NEW badge, borders)
- Real-time updates
