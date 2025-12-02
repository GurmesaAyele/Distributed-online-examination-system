from rest_framework import serializers
from .models import CustomUser, Exam, Question, ExamAssignment

class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = '__all__'

class ExamSerializer(serializers.ModelSerializer):
    class Meta:
        model = Exam
        fields = '__all__'

class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = '__all__'

class ExamAssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExamAssignment
        fields = '__all__'
