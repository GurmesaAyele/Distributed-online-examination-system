# User Creation Troubleshooting Guide

## Common Errors and Solutions

### Error: "Error saving user. Please check all fields."

This is a generic error. Check the browser console (F12) for more details.

**Solutions:**

1. **Check all required fields are filled:**
   - Username ✅
   - Email ✅
   - First Name ✅
   - Last Name ✅
   - Password ✅ (required for new users)
   - Role ✅

2. **Check password requirements:**
   - Minimum 8 characters
   - Cannot be too common (e.g., "password123")
   - Cannot be entirely numeric
   - Cannot be too similar to username

3. **Check username uniqueness:**
   - Username must be unique
   - Try a different username if you get "username already exists"

4. **Check email format:**
   - Must be valid email (e.g., user@example.com)
   - Must be unique

### Error: "Password is required for new users"

**Solution:** Fill in the password field when creating a new user.

### Error: "Username already exists"

**Solution:** Choose a different username. Each username must be unique.

### Error: "Email already exists"

**Solution:** Use a different email address. Each email must be unique.

### Error: "This password is too short"

**Solution:** Use a password with at least 8 characters.

### Error: "This password is too common"

**Solution:** Avoid common passwords like:
- password
- 12345678
- qwerty
- admin123 (for non-admin users)

### Error: "Permission denied" or "Only admins can create users"

**Solution:** 
- Make sure you're logged in as admin
- Check your role in the top right corner
- If not admin, logout and login with admin credentials

## Testing Steps

### 1. Open Browser Console
- Press F12
- Go to Console tab
- Try creating a user
- Check for error messages

### 2. Check Network Tab
- Press F12
- Go to Network tab
- Try creating a user
- Click on the failed request
- Check Response tab for detailed error

### 3. Verify Backend is Running
- Check `http://localhost:8000/api/users/` in browser
- Should show JSON response (not error page)

### 4. Test with Valid Data

Try this exact data:
```
Username: testuser123
Email: testuser123@example.com
First Name: Test
Last Name: User
Password: SecurePass123!
Role: Student
Department: Computer Science
Active: ✓
```

## Quick Fixes

### Fix 1: Restart Backend Server
```bash
# Stop the backend (Ctrl+C in terminal)
cd backend
venv\Scripts\activate
python manage.py runserver
```

### Fix 2: Clear Browser Cache
- Press Ctrl+Shift+Delete
- Clear cached images and files
- Reload page (Ctrl+F5)

### Fix 3: Check Database Connection
- Open phpMyAdmin
- Check if `exam_platform` database exists
- Check if `api_user` table exists

### Fix 4: Verify Admin Login
```
Username: admin
Password: admin123
```

## Detailed Error Messages

Now the system shows detailed error messages. Check the alert for:

- **Username errors**: "A user with that username already exists"
- **Email errors**: "Enter a valid email address"
- **Password errors**: Specific password validation messages
- **Permission errors**: "Only admins can create users"

## Still Having Issues?

### Check Backend Logs
Look at the terminal where backend is running for error messages.

### Check Frontend Console
Press F12 and look for red error messages in Console tab.

### Verify API Endpoint
Test the API directly:
1. Open `test_user_creation.html` in browser
2. Click "Test Create User" button
3. Check the response

### Common Issues

**Issue**: Form submits but nothing happens
**Solution**: Check browser console for JavaScript errors

**Issue**: "Network Error"
**Solution**: Backend server is not running or wrong URL

**Issue**: "401 Unauthorized"
**Solution**: Token expired, logout and login again

**Issue**: "403 Forbidden"
**Solution**: Not logged in as admin

**Issue**: "500 Internal Server Error"
**Solution**: Check backend terminal for Python errors

## Success Indicators

When user creation works correctly:
1. ✅ Alert shows "User created successfully!"
2. ✅ Dialog closes automatically
3. ✅ New user appears in the table
4. ✅ Form resets to empty
5. ✅ No errors in console

## Test Checklist

- [ ] Backend server running (http://localhost:8000)
- [ ] Frontend server running (http://localhost:5173)
- [ ] Logged in as admin
- [ ] All required fields filled
- [ ] Password meets requirements
- [ ] Username is unique
- [ ] Email is valid and unique
- [ ] Browser console shows no errors

## Contact Information

If you still have issues:
1. Check backend terminal for Python errors
2. Check browser console (F12) for JavaScript errors
3. Verify database connection in phpMyAdmin
4. Try creating user via Django admin panel (http://localhost:8000/admin)
