from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'departments', DepartmentViewSet)
router.register(r'courses', CourseViewSet)
router.register(r'subjects', SubjectViewSet)
router.register(r'exams', ExamViewSet)
router.register(r'questions', QuestionViewSet)
router.register(r'assignments', ExamAssignmentViewSet)
router.register(r'attempts', ExamAttemptViewSet)
router.register(r'notifications', NotificationViewSet)
router.register(r'announcements', AnnouncementViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('auth/register/', register, name='register'),
    path('auth/login/', login, name='login'),
    path('system-settings/', system_settings_view, name='system-settings'),
    path('system-settings/upload_logo/', upload_system_logo, name='upload-system-logo'),
]
