from django.db import models
from django.contrib.auth.models import AbstractUser
from django.db.models.deletion import DO_NOTHING
from enumerates import *


class User(AbstractUser):
    # Remove non-used fields
    username = None
    last_login = None
    is_staff = None
    is_superuser = None

    password = models.CharField(max_length=100)
    full_name = models.CharField(max_length=100)
    email = models.EmailField(max_length=100, unique=True)
    gender = models.SmallIntegerField(choices=Gender.choices)
    year_of_birth = models.IntegerField()
    role = models.SmallIntegerField(choices=UserRole.choices)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    # In scale 0.01, Eg: rating=480 mean 4.8 star
    rating = models.IntegerField(default=0)
    # In scale 0.01, Eg: rating=68 mean 68% accuracy
    mean_accuracy = models.IntegerField(default=0)
    label_c = models.IntegerField(default=0)
    task_c = models.IntegerField(default=0)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    def __str__(self):
        return self.email

    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'full_name': self.full_name,
            'gender': self.gender,
            'year_of_birth': self.year_of_birth,
            'role': self.role,
            'created_at': self.created_at,
            'updated_at': self.updated_at,
            'rating': self.rating,
            'mean_accuracy': self.mean_accuracy,
            'label_c': self.label_c,
            'task_c': self.task_c,
        }


class Job(models.Model):
    requester = models.ForeignKey(User, on_delete=models.DO_NOTHING)

    category = models.SmallIntegerField(choices=Category.choices)
    name = models.CharField(max_length=100)
    description = models.CharField(max_length=1000)
    unit_qty = models.IntegerField()
    truth_qty = models.IntegerField()
    shared_qty = models.IntegerField()
    min_qty = models.IntegerField()
    accepted_qty = models.IntegerField()
    unit_wage = models.IntegerField()
    unit_bonus = models.IntegerField()
    # In scale 0.01, Eg: accept_threshold=68 mean accept above 68% accuracy
    accept_threshold = models.IntegerField()
    # In scale 0.01, Eg: accept_threshold=68 mean accept above 68% accuracy
    bonus_threshold = models.IntegerField()

    class Meta:
        db_table = 'job'


class Comment:
    user = models.ForeignKey(User, on_delete=models.DO_NOTHING)
    job = models.ForeignKey(Job, on_delete=DO_NOTHING)
    content = models.CharField(max_length=1000)

    class Meta:
        db_table = 'comment'


class ClassificationLabelType:
    job = models.ForeignKey(Job, on_delete=DO_NOTHING)
    name = models.CharField(max_length=100, unique=True)
    description = models.CharField(max_length=1000)

    class Meta:
        db_table = 'classification'


class Task:
    job = models.ForeignKey(Job, on_delete=models.DO_NOTHING)
    annotator = models.ForeignKey(User, on_delete=models.DO_NOTHING)
    unit_qty = models.IntegerField()
    accepted = models.BooleanField(default=False)
    passed = models.BooleanField(default=False)
    rejected = models.BooleanField(default=False)
    # In scale 0.01
    shared_accuracy = models.IntegerField()
    # In scale 0.01
    truth_accuracy = models.IntegerField()

    class Meta:
        db_table = 'task'


class Unit:
    job = models.ForeignKey(Job, on_delete=DO_NOTHING)
    task = models.ForeignKey(Task, DO_NOTHING)
    data = models.CharField(max_length=1000)
    label = models.CharField(max_length=1000)
    assigned = models.BooleanField(default=False)

    class Meta:
        db_table = 'unit'


class TruthUnit:
    job = models.ForeignKey(Job, on_delete=DO_NOTHING)
    data = models.CharField(max_length=1000)
    label = models.CharField(max_length=1000)

    class Meta:
        db_table = 'truth_unit'


class TruthLabel:
    truth_unit = models.ForeignKey(TruthUnit, on_delete=DO_NOTHING)
    task = models.ForeignKey(Task, on_delete=DO_NOTHING)
    label = models.CharField(max_length=1000)
    # In scale 0.01
    accuracy = models.IntegerField()

    class Meta:
        db_table = 'truth_label'


class SharedUnit:
    job = models.ForeignKey(Job, on_delete=DO_NOTHING)
    data = models.CharField(max_length=1000)
    mean_value = models.CharField(max_length=1000)

    class Meta:
        db_table = 'shared_unit'


class SharedLabel:
    shared_unit = models.ForeignKey(SharedUnit, on_delete=DO_NOTHING)
    task = models.ForeignKey(Task, on_delete=DO_NOTHING)
    label = models.CharField(max_length=1000)
    # In scale 0.01
    accuracy = models.IntegerField()

    class Meta:
        db_table = 'shared_label'


class Rank:
    user = models.ForeignKey(User, on_delete=DO_NOTHING)
    rank_category = models.SmallIntegerField(RankCategory.choices)
    offset = models.IntegerField()
    
    class Meta:
        db_table = 'rank'


class Rating:
    task = models.ForeignKey(Task, on_delete=DO_NOTHING)
    rater = models.ForeignKey(User, on_delete=DO_NOTHING)
    ratee = models.ForeignKey(User, on_delete=DO_NOTHING)
    comment = models.CharField(max_length=1000)
    # By scale 0.01
    rating = models.IntegerField()

    class Meta:
        db_table = 'rating'