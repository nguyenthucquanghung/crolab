from django.contrib.auth import authenticate
from django.contrib.auth.hashers import make_password
from django.http import JsonResponse
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import *
from .serializers import UserSerializer, UserLoginSerializer
from django.conf import settings
from .utils import *


# Create your views here.


class UserRegisterView(APIView):
    @staticmethod
    def post(request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.validated_data['password'] = make_password(
                serializer.validated_data['password'])
            serializer.save()

            return JsonResponse({
                'message': 'Register successfully!',
                'result': 201
            }, status=status.HTTP_201_CREATED)

        else:
            return JsonResponse({
                'message': 'This email has already exist!',
                'result': 400,
            }, status=status.HTTP_400_BAD_REQUEST)


class UserLoginView(APIView):
    @staticmethod
    def post(request):
        serializer = UserLoginSerializer(data=request.data)
        if serializer.is_valid():
            user = authenticate(
                request,
                username=serializer.validated_data['email'],
                password=serializer.validated_data['password']
            )
            if user:
                refresh = TokenObtainPairSerializer.get_token(user)
                data = {
                    'message': 'Login successfully!',
                    'result': 201,
                    'email': str(user),
                    'user_id': int(user.id),
                    'refresh_token': str(refresh),
                    'access_token': str(refresh.access_token),
                    'access_expires': int(settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'].total_seconds()),
                    'refresh_expires': int(settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'].total_seconds())
                }
                return Response(data, status=status.HTTP_200_OK)

            return Response({
                'message': 'Email or password is incorrect!',
                'result': 400
            }, status=status.HTTP_400_BAD_REQUEST)

        return Response({
            'message': serializer.errors,
            'result': 400
        }, status=status.HTTP_400_BAD_REQUEST)


class UserLogoutView(APIView):
    @staticmethod
    def post():
        return Response({
            'message': 'Logout successfully!',
            'result': 200
        }, status=status.HTTP_200_OK)