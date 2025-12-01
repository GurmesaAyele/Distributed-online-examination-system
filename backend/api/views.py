# api/views.py
from django.contrib.auth import authenticate
from django.contrib.auth.hashers import make_password
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from .models import CustomUser

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
