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
from .serializers import UserSerializer, UserLoginSerializer, JobSerializer, CommentSerializer, TaskSerializer, RateSerializer
from django.conf import settings
from .utils import *
from .label_validate import *
import uuid
from azure.storage.blob import BlockBlobService
from azure.storage.blob.models import ContentSettings
import datetime
import pyrebase

ACCOUNT_NAME = os.environ.get('ACCOUNT_NAME')
ACCOUNT_KEY = os.environ.get('ACCOUNT_KEY')
MEDIA_CONTAINER = os.environ.get('MEDIA_CONTAINER')
STATIC_CONTAINER = os.environ.get('STATIC_CONTAINER')


firebaseConfig = {
    "apiKey": os.environ.get('FIREBASE_API_KEY'),
    "authDomain": os.environ.get('FIREBASE_AUTH_DOMAIN'),
    "projectId": "crolab-hust",
    "storageBucket": "crolab-hust.appspot.com",
    "messagingSenderId": "385781141419",
    "appId": os.environ.get('FIREBASE_APP_ID'),
    "measurementId": "G-CBP03336HP",
    "databaseURL": os.environ.get('FIREBASE_DB_URL')
}
firebase = pyrebase.initialize_app(firebaseConfig)
authe = firebase.auth()
realtime_db = firebase.database()


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
                'details': serializer.errors
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


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    pagination_class = PageNumberPagination

    @is_admin
    def list(self, request):
        query_set = self.queryset
        paginator = PageNumberPagination()
        users = paginator.paginate_queryset(query_set, request)
        result = []
        for user in users:
            result.append(user.to_dict())
        return Response({
            'total': query_set.count(),
            'prev': paginator.get_previous_link(),
            'next': paginator.get_next_link(),
            'results': result
        }, status.HTTP_200_OK)

    @is_admin
    def retrieve(self, request, pk):
        user = self.queryset.filter(pk=pk).first()
        if user is None:
            return Response({}, status.HTTP_404_NOT_FOUND)
        return Response(user.to_dict(), status.HTTP_200_OK)

    @is_admin
    def update(self, request, pk):
        user = self.queryset.filter(pk=pk).first()
        if user is None:
            return Response({}, status.HTTP_404_NOT_FOUND)
        update_model(user, request.data, ['gender', 'full_name'])
        return Response(user.to_dict(), status.HTTP_201_CREATED)

    @is_admin
    def delete(self, request, pk):
        user = self.queryset.filter(pk=pk).first()
        if user is None:
            return Response({}, status.HTTP_404_NOT_FOUND)
        user.delete()
        return Response({}, 204)


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
                file_upload_name = str(uuid.uuid4()) + '_'+ filename
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
                job = serializer.save(
                    requester=user.id, unit_qty=len(file_names))
                units = []
                for filename in file_names:
                    units.append(Unit(job=job.id, data=filename))
                Unit.objects.bulk_create(units)

                # Create truth and shared unit
                units = Unit.objects.filter(job=job.id).order_by('?')[
                    :job.truth_qty + job.shared_qty]
                truth_units = []
                shared_units = []
                for i in range(0, job.truth_qty):
                    truth_units.append(
                        TruthUnit(job=job.id, data=units[i].data))
                for i in range(job.truth_qty, job.truth_qty + job.shared_qty):
                    shared_units.append(SharedUnit(
                        job=job.id, data=units[i].data))
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

    @action(detail=True, methods=['POST'])
    @is_job_requester
    def label_type(self, request, pk=None):
        label_types = request.data.get('label_types', None)
        if label_types is None:
            return Response({'errors': {'label_types': 'This field is required.'}}, status.HTTP_400_BAD_REQUEST)
        objs = []
        for label_type in label_types:
            name = label_type.get('name', None)
            if name is None:
                return Response({'errors': 'each label type must have a name'}, status.HTTP_400_BAD_REQUEST)
            description = label_type.get('description', '')
            obj = ClassificationLabelType.objects.create(name=name, description=description, job=pk)
            objs.append(obj.to_dict())
        return Response({'results': objs}, status.HTTP_201_CREATED)

    # List available jobs for applying || list all job for admin
    @auth
    def list(self, request):
        user = User.objects.filter(email=request.user).first()
        if user.role == UserRole.ADMIN:
            query_set = self.queryset
        else:
            query_set = self.queryset.filter(unit_qty__gt=models.F('accepted_qty'), truth_qty_ready=True) \
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
        query_set = self.queryset.filter(
            requester=user.id).order_by('-updated_at')
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

    @is_job_requester_or_admin
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
            job = self.queryset.filter(pk=pk).first()
            unlabeled_truth_units = TruthUnit.objects.filter(
                job=pk, label=None)
            unit_data = []
            for truth_unit in unlabeled_truth_units:
                unit_data.append(truth_unit.to_dict())
            return Response({
                'truth_unit': unit_data,
                'job': job.to_dict()
            }, status.HTTP_200_OK)
        if request.method == 'PUT':
            truth_units = request.data.get('truth_units', None)
            for truth_unit in truth_units:
                unit_id = truth_unit['truth_unit_id']
                if unit_id is None:
                    return Response({
                        'errors': 'truth_unit_id is required'
                    }, status.HTTP_400_BAD_REQUEST)
                label = truth_unit['label']
                if label is None:
                    return Response({
                        'errors': 'label is required'
                    }, status.HTTP_400_BAD_REQUEST)
                if not check_valid_label(pk, label):
                    return Response({
                        'errors': 'Invalid label type'
                    }, status.HTTP_400_BAD_REQUEST)
                truth_unit = TruthUnit.objects.filter(
                    job=pk, pk=unit_id).first()
                if truth_unit is None:
                    return Response({
                        'errors': 'Truth Unit not found'
                    }, status.HTTP_404_NOT_FOUND)
                truth_unit.label = label
                truth_unit.save()

            count_unlabeled_truth_unit = TruthUnit.objects.filter(job=pk, label=None).count()
            job = Job.objects.filter(pk=pk).first()
            if count_unlabeled_truth_unit == 0:
                job.truth_qty_ready = True
                job.save()
                # TODO: not push data if all unit done
                job_data = job.to_dict()
                job_data['created_at'] = str(job_data['created_at'])
                job_data['updated_at'] = str(job_data['updated_at'])
                realtime_db.child('data').child('job').update({job.id: job_data})
            return Response(job.to_dict(), status.HTTP_201_CREATED)

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

    @is_admin
    def delete(self, request, pk):
        job = self.queryset.filter(pk=pk).first()
        if job is None:
            return Response({}, status.HTTP_404_NOT_FOUND)
        job.delete()
        Comment.objects.filter(job=pk).delete()
        Task.objects.filter(job=pk).delete()
        Unit.objects.filter(job=pk).delete()
        truth_units = TruthUnit.objects.filter(job=pk)
        for truth_unit in truth_units:
            TruthLabel.objects.filter(truth_unit=truth_unit.pk).delete()
        truth_units.delete()
        shared_units = SharedLabel.objects.filter(job=pk)
        for shared_unit in shared_units:
            SharedLabel.objects.filter(shared_unit=shared_unit).delete()
        shared_units.delete()
        return Response({}, 204)


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

    @is_admin
    def delete(self, request, pk):
        comment = self.queryset.filter(pk=pk).first()
        if comment is None:
            return Response({}, status.HTTP_404_NOT_FOUND)
        comment.delete()
        return Response({}, 204)


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
            task = Task.objects.create(
                job=job.id, annotator=user.id, unit_qty=unit_qty)
            timestamp = str(int(datetime.datetime.timestamp(datetime.datetime.now())*1000))
            task_data = task.to_dict_for_fire_base()

            realtime_db.child('data').child('requester_noti').child(job.requester).update({timestamp: {
                'title': 'New Task Created',
                'detail': task_data
            }})
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
        task.accepted_at = datetime.datetime.now()
        task.save()

        # TODO: mix all units

        # Clone truth unit
        truth_units = TruthUnit.objects.filter(job=job.id)
        for truth_unit in truth_units:
            unit = Unit.objects.create(
                job=job.id, task=task.id, data=truth_unit.data, assigned=True)
            truth_label = TruthLabel.objects.create(
                truth_unit=truth_unit.id, task=task.id, unit=unit.id, accuracy=0)
            unit.truth_id = truth_label.id
            unit.save()

        # Clone shared unit
        shared_units = SharedUnit.objects.filter(job=job.id)
        for shared_unit in shared_units:
            unit = Unit.objects.create(
                job=job.id, task=task.id, data=shared_unit.data, assigned=True)
            shared_label = SharedLabel.objects.create(shared_unit=shared_unit.id, task=task.id, unit=unit.id,
                                                      accuracy=0)
            unit.shared_id = shared_label.id
            unit.save()

        # assign normal unit
        units = Unit.objects.filter(job=job.id, assigned=False)[:(
            task.unit_qty-shared_units.count()-truth_units.count())]
        for unit in units:
            unit.task = task.id
            unit.assigned = True
            unit.save()

        # push noti
        timestamp = str(int(datetime.datetime.timestamp(datetime.datetime.now()) * 1000))
        task_data = task.to_dict_for_fire_base()
        realtime_db.child('data').child('annotator_noti').child(task.annotator).update({timestamp: {
            'title': 'Task Accepted',
            'detail': task_data
        }})

        return Response(task.to_dict(), status.HTTP_201_CREATED)

    @action(detail=True, methods=['PUT'])
    @is_task_requester
    def reject_task(self, request, pk=None):
        task = self.queryset.filter(pk=pk).first()
        job = Job.objects.filter(pk=task.job).first()
        if task.rejected:
            return Response({
                'errors': 'Task has been rejected'
            }, status.HTTP_400_BAD_REQUEST)
        if task.passed:
            return Response({
                'errors': 'Task already passesetd'
            }, status.HTTP_400_BAD_REQUEST)
        if not task.is_submitted:
            # TODO: check deadline
            is_meet_deadline = True
            if not is_meet_deadline and task.accepted:
                return Response({
                    'errors': 'Task not meet deadline yet'
                }, status.HTTP_400_BAD_REQUEST)
        else:
            if task.truth_accuracy >= job.accept_threshold:
                return Response({
                    'errors': 'Can not reject submitted task with accuracy > job accept threshold'
                }, status.HTTP_400_BAD_REQUEST)

        if task.accepted:
            job.accepted_qty = job.accepted_qty - task.unit_qty
            job.save()
            # Clear normal units & delete all shared/truth unit
            assigned_unit = Unit.objects.filter(task=task.id)
            for unit in assigned_unit:
                if unit.shared_id is not None or unit.truth_id is not None:
                    unit.delete()
                else:
                    unit.assigned = False
                    unit.task = None
                    unit.label = None
                    unit.save()
            # Delete all truth * shared label
            SharedLabel.objects.filter(task=task.id).delete()
            TruthLabel.objects.filter(task=task.id).delete()
        task.rejected = True
        task.save()

        # push noti
        timestamp = str(int(datetime.datetime.timestamp(datetime.datetime.now()) * 1000))
        task_data = task.to_dict_for_fire_base()
        realtime_db.child('data').child('annotator_noti').child(task.annotator).update({timestamp: {
            'title': 'Task Rejected',
            'detail': task_data
        }})
        return Response(task.to_dict(), status.HTTP_201_CREATED)

    @action(detail=True, methods=['PUT'])
    @is_task_requester
    def set_task_passed(self, request, pk=None):
        # TODO: remove from realtime_db if all unit done
        task = self.queryset.filter(pk=pk).first()
        if not task.accepted:
            return Response({
                'errors': 'task not accepted'
            }, status.HTTP_400_BAD_REQUEST)
        if task.rejected:
            return Response({
                'errors': 'task rejected'
            }, status.HTTP_400_BAD_REQUEST)
        if task.passed:
            return Response({
                'errors': 'task passed'
            }, status.HTTP_400_BAD_REQUEST)
        if not task.is_submitted:
            return Response({
                'errors': 'task not submitted'
            }, status.HTTP_400_BAD_REQUEST)
        task.passed = True
        task.save()

        # push noti
        timestamp = str(int(datetime.datetime.timestamp(datetime.datetime.now()) * 1000))
        task_data = task.to_dict_for_fire_base()
        realtime_db.child('data').child('annotator_noti').child(task.annotator).update({timestamp: {
            'title': 'Task Passed',
            'detail': task_data
        }})

        # Update user profile
        user = User.objects.filter(pk=task.annotator).first()
        truth_labels = TruthLabel.objects.filter(task=task.id)
        shared_labels = SharedLabel.objects.filter(task=task.id)
        user.task_c = user.task_c + 1
        user.label_c = user.label_c + task.unit_qty

        # Calculate truth accuracy
        new_truth_count = truth_labels.count() + user.truth_label_c
        added_total_truth = 0
        for truth_label in truth_labels:
            added_total_truth += truth_label.accuracy
        user.mean_truth_accuracy = user.mean_truth_accuracy * \
            (user.truth_label_c / new_truth_count) + \
            float(added_total_truth) / new_truth_count
        user.truth_label_c = new_truth_count

        # Calculate shared accuracy
        new_shared_count = shared_labels.count() + user.shared_label_c
        added_total_shared = 0
        for shared_label in shared_labels:
            added_total_shared += shared_label.accuracy
        user.mean_shared_accuracy = user.mean_shared_accuracy * \
            (user.shared_label_c / new_shared_count) + \
            float(added_total_shared) / new_shared_count
        user.shared_label_c = new_shared_count

        user.save()
        return Response(task.to_dict(), status.HTTP_201_CREATED)

    @is_task_annotator
    def retrieve(self, request, pk=None):
        task = Task.objects.filter(pk=pk).first()
        query_set = Unit.objects.filter(task=pk)
        paginator = PageNumberPagination()
        units = paginator.paginate_queryset(query_set, request)
        result = []
        for unit in units:
            result.append(unit.to_dict())
        return Response({
            'task': task.to_dict(),
            'units': {
                'total': query_set.count(),
                'prev': paginator.get_previous_link(),
                'next': paginator.get_next_link(),
                'results': result
            }
        }, status.HTTP_200_OK)

    @action(detail=True, methods=['PUT'])
    @is_task_annotator
    def submit_label(self, request, pk=None):
        units = request.data.get('units', None)
        task = Task.objects.filter(pk=pk).first()
        if not task.accepted or task.passed or task.rejected:
            return Response({
                'errors': 'Task can not be processed now'
            }, status.HTTP_403_FORBIDDEN)
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
            if not check_valid_label(task.job, unit['label']):
                return Response({
                    'errors': 'Invalid label type'
                }, status.HTTP_400_BAD_REQUEST)
            if item.task != task.id:
                return Response({
                    'errors': 'unit not in task'
                }, status.HTTP_400_BAD_REQUEST)
            item.label = unit['label']
            items.append(item)
        Unit.objects.bulk_update(items, ['label'])
        is_has_truth_label = False
        is_has_shared_label = False
        for item in items:
            if item.truth_id is not None:
                is_has_truth_label = True
                truth_label = TruthLabel.objects.filter(
                    pk=item.truth_id).first()
                truth_label.label = item.label
                truth_unit = TruthUnit.objects.filter(
                    pk=truth_label.truth_unit).first()
                truth_label.accuracy = validate_string_label(
                    truth_label.label, truth_unit.label)
                truth_label.save()
            if item.shared_id is not None:
                is_has_shared_label = True
                shared_label = SharedLabel.objects.filter(
                    pk=item.shared_id).first()
                shared_label.label = item.label
                shared_label.save()
                total_accuracy = 0
                shared_labels = SharedLabel.objects.filter(
                    shared_unit=shared_label.shared_unit).exclude(label=None)
                count_shared_label = shared_labels.count()
                for i in shared_labels:
                    total_accuracy += validate_string_label(
                        shared_label.label, i.label)
                shared_label.accuracy = int(
                    total_accuracy / count_shared_label)
                shared_label.save()

        if is_has_truth_label:
            # Calculate task's truth accuracy
            truth_labels = TruthLabel.objects.filter(
                task=pk).exclude(label=None)
            total_truth_score = 0
            for truth_label in truth_labels:
                total_truth_score += truth_label.accuracy
            task.truth_accuracy = total_truth_score / truth_labels.count()

        if is_has_shared_label:
            # Calculate task's shared accuracy
            shared_labels = SharedLabel.objects.filter(
                task=pk).exclude(label=None)
            total_shared_score = 0
            for shared_label in shared_labels:
                total_shared_score += shared_label.accuracy
            task.shared_accuracy = total_shared_score / shared_labels.count()

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
        return Response({
            'total': query_set.count(),
            'prev': paginator.get_previous_link(),
            'next': paginator.get_next_link(),
            'results': result
        }, status.HTTP_200_OK)

    @action(detail=True, methods=['PUT'])
    @is_task_annotator
    def submit(self, request, pk=None):
        task = Task.objects.filter(pk=pk).first()
        if task.is_submitted:
            return Response({
                'errors': 'Task already submitted'
            }, status.HTTP_400_BAD_REQUEST)
        if not task.accepted:
            return Response({
                'errors': 'Task not accepted'
            }, status.HTTP_400_BAD_REQUEST)
        not_labeled_unit = Unit.objects.filter(task=task.id, label=None)
        if not_labeled_unit.count() > 0:
            return Response({
                'errors': 'task not fully labeled'
            }, status.HTTP_400_BAD_REQUEST)
        task.is_submitted = True
        task.save()
        return Response(task.to_dict(), status.HTTP_201_CREATED)


class RateViewSet(viewsets.ModelViewSet):
    queryset = Rating.objects.all()
    serializer_class = RateSerializer

    @auth
    def create(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            user = User.objects.filter(email=request.user).first()
            rate = Rating.objects.filter(
                task=request.data['task'], rater=user.id).first()
            if rate is not None:
                return Response({
                    'errors': 'You already rated this task'
                }, status.HTTP_400_BAD_REQUEST)
            task = Task.objects.filter(pk=request.data['task']).first()
            if not task.passed:
                return Response({
                    'errors': 'Can not rate not passed task'
                }, status.HTTP_400_BAD_REQUEST)
            annotator = User.objects.filter(pk=task.annotator).first()
            job = Job.objects.filter(pk=task.job).first()
            requester = User.objects.filter(pk=job.requester).first()
            if user != annotator and user != requester:
                return Response({}, status.HTTP_403_FORBIDDEN)
            if user == annotator:
                rate = serializer.save(ratee=requester.id, rater=user.id)
            if user == requester:
                rate = serializer.save(ratee=annotator.id, rater=requester.id)
            # Update user rating
            ratee = User.objects.filter(pk=rate.ratee).first()
            new_rate_count = 1 + ratee.rate_c
            ratee.rating = ratee.rating * \
                (user.rate_c / new_rate_count) + \
                float(rate.rating) / new_rate_count
            ratee.rate_c = new_rate_count
            ratee.save()
            return Response(rate.to_dict(), status.HTTP_201_CREATED)
        else:
            return JsonResponse({
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

    @auth
    @action(detail=False, methods=['GET'])
    def annotator(self, request):
        query_set = User.objects.filter(role=UserRole.ANNOTATOR, rate_c__gt=0).order_by('-rating')
        paginator = PageNumberPagination()
        users = paginator.paginate_queryset(query_set, request)
        result = []
        for user in users:
            result.append(user.to_dict())
        return Response({
            'total': query_set.count(),
            'prev': paginator.get_previous_link(),
            'next': paginator.get_next_link(),
            'results': result
        }, status.HTTP_200_OK)

    @auth
    @action(detail=False, methods=['GET'])
    def requester(self, request):
        query_set = User.objects.filter(role=UserRole.REQUESTER, rate_c__gt=0).order_by('-rating')
        paginator = PageNumberPagination()
        users = paginator.paginate_queryset(query_set, request)
        result = []
        for user in users:
            result.append(user.to_dict())
        return Response({
            'total': query_set.count(),
            'prev': paginator.get_previous_link(),
            'next': paginator.get_next_link(),
            'results': result
        }, status.HTTP_200_OK)
