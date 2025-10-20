import uuid
from django.db import models
from django.utils import timezone
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin

# ----------------------------
# Custom User
# ----------------------------
class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Users must have an email address")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('role', 'admin')
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    role = models.CharField(
        max_length=50,
        choices=[('admin','admin'),('examiner','examiner'),('student','student'),('staff','staff')]
    )
    status = models.CharField(
        max_length=50,
        choices=[('active','active'),('inactive','inactive'),('suspended','suspended')],
        default='active'
    )
    created_at = models.DateTimeField(default=timezone.now)
    last_login = models.DateTimeField(null=True)
    reset_token = models.CharField(max_length=255, null=True, blank=True)
    reset_token_expiry = models.DateTimeField(null=True, blank=True)
    is_staff = models.BooleanField(default=False)

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["first_name", "last_name", "role"]

    def __str__(self):
        return self.email


# ----------------------------
# Exam model
# ----------------------------
class Exam(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    duration = models.IntegerField(help_text="Duration in minutes")
    start_time = models.DateTimeField()
    created_by = models.ForeignKey('api.User', on_delete=models.CASCADE, related_name='exams')
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return self.title


# ----------------------------
# Question model
# ----------------------------
class Question(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE, related_name='questions')
    text = models.TextField()
    marks = models.IntegerField(default=1)

    def __str__(self):
        return self.text


# ----------------------------
# Result model
# ----------------------------
class Result(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE, related_name='results')
    student = models.ForeignKey('api.User', on_delete=models.CASCADE, related_name='results')
    score = models.FloatField(default=0)
    submitted_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.student.email} - {self.exam.title}"
