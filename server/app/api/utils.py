import functools
from .models import *
from rest_framework import status
from rest_framework.response import Response


def auth(func):

    @functools.wraps(func)
    def execute(view_set, request, *args, **kwargs):
        user = User.objects.filter(email=request.user).first()
        if user is None:
            return Response({}, status.HTTP_401_UNAUTHORIZED)
        return func(view_set, request, *args, **kwargs)

    return execute


def is_job_requester(func):

    @functools.wraps(func)
    @auth
    def execute(view_set, request, pk, *args, **kwargs):
        job = Job.objects.filter(pk=pk).first()
        if job is None:
            return Response({}, status.HTTP_404_NOT_FOUND)
        user = User.objects.filter(email=request.user).first()
        if job.requester != user:
            return Response({}, status.HTTP_403_FORBIDDEN)
        return func(view_set, request, pk, *args, **kwargs)

    return execute


def is_task_requester(func):

    @functools.wraps(func)
    @auth
    def execute(view_set, request, pk, *args, **kwargs):
        task = Task.objects.filter(pk=pk).first()
        if task is None:
            return Response({}, status.HTTP_404_NOT_FOUND)
        user = User.objects.filter(email=request.user).first()
        if task.job.requester != user:
            return Response({}, status.HTTP_403_FORBIDDEN)
        return func(view_set, request, pk, *args, **kwargs)

    return execute


def update_model(obj, data, fields):
    for field in fields:
        if data.get(field) is not None:
            setattr(obj, field, data[field])
    obj.save()
