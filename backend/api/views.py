from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets
from .models import Exam, Question, Result
from .serializers import ExamSerializer, QuestionSerializer, ResultSerializer

class ExamViewSet(viewsets.ModelViewSet):
    queryset = Exam.objects.all()
    serializer_class = ExamSerializer

class QuestionViewSet(viewsets.ModelViewSet):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer

class ResultViewSet(viewsets.ModelViewSet):
    queryset = Result.objects.all()
    serializer_class = ResultSerializer
