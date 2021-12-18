from django.contrib.auth import authenticate
from django.contrib.auth.hashers import make_password
from django.http import JsonResponse
from rest_framework import status, viewsets
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import *
from django.db import models
from .serializers import UserSerializer, UserLoginSerializer, JobSerializer
from django.conf import settings
from .utils import *
import uuid
from azure.storage.blob import BlockBlobService
from azure.storage.blob.models import ContentSettings

ACCOUNT_NAME = 'crolab'
ACCOUNT_KEY = 'dZSWtRqd7Yq3RPtF4JHrVsx3OFwlS27xPaEOff23R1CjGlqdQ3gMozuNQ0ZqUMMJ/cjFLA5fCrh311n2ug6UdQ=='
MEDIA_CONTAINER = 'media'
STATIC_CONTAINER = 'static'
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
                'message': 'Register successfully!'
            }, status=status.HTTP_201_CREATED)

        else:
            return JsonResponse({
                'message': 'This email has already exist!'
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
                'message': 'Email or password is incorrect!'
            }, status=status.HTTP_400_BAD_REQUEST)

        return Response({
            'message': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class UserLogoutView(APIView):
    @staticmethod
    def post():
        return Response({
            'message': 'Logout successfully!'
        }, status=status.HTTP_200_OK)


class JobViewSet(viewsets.ModelViewSet):
    queryset = Job.objects.all()
    serializer_class = JobSerializer
    pagination_class = PageNumberPagination

    @auth
    def create(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            try:
                for _, audio_file in enumerate(request.FILES.getlist("audio_files")):
                    filename = audio_file.name
                    file_upload_name = str(uuid.uuid4()) + filename
                    blob_service_client = BlockBlobService(
                        account_name=ACCOUNT_NAME,
                        account_key=ACCOUNT_KEY,
                    )
                    blob_service_client.create_blob_from_bytes(
                        container_name=MEDIA_CONTAINER,
                        blob_name=file_upload_name,
                        blob=audio_file.read(),
                        content_settings = ContentSettings(
                            content_type='audio/wav', 
                            content_disposition='inline'
                        )
                    )
            except Exception as e:
                return Response({
                    'result': 503,
                    'message': "Tải lên dữ liệu thất bại",
                    'logs': str(e)
                }, status.HTTP_503_SERVICE_UNAVAILABLE)


            user = User.objects.filter(email=request.user).first()
            job = serializer.save(requester=user)


            return Response(job.to_dict(), status.HTTP_201_CREATED)
        else:
            return Response({
                'errors': serializer.errors
            }, status.HTTP_400_BAD_REQUEST)

    @auth
    def list(self, request):
        # TODO: order by created/updated time
        query_set = self.queryset.filter(
            unit_qty__gt=models.F('accepted_qty')).order_by('unit_wage')
        paginator = self.paginate_queryset(query_set)
        result = []
        for job in paginator:
            result.append(job.to_dict())
        return Response({
            'results': result
        }, status.HTTP_200_OK)
