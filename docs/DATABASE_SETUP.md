# Database Setup Guide

## Prerequisites
- MySQL Server installed and running
- MySQL credentials (username/password)

## Option 1: Using the Batch Script (Recommended)

1. Double-click `setup_database.bat`
2. Follow the prompts:
   - Enter MySQL bin path (e.g., `C:\Program Files\MySQL\MySQL Server 8.0\bin`) or press Enter if MySQL is in PATH
   - Enter MySQL username (default: root)
   - Enter MySQL password when prompted
3. The script will create the database automatically

## Option 2: Manual Setup via MySQL Command Line

1. Open MySQL Command Line Client or any MySQL client
2. Login with your credentials
3. Run the following commands:

```sql
CREATE DATABASE IF NOT EXISTS exam_platform 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE exam_platform;
```

## Option 3: Using MySQL Workbench

1. Open MySQL Workbench
2. Connect to your MySQL server
3. Click on "Create a new schema" button
4. Name it: `exam_platform`
5. Character Set: `utf8mb4`
6. Collation: `utf8mb4_unicode_ci`
7. Click Apply

## Option 4: Using phpMyAdmin

1. Open phpMyAdmin in your browser
2. Click on "Databases" tab
3. Enter database name: `exam_platform`
4. Select collation: `utf8mb4_unicode_ci`
5. Click "Create"

## Verify Database Creation

Run this command in MySQL:
```sql
SHOW DATABASES LIKE 'exam_platform';
```

## Update Django Settings

After creating the database, update `backend/exam_platform/settings.py`:

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'exam_platform',
        'USER': 'your_mysql_username',      # Change this
        'PASSWORD': 'your_mysql_password',  # Change this
        'HOST': 'localhost',
        'PORT': '3306',
    }
}
```

## Next Steps

After database creation:

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Create virtual environment:
   ```bash
   python -m venv venv
   ```

3. Activate virtual environment:
   ```bash
   venv\Scripts\activate
   ```

4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

5. Create database tables:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

6. Create admin user:
   ```bash
   python manage.py createsuperuser
   ```

7. Run the server:
   ```bash
   python manage.py runserver
   ```

## Troubleshooting

### MySQL not found
- Add MySQL bin directory to system PATH
- Or provide full path to mysql.exe in the batch script

### Access denied
- Check username and password
- Ensure MySQL user has CREATE DATABASE privileges

### Connection refused
- Ensure MySQL service is running
- Check if MySQL is listening on port 3306

### Character set issues
- MySQL 5.7+ supports utf8mb4 by default
- For older versions, you may need to configure my.ini/my.cnf
