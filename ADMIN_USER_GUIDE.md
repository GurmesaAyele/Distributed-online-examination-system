# Admin User Management Guide

## How to Create New Users

### Step 1: Login as Admin
1. Open `http://localhost:5173` in your browser
2. Login with admin credentials:
   - Username: `admin`
   - Password: `admin123`

### Step 2: Access User Management
1. You'll be redirected to the Admin Dashboard
2. The **Users** tab is selected by default
3. You'll see a list of all existing users

### Step 3: Create a New User
1. Click the **"Add User"** button (top right)
2. Fill in the user details:
   - **Username**: Unique username (required)
   - **Email**: Valid email address (required)
   - **First Name**: User's first name (required)
   - **Last Name**: User's last name (required)
   - **Password**: Strong password (required for new users)
   - **Department**: Optional department name
   - **Role**: Select from dropdown:
     - Student
     - Teacher
     - Admin
   - **Active**: Toggle switch (enabled by default)
3. Click **"Create"** button

### Step 4: Edit Existing User
1. In the Users table, click the **Edit** icon (pencil) next to any user
2. Modify the user details:
   - Username cannot be changed
   - Leave password blank to keep current password
   - Update any other fields as needed
3. Click **"Update"** button

### Step 5: Manage User Status
- **Activate/Deactivate**: Click the status icon to toggle user active status
- **Delete User**: Click the delete icon (trash) to permanently remove a user
  - Confirmation dialog will appear

## User Management Features

### View All Users
The Users table displays:
- Username
- Full Name (First + Last)
- Email Address
- Role (with colored chip)
- Status (Active/Inactive)
- Action buttons (Edit, Toggle Status, Delete)

### User Roles

**Student:**
- Can take assigned exams
- View exam results
- Download certificates
- Upload profile picture

**Teacher:**
- Create and manage exams
- Add questions to exams
- Monitor student progress
- Grade subjective answers
- View real-time exam monitoring

**Admin:**
- Full system access
- Create/edit/delete users
- Approve/reject exams
- Manage departments, courses, subjects
- Send announcements
- View system statistics

### Dashboard Statistics
The admin dashboard shows:
- **Total Users**: Count of all users in system
- **Total Exams**: Count of all exams
- **Pending Approvals**: Exams waiting for approval
- **Active Students**: Currently active student accounts

## Other Admin Features

### Tab Navigation
1. **Users**: User management (create, edit, delete)
2. **Exams**: Approve/reject teacher-created exams
3. **Departments**: Create and manage departments
4. **Courses**: Create and manage courses
5. **Subjects**: Create and manage subjects
6. **Announcements**: Send notifications to users

### Create Department
1. Go to **Departments** tab
2. Click **"Add Department"**
3. Enter:
   - Department Name (e.g., "Computer Science")
   - Department Code (e.g., "CS")
4. Click **"Create"**

### Create Course
1. Go to **Courses** tab
2. Click **"Add Course"**
3. Enter:
   - Course Name (e.g., "B.Tech Computer Science")
   - Course Code (e.g., "BTECH-CS")
   - Select Department from dropdown
4. Click **"Create"**

### Create Subject
1. Go to **Subjects** tab
2. Click **"Add Subject"**
3. Enter:
   - Subject Name (e.g., "Data Structures")
   - Subject Code (e.g., "CS101")
   - Select Course from dropdown
   - Select Teacher from dropdown
4. Click **"Create"**

### Send Announcement
1. Go to **Announcements** tab
2. Click **"Create Announcement"**
3. Enter:
   - Title
   - Content (message)
   - Target Role (All, Students, Teachers, or Admins)
4. Click **"Send"**

## Tips

- **Username must be unique** - You'll get an error if username already exists
- **Email must be valid** - System validates email format
- **Password requirements** - Use strong passwords for security
- **Deactivate instead of delete** - Consider deactivating users instead of deleting to preserve data
- **Role assignment** - Assign appropriate roles based on user responsibilities
- **Department field** - Optional but useful for organizing users

## Troubleshooting

### "Username already exists"
- Choose a different username
- Check if user was previously created

### "Email already exists"
- Each email can only be used once
- Use a different email address

### "Error creating user"
- Check all required fields are filled
- Ensure password meets requirements
- Verify email format is correct

### User not appearing in list
- Refresh the page
- Check if user was created successfully
- Look for success/error message

## Sample Test Users

The system comes with pre-created test accounts:

**Admin:**
- admin / admin123

**Teachers:**
- teacher1 / teacher123
- teacher2 / teacher123

**Students:**
- student1 / student123
- student2 / student123
- student3 / student123
- student4 / student123
- student5 / student123

You can create additional users as needed!
