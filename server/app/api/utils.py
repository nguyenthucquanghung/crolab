import functools
from .models import *
from rest_framework.response import Response


def auth(func):
    @functools.wraps(func)
    def execute(view_set, request, *args, **kwargs):
        user = User.objects.filter(email=request.user).first()
        if user is None:
            return Response({}, 401)
        return func(view_set, request, *args, **kwargs)

    return execute
