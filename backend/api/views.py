# api/views.py
from django.contrib.auth import authenticate
from django.contrib.auth.hashers import make_password
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import CustomUser, Exam, Question, ExamAssignment
from .serializers import CustomUserSerializer, ExamSerializer, QuestionSerializer, ExamAssignmentSerializer
import json

# -------------------- USER VIEWS --------------------
@csrf_exempt
def register_view(request):
    if request.method == "POST":
        data = json.loads(request.body)
        username = data.get("username")
        email = data.get("email")
        password = data.get("password")
        role = data.get("role", "student")

        if not username or not email or not password:
            return JsonResponse({"success": False, "error": "All fields are required"})

        if CustomUser.objects.filter(username=username).exists():
            return JsonResponse({"success": False, "error": "Username already exists"})

        user = CustomUser.objects.create(
            username=username,
            email=email,
            password=make_password(password),
            role=role,
        )
        return JsonResponse({"success": True, "message": "User registered successfully"})

    return JsonResponse({"success": False, "error": "Invalid request method"})


@csrf_exempt
def login_view(request):
    if request.method == "POST":
        data = json.loads(request.body)
        username = data.get("username")
        password = data.get("password")

        if not username or not password:
            return JsonResponse({"success": False, "error": "Username and password required"})

        user = authenticate(username=username, password=password)
        if user:
            return JsonResponse({"success": True, "role": user.role})
        else:
            return JsonResponse({"success": False, "error": "Invalid credentials"})

    return JsonResponse({"success": False, "error": "Invalid request method"})


# Users CRUD API using DRF
@api_view(['GET', 'POST'])
def user_list_create(request):
    if request.method == 'GET':
        users = CustomUser.objects.all()
        serializer = CustomUserSerializer(users, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        serializer = CustomUserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(password=make_password(request.data.get("password", "")))
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

@api_view(['GET', 'PUT', 'DELETE'])
def user_detail_update_delete(request, user_id):
    try:
        user = CustomUser.objects.get(id=user_id)
    except CustomUser.DoesNotExist:
        return Response({"error": "User not found"}, status=404)

    if request.method == 'GET':
        serializer = CustomUserSerializer(user)
        return Response(serializer.data)
    elif request.method == 'PUT':
        serializer = CustomUserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
    elif request.method == 'DELETE':
        user.delete()
        return Response({"message": "User deleted"}, status=204)


# -------------------- EXAM VIEWS --------------------
@api_view(['GET', 'POST'])
def exam_list_create(request):
    if request.method == 'GET':
        exams = Exam.objects.all()
        serializer = ExamSerializer(exams, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        serializer = ExamSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

@api_view(['GET', 'PUT', 'DELETE'])
def exam_detail_update_delete(request, exam_id):
    try:
        exam = Exam.objects.get(id=exam_id)
    except Exam.DoesNotExist:
        return Response({"error": "Exam not found"}, status=404)

    if request.method == 'GET':
        serializer = ExamSerializer(exam)
        return Response(serializer.data)
    elif request.method == 'PUT':
        serializer = ExamSerializer(exam, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
    elif request.method == 'DELETE':
        exam.delete()
        return Response({"message": "Exam deleted"}, status=204)


# -------------------- QUESTION VIEWS --------------------
@api_view(['GET', 'POST'])
def question_list_create(request):
    if request.method == 'GET':
        questions = Question.objects.all()
        serializer = QuestionSerializer(questions, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        serializer = QuestionSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

@api_view(['GET', 'PUT', 'DELETE'])
def question_detail_update_delete(request, question_id):
    try:
        question = Question.objects.get(id=question_id)
    except Question.DoesNotExist:
        return Response({"error": "Question not found"}, status=404)

    if request.method == 'GET':
        serializer = QuestionSerializer(question)
        return Response(serializer.data)
    elif request.method == 'PUT':
        serializer = QuestionSerializer(question, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
    elif request.method == 'DELETE':
        question.delete()
        return Response({"message": "Question deleted"}, status=204)


# -------------------- EXAM ASSIGNMENTS --------------------
@api_view(['GET', 'POST'])
def assignment_list_create(request):
    if request.method == 'GET':
        assignments = ExamAssignment.objects.all()
        serializer = ExamAssignmentSerializer(assignments, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        serializer = ExamAssignmentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

@api_view(['GET', 'PUT', 'DELETE'])
def assignment_detail_update_delete(request, assignment_id):
    try:
        assignment = ExamAssignment.objects.get(id=assignment_id)
    except ExamAssignment.DoesNotExist:
        return Response({"error": "Assignment not found"}, status=404)

    if request.method == 'GET':
        serializer = ExamAssignmentSerializer(assignment)
        return Response(serializer.data)
    elif request.method == 'PUT':
        serializer = ExamAssignmentSerializer(assignment, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
    elif request.method == 'DELETE':
        assignment.delete()
        return Response({"message": "Assignment deleted"}, status=204)
