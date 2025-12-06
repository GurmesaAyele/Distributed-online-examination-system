import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'exam_platform.settings')
django.setup()

exec(open('create_sample_data.py').read())
