import os
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

ACCOUNT_NAME = os.environ.get('ACCOUNT_NAME')
ACCOUNT_KEY = os.environ.get('ACCOUNT_KEY')
MEDIA_CONTAINER = os.environ.get('MEDIA_CONTAINER')
STATIC_CONTAINER = os.environ.get('STATIC_CONTAINER')


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
    MIN_UNIT_QTY = 10

    @auth
    def create(self, request):
        file_list = request.FILES.getlist("audio_files")
        if len(file_list) < self.MIN_UNIT_QTY:
            return Response({
                'errors': 'minimum unit qty must be ' + str(self.MIN_UNIT_QTY)
            }, status.HTTP_400_BAD_REQUEST)
        try:
            file_names = []
            for _, audio_file in enumerate(file_list):
                filename = audio_file.name
                file_upload_name = str(uuid.uuid4()) + filename
                print(file_upload_name)
                file_names.append(file_upload_name)
                blob_service_client = BlockBlobService(
                    account_name=ACCOUNT_NAME,
                    account_key=ACCOUNT_KEY,
                )
                blob_service_client.create_blob_from_bytes(
                    container_name=MEDIA_CONTAINER,
                    blob_name=file_upload_name,
                    blob=audio_file.read(),
                    content_settings=ContentSettings(
                        content_type='audio/wav',
                        content_disposition='inline'
                    )
                )
            serializer = self.serializer_class(data=request.data)
            if serializer.is_valid():
                user = User.objects.filter(email=request.user).first()
                job = serializer.save(requester=user.id, unit_qty=len(file_names))
                units = []
                for filename in file_names:
                    units.append(Unit(job=job.id, data=filename))
                Unit.objects.bulk_create(units)

                # Create truth and shared unit
                units = Unit.objects.filter(job=job.id).order_by('?')[:job.truth_qty+job.shared_qty]
                truth_units = []
                shared_units = []
                for i in range(0, job.truth_qty):
                    truth_units.append(TruthUnit(job=job.id, data=units[i].data))
                for i in range(job.truth_qty, job.truth_qty + job.shared_qty):
                    shared_units.append(SharedUnit(job=job.id, data=units[i].data))
                TruthUnit.objects.bulk_create(truth_units)
                SharedUnit.objects.bulk_create(shared_units)

                # get truth unit data
                truth_units = TruthUnit.objects.filter(job=job.id)
                unit_data = []
                for truth_unit in truth_units:
                    unit_data.append(truth_unit.to_dict())

                return Response({
                    'job': job.to_dict(),
                    'truth_unit': unit_data
                }, status.HTTP_201_CREATED)
            else:
                return Response({
                    'errors': serializer.errors
                }, status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'errors': str(e)
            }, status.HTTP_503_SERVICE_UNAVAILABLE)

    # List available jobs for applying
    @auth
    def list(self, request):
        query_set = self.queryset.filter(unit_qty__gt=models.F('accepted_qty'), truth_qty_ready=True)\
            .order_by('-updated_at')

        paginator = PageNumberPagination()
        jobs = paginator.paginate_queryset(query_set, request)
        result = []
        for job in jobs:
            result.append(job.to_dict())
        return Response({
            'total': query_set.count(),
            'prev': paginator.get_previous_link(),
            'next': paginator.get_next_link(),
            'results': result
        }, status.HTTP_200_OK)

    # List owned job (for requester)
    @action(detail=False, methods=['GET'])
    @auth
    def list_owned_job(self, request):
        user = User.objects.filter(email=request.user).first()
        query_set = self.queryset.filter(requester=user.id).order_by('-updated_at')
        paginator = PageNumberPagination()
        jobs = paginator.paginate_queryset(query_set, request)
        result = []
        for job in jobs:
            result.append(job.to_dict())
        return Response({
            'total': query_set.count(),
            'prev': paginator.get_previous_link(),
            'next': paginator.get_next_link(),
            'results': result
        }, status.HTTP_200_OK)

    @auth
    def retrieve(self, request, pk=None):
        job = self.queryset.filter(pk=pk).first()
        if job is None:
            return Response({
                'errors': 'Job is not exists'
            }, status.HTTP_400_BAD_REQUEST)
        return Response(job.to_dict(), status.HTTP_200_OK)

    @is_job_requester
    def update(self, request, pk=None):
        try:
            job = Job.objects.filter(pk=pk).first()
            truth_qty = request.data.get('truth_qty', job.truth_qty)
            shared_qty = request.data.get('shared_qty', job.shared_qty)
            min_qty = request.data.get('min_qty', job.min_qty)
            if truth_qty != 10 and truth_qty != 20:
                return Response({
                    'errors': 'truth_qty must be 10 or 20'
                }, status.HTTP_400_BAD_REQUEST)
            if shared_qty != 10 and shared_qty != 20:
                return Response({
                    'errors': 'shared_qty must be 10 or 20'
                }, status.HTTP_400_BAD_REQUEST)
            if truth_qty + shared_qty >= min_qty:
                return Response({
                    'errors': 'min_qty must be higher than total of truth_qty and shared_qty'
                })
            update_model(job, request.data, ['description', 'category', 'name', 'truth_qty', 'shared_qty',
                                             'min_qty', 'unit_wage', 'unit_bonus', 'accept_threshold',
                                             'bonus_threshold'])
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
        query_set = Comment.objects.filter(job=job.id).order_by('-created_at')
        paginator = PageNumberPagination()
        comments = paginator.paginate_queryset(query_set, request)
        result = []
        for comment in comments:
            result.append(comment.to_dict())
        return Response({
            'total': query_set.count(),
            'prev': paginator.get_previous_link(),
            'next': paginator.get_next_link(),
            'results': result
        }, status.HTTP_200_OK)

    @action(detail=True, methods=['PUT', 'GET'])
    @is_job_requester
    def truth_unit(self, request, pk=None):
        if request.method == 'GET':
            unlabeled_truth_units = TruthUnit.objects.filter(job=pk, label=None)
            unit_data = []
            for truth_unit in unlabeled_truth_units:
                unit_data.append(truth_unit.to_dict())
            return Response({
                'truth_unit': unit_data
            }, status.HTTP_200_OK)
        if request.method == 'PUT':
            unit_id = request.data.get('truth_unit_id', None)
            if unit_id is None:
                return Response({
                    'errors': 'truth_unit_id is required'
                }, status.HTTP_400_BAD_REQUEST)
            label = request.data.get('label', None)
            if label is None:
                return Response({
                    'errors': 'label is required'
                }, status.HTTP_400_BAD_REQUEST)
            truth_unit = TruthUnit.objects.filter(job=pk, pk=unit_id).first()
            if truth_unit is None:
                return Response({
                    'errors': 'Truth Unit not found'
                }, status.HTTP_404_NOT_FOUND)
            truth_unit.label = label
            truth_unit.save()

            # Check if job ready for apply
            count = TruthUnit.objects.filter(job=pk, label=None).count()
            if count == 0:
                job = Job.objects.filter(pk=pk).first()
                job.truth_qty_ready = True
                job.save()
            return Response(truth_unit.to_dict(), status.HTTP_201_CREATED)

    @action(detail=True, methods=['GET'])
    @is_job_requester
    def get_task(self, request, pk=None):
        tasks = Task.objects.filter(job=pk)
        task_data = []
        for task in tasks:
            task_data.append(task.to_dict_for_requester())
        return Response({
            'tasks': task_data
        }, status.HTTP_200_OK)


class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer

    @auth
    def create(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            user = User.objects.filter(email=request.user).first()
            comment = serializer.save(user=user.id)
            return Response(comment.to_dict(), status.HTTP_201_CREATED)
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
            job = Job.objects.filter(pk=request.data['job']).first()
            unit_qty = request.data['unit_qty']
            user = User.objects.filter(email=request.user).first()
            if job.requester == user.id:
                return Response({}, status.HTTP_403_FORBIDDEN)
            task = Task.objects.create(job=job.id, annotator=user.id, unit_qty=unit_qty)
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
        job = Job.objects.filter(pk=task.job).first()
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
        if (job.unit_qty - job.accepted_qty - task.unit_qty) < job.min_qty and remain_qty != task.unit_qty:
            return Response({
                'errors': 'remaining qty must be higher or equal to ' + str(job.min_qty)
            }, status.HTTP_400_BAD_REQUEST)
        # save qty to job
        job.accepted_qty = job.accepted_qty + task.unit_qty
        job.save()
        task.accepted = True
        task.save()

        # Clone truth unit
        truth_units = TruthUnit.objects.filter(job=job.id)
        for truth_unit in truth_units:
            unit = Unit.objects.create(job=job.id, task=task.id, data=truth_unit.data, assigned=True)
            truth_label = TruthLabel.objects.create(truth_unit=truth_unit.id, task=task.id, unit=unit.id, accuracy=0)
            unit.truth_id = truth_label.id
            unit.save()

        # Clone shared unit
        shared_units = SharedUnit.objects.filter(job=job.id)
        for shared_unit in shared_units:
            unit = Unit.objects.create(job=job.id, task=task.id, data=shared_unit.data, assigned=True)
            shared_label = SharedLabel.objects.create(shared_unit=shared_unit.id, task=task.id, unit=unit.id, accuracy=0)
            unit.shared_id = shared_label.id
            unit.save()

        # assign normal unit
        units = Unit.objects.filter(job=job.id, assigned=False)[:task.unit_qty]
        for unit in units:
            unit.task = task.id
            unit.assigned = True
            unit.save()

        return Response(task.to_dict(), status.HTTP_201_CREATED)

    @action(detail=True, methods=['PUT'])
    @is_task_requester
    def reject_task(self, request, pk=None):
        task = self.queryset.filter(pk=pk).first()
        if task.rejected:
            return Response({
                'errors': 'Task has been rejected'
            }, status.HTTP_400_BAD_REQUEST)
        job = Job.objects.filter(pk=task.job).first()
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

    @is_task_annotator
    def retrieve(self, request, pk=None):
        task = Task.objects.filter(pk=pk).first()
        units = Unit.objects.filter(task=pk)
        unit_data = []
        for unit in units:
            unit_data.append(unit.to_dict())
        return Response({
            'task': task.to_dict(),
            'units': unit_data
        }, status.HTTP_200_OK)

    @action(detail=True, methods=['PUT'])
    @is_task_annotator
    def submit_label(self, request, pk=None):
        units = request.data.get('units', None)
        task = Task.objects.filter(pk=pk).first()
        if units is None:
            return Response({
                'errors': 'units is required'
            }, status.HTTP_400_BAD_REQUEST)
        items = []
        for unit in units:
            item = Unit.objects.filter(pk=unit['unit_id']).first()
            if item is None:
                return Response({
                    'errors': 'unit ' + str(unit['unit_id']) + ' not found'
                }, status.HTTP_404_NOT_FOUND)
            if unit.get('label') is None:
                return Response({
                    'errors': 'label should not be None'
                }, status.HTTP_400_BAD_REQUEST)
            if item.task != task.id:
                return Response({
                    'errors': 'unit not in task'
                }, status.HTTP_400_BAD_REQUEST)
            item.label = unit['label']
            items.append(item)
        for item in items:
            item.save()
            if item.truth_id is not None:
                truth_label = TruthLabel.objects.filter(pk=item.truth_id).first()
                truth_label.label = item.label
                # TODO: calculate truth label accuracy
                truth_label.accuracy = 100
                truth_label.save()
            if item.shared_id is not None:
                shared_label = SharedLabel.objects.filter(pk=item.shared_id).first()
                shared_label.label = item.label
                # TODO: calculate shared label accuracy
                shared_label.accuracy = 100
                shared_label.save()

        # Calculate task's truth accuracy
        truth_labels = TruthLabel.objects.filter(task=pk)
        total_truth_score = 0
        for truth_label in truth_labels:
            total_truth_score += truth_label.accuracy
        task.truth_accuracy = total_truth_score/truth_labels.count()

        # Calculate task's shared accuracy
        shared_labels = SharedLabel.objects.filter(task=pk)
        total_shared_score = 0
        for shared_label in shared_labels:
            total_shared_score += shared_label.accuracy
        task.shared_accuracy = total_shared_score/shared_labels.count()

        task.save()
        return Response({}, status.HTTP_201_CREATED)

    @auth
    def list(self, request):
        user = User.objects.filter(email=request.user).first()
        query_set = Task.objects.filter(annotator=user.id)
        paginator = PageNumberPagination()
        tasks = paginator.paginate_queryset(query_set, request)
        result = []
        for task in tasks:
            result.append(task.to_dict())
        # TODO: get task's process
        return Response({
            'total': query_set.count(),
            'prev': paginator.get_previous_link(),
            'next': paginator.get_next_link(),
            'results': result
        }, status.HTTP_200_OK)
