from django.urls import path
from django.urls.conf import include
from .views import  UserRegisterView, UserLoginView
from rest_framework import routers


router = routers.DefaultRouter()


urlpatterns = [
    path('auth/register', UserRegisterView.as_view()),
    path('auth/login', UserLoginView.as_view()),
    path('auth/logout', UserLoginView.as_view()),
    path('', include(router.urls)),
]
