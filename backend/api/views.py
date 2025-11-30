from django.http import JsonResponse
from django.contrib.auth import authenticate, get_user_model
from django.views.decorators.csrf import csrf_exempt
import json

User = get_user_model()

# Simple hello endpoint
def hello(request):
    return JsonResponse({"message": "Hello from Django API!"})

# Login endpoint
@csrf_exempt
def login_view(request):
    if request.method != "POST":
        return JsonResponse({"success": False, "error": "Only POST allowed"}, status=405)

    try:
        data = json.loads(request.body)
        email = data.get("username")
        password = data.get("password")

        if not email or not password:
            return JsonResponse({"success": False, "error": "Email and password required"}, status=400)

        try:
            user_obj = User.objects.get(email=email)
        except User.DoesNotExist:
            return JsonResponse({"success": False, "error": "Invalid credentials"}, status=401)

        user = authenticate(username=user_obj.username, password=password)
        if user:
            role = getattr(user, "role", "student")
            return JsonResponse({"success": True, "role": role})
        else:
            return JsonResponse({"success": False, "error": "Invalid credentials"}, status=401)

    except Exception as e:
        print("Login error:", e)
        return JsonResponse({"success": False, "error": "Server error. Please try again later."}, status=500)

# Register endpoint
@csrf_exempt
def register_view(request):
    if request.method != "POST":
        return JsonResponse({"success": False, "error": "Only POST allowed"}, status=405)

    try:
        data = json.loads(request.body)
        email = data.get("email")
        password = data.get("password")
        role = data.get("role", "student")

        if not email or not password or not role:
            return JsonResponse({"success": False, "error": "All fields are required"}, status=400)

        if User.objects.filter(email=email).exists():
            return JsonResponse({"success": False, "error": "Email already exists"}, status=400)

        user = User.objects.create_user(username=email, email=email, password=password)
        setattr(user, "role", role)
        user.save()

        return JsonResponse({"success": True})

    except Exception as e:
        print("Register error:", e)
        return JsonResponse({"success": False, "error": "Server error. Please try again later."}, status=500)
