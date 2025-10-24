from rest_framework import routers
from .views import ExamViewSet, QuestionViewSet, SubmissionViewSet, ResultViewSet

router = routers.DefaultRouter()
router.register('exams', ExamViewSet)
router.register('questions', QuestionViewSet)
router.register('submissions', SubmissionViewSet)
router.register('results', ResultViewSet)

urlpatterns = router.urls
