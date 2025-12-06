from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone

class User(AbstractUser):
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('teacher', 'Teacher'),
        ('student', 'Student'),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='student')
    profile_picture = models.ImageField(upload_to='profiles/', null=True, blank=True)
    department = models.CharField(max_length=100, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.username} ({self.role})"


class Department(models.Model):
    name = models.CharField(max_length=100, unique=True)
    code = models.CharField(max_length=20, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Course(models.Model):
    name = models.CharField(max_length=200)
    code = models.CharField(max_length=20, unique=True)
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='courses')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.code} - {self.name}"


class Subject(models.Model):
    name = models.CharField(max_length=200)
    code = models.CharField(max_length=20, unique=True)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='subjects')
    teacher = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='subjects_taught')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.code} - {self.name}"


class Exam(models.Model):
    STATUS_CHOICES = (
        ('draft', 'Draft'),
        ('pending', 'Pending Approval'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('active', 'Active'),
        ('completed', 'Completed'),
    )
    
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='exams')
    teacher = models.ForeignKey(User, on_delete=models.CASCADE, related_name='exams_created')
    
    # Optional department and course (can be from existing or custom text)
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True, related_name='exams')
    course = models.ForeignKey(Course, on_delete=models.SET_NULL, null=True, blank=True, related_name='exams')
    custom_department = models.CharField(max_length=200, blank=True)
    custom_course = models.CharField(max_length=200, blank=True)
    additional_info = models.TextField(blank=True)
    
    duration_minutes = models.IntegerField()
    total_marks = models.IntegerField()
    passing_marks = models.IntegerField()
    negative_marking = models.BooleanField(default=False)
    negative_marks_per_question = models.FloatField(default=0)
    shuffle_questions = models.BooleanField(default=True)
    shuffle_options = models.BooleanField(default=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title


class Question(models.Model):
    QUESTION_TYPES = (
        ('mcq', 'Multiple Choice'),
        ('subjective', 'Subjective'),
        ('true_false', 'True/False'),
    )
    
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE, related_name='questions')
    question_text = models.TextField()
    question_type = models.CharField(max_length=20, choices=QUESTION_TYPES)
    marks = models.IntegerField()
    option_a = models.TextField(blank=True)
    option_b = models.TextField(blank=True)
    option_c = models.TextField(blank=True)
    option_d = models.TextField(blank=True)
    correct_answer = models.CharField(max_length=500)
    explanation = models.TextField(blank=True)
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.exam.title} - Q{self.order}"


class ExamAssignment(models.Model):
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE, related_name='assignments')
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='assigned_exams')
    assigned_at = models.DateTimeField(auto_now_add=True)
    is_completed = models.BooleanField(default=False)

    class Meta:
        unique_together = ('exam', 'student')

    def __str__(self):
        return f"{self.student.username} - {self.exam.title}"


class ExamAttempt(models.Model):
    STATUS_CHOICES = (
        ('in_progress', 'In Progress'),
        ('submitted', 'Submitted'),
        ('auto_submitted', 'Auto Submitted'),
        ('evaluated', 'Evaluated'),
    )
    
    assignment = models.ForeignKey(ExamAssignment, on_delete=models.CASCADE, related_name='attempts')
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='exam_attempts')
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE, related_name='attempts')
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='in_progress')
    obtained_marks = models.FloatField(null=True, blank=True)
    total_marks = models.IntegerField()
    percentage = models.FloatField(null=True, blank=True)
    tab_switch_count = models.IntegerField(default=0)
    copy_paste_count = models.IntegerField(default=0)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)

    def __str__(self):
        return f"{self.student.username} - {self.exam.title} - {self.status}"


class Answer(models.Model):
    attempt = models.ForeignKey(ExamAttempt, on_delete=models.CASCADE, related_name='answers')
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    answer_text = models.TextField()
    is_correct = models.BooleanField(null=True, blank=True)
    marks_obtained = models.FloatField(null=True, blank=True)
    teacher_feedback = models.TextField(blank=True)
    answered_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.attempt.student.username} - Q{self.question.order}"


class ViolationLog(models.Model):
    VIOLATION_TYPES = (
        ('tab_switch', 'Tab Switch'),
        ('copy_paste', 'Copy/Paste'),
        ('multiple_ip', 'Multiple IP'),
    )
    
    attempt = models.ForeignKey(ExamAttempt, on_delete=models.CASCADE, related_name='violations')
    violation_type = models.CharField(max_length=20, choices=VIOLATION_TYPES)
    timestamp = models.DateTimeField(auto_now_add=True)
    details = models.TextField(blank=True)

    def __str__(self):
        return f"{self.attempt.student.username} - {self.violation_type} - {self.timestamp}"


class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=200)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.title}"


class Announcement(models.Model):
    title = models.CharField(max_length=200)
    content = models.TextField()
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='announcements')
    target_role = models.CharField(max_length=10, choices=User.ROLE_CHOICES, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title


class SystemSettings(models.Model):
    logo = models.ImageField(upload_to='system/', null=True, blank=True)
    welcome_text = models.CharField(max_length=500, default='Welcome to Online Exam Platform')
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = 'System Settings'

    def __str__(self):
        return 'System Settings'
    
    def save(self, *args, **kwargs):
        # Ensure only one instance exists
        if not self.pk and SystemSettings.objects.exists():
            raise ValueError('Only one SystemSettings instance is allowed')
        return super().save(*args, **kwargs)
