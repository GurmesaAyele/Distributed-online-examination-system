# Quick Test Guide - Admin User Creation

## 🚀 Quick Start (5 Minutes)

### 1. Open the Application
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8000`

### 2. Login as Admin
```
Username: admin
Password: admin123
```

### 3. Create a New User (Step-by-Step)

**You should see:**
- Admin Dashboard with statistics cards
- Users tab (already selected)
- List of existing users
- "Add User" button in top right

**Click "Add User" button**

**Fill in the form:**
```
Username: testuser1
Email: testuser1@example.com
First Name: Test
Last Name: User
Password: test123456
Department: Computer Science
Role: Student (or Teacher/Admin)
Active: ✓ (checked)
```

**Click "Create" button**

**Expected Result:**
- Success message: "User created successfully!"
- Dialog closes
- New user appears in the users table
- Form resets for next user

### 4. Edit a User

**In the users table:**
- Find the user you just created
- Click the **Edit** icon (pencil icon)

**Modify details:**
- Change First Name to "Updated"
- Leave password blank (keeps current password)
- Click "Update"

**Expected Result:**
- Success message: "User updated successfully!"
- Changes reflected in the table

### 5. Toggle User Status

**In the users table:**
- Click the status icon (checkmark/cancel icon)
- User status changes from Active to Inactive (or vice versa)
- Chip color changes accordingly

### 6. Test Other Features

**Create a Department:**
1. Click "Departments" tab
2. Click "Add Department"
3. Name: "Engineering", Code: "ENG"
4. Click "Create"

**Approve an Exam:**
1. Click "Exams" tab
2. Find exams with "pending" status
3. Click "Approve" or "Reject"

**Send Announcement:**
1. Click "Announcements" tab
2. Click "Create Announcement"
3. Fill in title and content
4. Select target role
5. Click "Send"

## ✅ What You Should See

### Dashboard Statistics (Top Cards)
- Total Users: 11 (after creating 1 new user)
- Total Exams: 1
- Pending Approvals: 0
- Active Students: 6 (if you created a student)

### Users Table Columns
| Username | Name | Email | Role | Status | Actions |
|----------|------|-------|------|--------|---------|
| testuser1 | Test User | testuser1@example.com | student | Active | Edit/Toggle/Delete |

### Action Buttons
- 🖊️ **Edit** (blue) - Opens edit dialog
- ✓/✗ **Toggle Status** - Activate/Deactivate user
- 🗑️ **Delete** (red) - Removes user (with confirmation)

## 🎯 Testing Scenarios

### Scenario 1: Create Multiple Users
Create 3 users with different roles:
1. Student: student6 / student123
2. Teacher: teacher3 / teacher123
3. Admin: admin2 / admin123

### Scenario 2: Edit User Details
1. Edit student6
2. Change name to "John Doe"
3. Change department to "Mathematics"
4. Update password to "newpass123"

### Scenario 3: Deactivate User
1. Find student6 in table
2. Click toggle status icon
3. Verify status changes to "Inactive"
4. Try logging in as student6 (should fail)

### Scenario 4: Delete User
1. Create a test user: tempuser / temp123
2. Click delete icon
3. Confirm deletion
4. Verify user removed from table

## 🔍 Validation Tests

### Test Invalid Data

**Duplicate Username:**
- Try creating user with username "admin"
- Should show error: "Username already exists"

**Invalid Email:**
- Try email without @ symbol
- Should show validation error

**Empty Required Fields:**
- Leave username blank
- Should prevent submission

**Weak Password:**
- Try password "123"
- Should show validation error

## 📊 Expected Behavior

### Create User
- ✅ Form validation before submission
- ✅ Success message on creation
- ✅ User appears in table immediately
- ✅ Form resets after creation

### Edit User
- ✅ Form pre-filled with user data
- ✅ Username field disabled (cannot change)
- ✅ Password optional (blank = no change)
- ✅ Changes saved immediately

### Toggle Status
- ✅ Instant status change
- ✅ No page reload needed
- ✅ Visual feedback (chip color change)

### Delete User
- ✅ Confirmation dialog appears
- ✅ User removed from table
- ✅ Cannot be undone

## 🐛 Common Issues

### Issue: "Error creating user"
**Solution:** Check all required fields are filled correctly

### Issue: User not appearing
**Solution:** Refresh the page or check browser console for errors

### Issue: Cannot edit user
**Solution:** Ensure you're logged in as admin

### Issue: Changes not saving
**Solution:** Check backend server is running (http://localhost:8000)

## 🎓 Next Steps

After testing user creation:
1. Login as the newly created user
2. Test their role-specific dashboard
3. Create exams as teacher
4. Take exams as student
5. Monitor system as admin

## 📝 Notes

- All passwords are stored securely (hashed)
- Usernames are unique and cannot be changed
- Emails must be unique
- Inactive users cannot login
- Deleted users cannot be recovered
- Admin can manage all users regardless of role

## 🔗 Related Documentation

- Full Admin Guide: `ADMIN_USER_GUIDE.md`
- API Documentation: `API_DOCS.md`
- Setup Guide: `WAMP_DATABASE_SETUP.md`
- Features List: `FEATURES.md`
