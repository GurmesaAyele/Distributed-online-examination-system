from django.db import models
from accounts.models import User

class Exam(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    examiner = models.ForeignKey(User, on_delete=models.CASCADE, related_name="created_exams")
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    total_marks = models.IntegerField(default=100)

    def __str__(self):
        return self.title


class Question(models.Model):
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE, related_name="questions")
    text = models.TextField()
    option_a = models.CharField(max_length=255)
    option_b = models.CharField(max_length=255)
    option_c = models.CharField(max_length=255)
    option_d = models.CharField(max_length=255)
    correct_option = models.CharField(max_length=1, choices=[('A', 'A'), ('B', 'B'), ('C', 'C'), ('D', 'D')])

    def __str__(self):
        return f"Q: {self.text[:30]}..."


class Submission(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name="submissions")
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE, related_name="submissions")
    answers = models.JSONField()
    score = models.FloatField(default=0)
    submitted_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.student.username} - {self.exam.title}"


class Result(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE)
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE)
    marks_obtained = models.FloatField()
    remarks = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return f"{self.student.username} - {self.exam.title}: {self.marks_obtained}"
