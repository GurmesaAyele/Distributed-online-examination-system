# api/models.py
from django.contrib.auth.models import AbstractUser, Group, Permission
from django.db import models
from django.conf import settings

# -------------------- Custom User --------------------
class CustomUser(AbstractUser):
    ROLE_CHOICES = (
        ("admin", "Admin"),
        ("teacher", "Teacher"),
        ("student", "Student"),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default="student")

    # Fix reverse accessor clashes
    groups = models.ManyToManyField(
        Group,
        related_name="customuser_set",
        blank=True,
        verbose_name="groups",
        help_text="The groups this user belongs to.",
    )
    user_permissions = models.ManyToManyField(
        Permission,
        related_name="customuser_set",
        blank=True,
        verbose_name="user permissions",
        help_text="Specific permissions for this user.",
    )

    def __str__(self):
        return f"{self.username} ({self.role})"


# -------------------- Exam Model --------------------
class Exam(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    duration_minutes = models.IntegerField(default=60)
    max_score = models.IntegerField(default=100)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name


# -------------------- Question Model --------------------
class Question(models.Model):
    QUESTION_TYPES = (
        ("MCQ", "Multiple Choice"),
        ("TF", "True/False"),
        ("SA", "Short Answer"),
        ("Essay", "Essay"),
    )

    exam = models.ForeignKey(Exam, on_delete=models.CASCADE, related_name="questions")
    text = models.TextField()
    question_type = models.CharField(max_length=10, choices=QUESTION_TYPES)
    options = models.JSONField(blank=True, null=True)  # For MCQs
    correct_answer = models.TextField(blank=True, null=True)
    category = models.CharField(max_length=100, blank=True)
    media_file = models.FileField(upload_to="question_media/", blank=True, null=True)

    def __str__(self):
        return f"{self.exam.name} - {self.text[:30]}"


# -------------------- Exam Assignment Model --------------------
class ExamAssignment(models.Model):
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE)
    student = models.ForeignKey(CustomUser, on_delete=models.CASCADE, limit_choices_to={"role": "student"})
    assigned_at = models.DateTimeField(auto_now_add=True)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    completed = models.BooleanField(default=False)
    score = models.FloatField(null=True, blank=True)

    def __str__(self):
        return f"{self.student.username} - {self.exam.name}"


from rest_framework import serializers
from .models import CustomUser

class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'role', 'is_active', 'profile_photo']
