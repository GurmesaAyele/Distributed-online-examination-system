from django.urls import path
from .views import (
    register_view, login_view, user_list_create, user_detail_update_delete,
    exam_list_create, exam_detail_update_delete,
    question_list_create, question_detail_update_delete,
    assignment_list_create, assignment_detail_update_delete
)

urlpatterns = [
    # Users
    path("register/", register_view),
    path("login/", login_view),
    path("users/", user_list_create),
    path("users/<int:user_id>/", user_detail_update_delete),
    

    # Exams
    path("exams/", exam_list_create),
    path("exams/<int:exam_id>/", exam_detail_update_delete),

    # Questions
    path("questions/", question_list_create),
    path("questions/<int:question_id>/", question_detail_update_delete),

    # Assignments
    path("assignments/", assignment_list_create),
    path("assignments/<int:assignment_id>/", assignment_detail_update_delete),
]
