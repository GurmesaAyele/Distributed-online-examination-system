from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ExamViewSet, QuestionViewSet, ResultViewSet, login_view

router = DefaultRouter()
router.register(r'exams', ExamViewSet)
router.register(r'questions', QuestionViewSet)
router.register(r'results', ResultViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('login/', login_view, name='login'),
]
