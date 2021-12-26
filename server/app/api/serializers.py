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

    def validate(self, data):
        if data['truth_qty'] != 10 and data['truth_qty'] != 20:
            raise serializers.ValidationError({'truth_qty': 'Must be 10 or 20'})
        if data['shared_qty'] != 10 and data['shared_qty'] != 20:
            raise serializers.ValidationError({'shared_qty': 'Must be 10 or 20'})
        if data['truth_qty'] + data['shared_qty'] >= data['min_qty']:
            raise serializers.ValidationError({'min_qty': 'Must be higher than total of truth_qty and shared_qty'})
        return data

    class Meta:
        model = Job
        fields = ('category', 'name', 'description', 'truth_qty', 'shared_qty', 'min_qty',
                  'unit_wage', 'unit_bonus', 'accept_threshold', 'bonus_threshold', 'deadline')


class CommentSerializer(serializers.ModelSerializer):

    def validate(self, data):
        job = Job.objects.filter(pk=data['job']).first()
        if job is None:
            raise serializers.ValidationError({'job': 'job is not exist'})
        return data

    class Meta:
        model = Comment
        fields = ('content', 'job')


class TaskSerializer(serializers.ModelSerializer):

    def validate(self, data):
        job = Job.objects.filter(pk=data['job']).first()
        if job is None:
            raise serializers.ValidationError({'job': 'job is not exist'})
        unit_qty = data['unit_qty']
        min_qty = job.min_qty
        max_qty = job.unit_qty - job.accepted_qty
        if unit_qty > max_qty or unit_qty < min_qty:
            raise serializers\
                .ValidationError({'unit_qty': 'Should be in range ' + str(min_qty) + ' and ' + str(max_qty)})
        if (max_qty - unit_qty) < min_qty and max_qty != unit_qty:
            raise serializers.ValidationError({'unit_qty': 'remaining qty must be higher or equal to ' + str(min_qty)})
        return data

    class Meta:
        model = Task
        fields = ('unit_qty', 'job')


class RateSerializer(serializers.ModelSerializer):

    def validate(self, data):
        if data['rating'] > 50:
            raise serializers.ValidationError({'rating': 'rating must be in range 0-50'})
        return data

    class Meta:
        model = Rating
        fields = ('comment', 'rating', 'task')
