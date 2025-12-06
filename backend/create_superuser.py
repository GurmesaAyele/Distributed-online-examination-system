import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'exam_platform.settings')
django.setup()

from api.models import User

# Create superuser if it doesn't exist
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser(
        username='admin',
        email='admin@example.com',
        password='admin123',
        first_name='Admin',
        last_name='User',
        role='admin'
    )
    print('✓ Superuser created successfully!')
    print('Username: admin')
    print('Password: admin123')
else:
    print('Superuser already exists')
