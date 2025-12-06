# Database Setup for WAMP Users

## Step-by-Step Instructions

### 1. Start WAMP Server
- Make sure WAMP icon is **GREEN** (not orange or red)
- If orange/red, click the icon and start all services

### 2. Open phpMyAdmin
- Click WAMP icon in system tray
- Select **phpMyAdmin**
- Or open browser and go to: `http://localhost/phpmyadmin`

### 3. Create Database
1. Click on **"Databases"** tab at the top
2. In "Create database" section:
   - Database name: `exam_platform`
   - Collation: Select `utf8mb4_unicode_ci` from dropdown
3. Click **"Create"** button

### 4. Verify Database Created
- You should see `exam_platform` in the left sidebar
- Click on it to select it

### 5. Update Django Settings
Open `backend/exam_platform/settings.py` and update the database configuration:

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'exam_platform',
        'USER': 'root',           # WAMP default username
        'PASSWORD': '',           # WAMP default password (empty)
        'HOST': 'localhost',
        'PORT': '3306',
    }
}
```

**Note:** WAMP's default MySQL credentials are:
- Username: `root`
- Password: `` (empty/blank)

### 6. Install Python Dependencies
Open Command Prompt in the project directory:

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

### 7. Create Database Tables
```bash
python manage.py makemigrations
python manage.py migrate
```

### 8. Create Admin User
```bash
python manage.py createsuperuser
```
Follow the prompts to create your admin account.

### 9. Run Django Server
```bash
python manage.py runserver
```

The backend will be available at: `http://localhost:8000`

### 10. Setup Frontend
Open a new Command Prompt:

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at: `http://localhost:5173`

## Troubleshooting

### WAMP Icon is Orange/Red
- Click WAMP icon → MySQL → Service → Start/Resume Service
- Or restart all services

### Can't Access phpMyAdmin
- Check if Apache is running (WAMP icon should be green)
- Try: `http://127.0.0.1/phpmyadmin`

### MySQL Connection Error in Django
- Verify WAMP MySQL is running
- Check port 3306 is not blocked
- Ensure credentials in settings.py match WAMP defaults

### Port 3306 Already in Use
- Another MySQL instance might be running
- Stop other MySQL services or change WAMP MySQL port

## Quick Access URLs
- phpMyAdmin: `http://localhost/phpmyadmin`
- Django Backend: `http://localhost:8000`
- Django Admin: `http://localhost:8000/admin`
- React Frontend: `http://localhost:5173`
