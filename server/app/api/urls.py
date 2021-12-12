from django.urls import path
from django.urls.conf import include
from .views import  UserRegisterView, UserLoginView, JobViewSet, CommentViewSet, TaskViewSet
from rest_framework import routers


router = routers.DefaultRouter()
router.register(r'job', JobViewSet)
router.register(r'comment', CommentViewSet)
router.register(r'task', TaskViewSet)

urlpatterns = [
    path('auth/register', UserRegisterView.as_view()),
    path('auth/login', UserLoginView.as_view()),
    path('auth/logout', UserLoginView.as_view()),
    path('', include(router.urls)),
]
