from django.contrib.auth import authenticate
from django.contrib.auth.hashers import make_password
from django.http import JsonResponse
from rest_framework import status, viewsets
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import *
from django.db import models
from .serializers import UserSerializer, UserLoginSerializer, JobSerializer, CommentSerializer, TaskSerializer
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
                    'message': 'Đăng nhập thành công!',
                    'result': 201,
                    'email': str(user),
                    'user_id': int(user.id),
                    'full_name': str(user.full_name),
                    'role': int(user.role),
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
        query_set = self.queryset.filter(unit_qty__gt=models.F('accepted_qty')).order_by('-updated_at')

        paginator = self.paginate_queryset(query_set)
        result = []
        for job in paginator:
            result.append(job.to_dict())
        # TODO: pagination info
        return Response({
            'results': result
        }, status.HTTP_200_OK)

    # TODO: Job retrieve

    @is_job_requester
    def update(self, request, pk=None):
        try:
            job = Job.objects.filter(pk=pk).first()
            update_model(job, request.data, ['description', 'category', 'name', 'unit_qty', 'truth_qty', 'shared_qty',
                                            'min_qty', 'unit_wage', 'unit_bonus', 'accept_threshold', 'bonus_threshold'])
            return Response(job.to_dict(), status.HTTP_201_CREATED)
        except Exception as e:
            return Response({
                'errors': str(e)
            }, status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['GET'])
    @auth
    def comment(self, request, pk=None):
        job = self.queryset.filter(pk=pk).first()
        if job is None:
            return Response({
                'errors': 'Job not found'
            }, status.HTTP_404_NOT_FOUND)
        comments = Comment.objects.filter(job=job).order_by('-created_at')
        paginator = self.paginate_queryset(comments)
        result = []
        for comment in paginator:
            result.append(comment.to_dict())
        # TODO: Pagination Info
        return Response({
            'results': result
        }, status.HTTP_200_OK)


class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer

    @auth
    def create(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            if request.data.get('job_id') is None:
                return Response({
                    'errors': 'job_id is required'
                }, status.HTTP_400_BAD_REQUEST)
            job = Job.objects.filter(pk=request.data['job_id']).first()
            if job is None:
                return Response({
                    'errors': 'Job is not exist'
                }, status.HTTP_404_NOT_FOUND)
            user = User.objects.filter(email=request.user).first()
            Comment.objects.create(job=job, content=request.data['content'], user=user)
            return Response({}, status.HTTP_201_CREATED)
        return Response({
            'errors': serializer.errors
        }, status.HTTP_400_BAD_REQUEST)


class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer

    @auth
    def create(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            if request.data.get('job_id') is None:
                return Response({
                    'errors': 'job_id is required'
                }, status.HTTP_400_BAD_REQUEST)
            job = Job.objects.filter(pk=request.data['job_id']).first()
            if job is None:
                return Response({
                    'errors': 'Job is not exist'
                }, status.HTTP_404_NOT_FOUND)
            unit_qty = request.data['unit_qty']
            min_qty = job.min_qty
            max_qty = job.unit_qty - job.accepted_qty
            if unit_qty > max_qty or unit_qty < min_qty:
                return Response({
                    'errors': 'unit_qty should be in range ' + str(min_qty) + ' and ' + str(max_qty)
                }, status.HTTP_400_BAD_REQUEST)
            if (max_qty - unit_qty) < min_qty:
                return Response({
                    'errors': 'remaining qty must be higher or equal to ' + str(min_qty)
                }, status.HTTP_400_BAD_REQUEST)
            user = User.objects.filter(email=request.user).first()
            task = Task.objects.create(job=job, annotator=user, unit_qty=unit_qty)
            return Response(task.to_dict(), status.HTTP_201_CREATED)
        else:
            return Response({
                'errors': serializer.errors
            }, status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['PUT'])
    @is_task_requester
    def accept_task(self, request, pk=None):
        task = self.queryset.filter(pk=pk).first()
        if task.accepted:
            return Response({
                'errors': 'Task has been accepted'
            }, status.HTTP_400_BAD_REQUEST)
        job = task.job
        remain_qty = job.unit_qty - job.accepted_qty
        # qty check
        if remain_qty < task.unit_qty:
            return Response({
                'errors': 'Job only has ' + str(remain_qty) + ' left'
            }, status.HTTP_400_BAD_REQUEST)
        if task.unit_qty < job.min_qty:
            return Response({
                'errors': 'unit_qty must be higher or equal to ' + str(job.min_qty)
            }, status.HTTP_400_BAD_REQUEST)
        if (job.unit_qty - job.accepted_qty - task.unit_qty) < job.min_qty:
            return Response({
                'errors': 'remaining qty must be higher or equal to ' + str(job.min_qty)
            }, status.HTTP_400_BAD_REQUEST)
        # save qty to job
        job.accepted_qty = job.accepted_qty + task.unit_qty
        job.save()
        task.accepted = True
        task.save()
        return Response(task.to_dict(), status.HTTP_201_CREATED)

    @action(detail=True, methods=['PUT'])
    @is_task_requester
    def reject_task(self, request, pk=None):
        task = self.queryset.filter(pk=pk).first()
        if task.rejected:
            return Response({
                'errors': 'Task has been rejected'
            }, status.HTTP_400_BAD_REQUEST)
        job = task.job
        job.accepted_qty = job.accepted_qty - task.unit_qty
        job.save()
        task.rejected = True
        task.save()
        return Response(task.to_dict(), status.HTTP_201_CREATED)

    @action(detail=True, methods=['PUT'])
    @is_task_requester
    def set_task_passed(self, request, pk=None):
        task = self.queryset.filter(pk=pk).first()
        task.passed = True
        task.save()
        return Response(task.to_dict(), status.HTTP_201_CREATED)
