from rest_framework import serializers
from .models import *


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['email', 'password', 'full_name', 'gender', 'year_of_birth', 'role']
        extra_kwargs = {'password': {'write_only': True}}


class UserLoginSerializer(serializers.Serializer):
    def update(self, instance, validated_data):
        pass

    def create(self, validated_data):
        pass

    email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True)


class JobSerializer(serializers.ModelSerializer):

    class Meta:
        model = Job
        fields = ('category', 'name', 'description', 'unit_qty', 'truth_qty', 'shared_qty', 'min_qty', 'accepted_qty',
                  'unit_wage', 'unit_bonus', 'accept_threshold', 'bonus_threshold')
