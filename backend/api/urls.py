from django.urls import path
from .views import hello, login_view, register_view

urlpatterns = [
    path('hello/', hello),
    path('login/', login_view),
    path('register/', register_view),
]
