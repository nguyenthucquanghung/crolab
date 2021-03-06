from django.db import models
from django.contrib.auth.models import AbstractUser
from django.db.models.deletion import DO_NOTHING
from .enumerates import *


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
    rate_c = models.IntegerField(default=0)
    rating = models.FloatField(default=0)
    # In scale 0.01, Eg: rating=68 mean 68% accuracy
    truth_label_c = models.IntegerField(default=0)
    mean_truth_accuracy = models.FloatField(default=0)
    shared_label_c = models.IntegerField(default=0)
    mean_shared_accuracy = models.FloatField(default=0)
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
            'rate_c': self.rate_c,
            'mean_truth_accuracy': self.mean_truth_accuracy,
            'mean_shared_accuracy': self.mean_shared_accuracy,
            'label_c': self.label_c,
            'task_c': self.task_c,
        }

    def simple_info(self):
        return {
            'id': self.id,
            'full_name': self.full_name
        }


class Job(models.Model):
    requester = models.IntegerField()

    category = models.SmallIntegerField(choices=Category.choices)
    name = models.CharField(max_length=100)
    description = models.CharField(max_length=1000)
    unit_qty = models.IntegerField()
    truth_qty = models.IntegerField()
    shared_qty = models.IntegerField()
    min_qty = models.IntegerField()
    accepted_qty = models.IntegerField(default=0)
    unit_wage = models.IntegerField()
    unit_bonus = models.IntegerField()
    # In scale 0.01, Eg: accept_threshold=68 mean accept above 68% accuracy
    accept_threshold = models.IntegerField()
    # In scale 0.01, Eg: accept_threshold=68 mean accept above 68% accuracy
    bonus_threshold = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    truth_qty_ready = models.BooleanField(default=False)
    # Default of deadline is 10 days
    deadline = models.IntegerField(default=10)

    class Meta:
        db_table = 'job'

    def to_dict(self):
        requester = User.objects.filter(pk=self.requester).first()
        truth_units = TruthUnit.objects.filter(job=self.id).all()
        truth_units_data = []
        for truth_unit in truth_units:
            truth_units_data.append(truth_unit.to_dict())

        tasks = Task.objects.filter(job=self.id).all()
        tasks_data = []
        for task in tasks:
            tasks_data.append(task.to_dict())
        if requester is not None:
            requester = requester.to_dict()
        return {
            'id': self.id,
            'category': self.category,
            'name': self.name,
            'description': self.description,
            'requester': requester,
            'unit_qty': self.unit_qty,
            'truth_qty': self.truth_qty,
            'shared_qty': self.shared_qty,
            'min_qty': self.min_qty,
            'accepted_qty': self.accepted_qty,
            'unit_wage': self.unit_wage,
            'unit_bonus': self.unit_bonus,
            'accepted_threshold': self.accept_threshold,
            'bonus_threshold': self.bonus_threshold,
            'truth_qty_ready': self.truth_qty_ready,
            'deadline': str(self.deadline) + ' days',
            'truth_units': truth_units_data,
            'tasks': tasks_data,
            'created_at': self.created_at,
            'updated_at': self.updated_at
        }

    def to_dict_for_annotator(self):
        requester = User.objects.filter(pk=self.requester).first()
        if requester is not None:
            requester = requester.to_dict()
            # requester = requester.simple_info()
        label_type_data = []
        label_types = ClassificationLabelType.objects.filter(job=self.id)
        for label_type in label_types:
            label_type_data.append(label_type.to_dict())
        return {
            'id': self.id,
            'category': self.category,
            'name': self.name,
            'description': self.description,
            'requester': requester,
            'unit_qty': self.unit_qty,
            'truth_qty': self.truth_qty,
            'shared_qty': self.shared_qty,
            'min_qty': self.min_qty,
            'accepted_qty': self.accepted_qty,
            'unit_wage': self.unit_wage,
            'unit_bonus': self.unit_bonus,
            'accepted_threshold': self.accept_threshold,
            'bonus_threshold': self.bonus_threshold,
            'truth_qty_ready': self.truth_qty_ready,
            'classification_label_type': label_type_data,
            'deadline': str(self.deadline) + ' days',
            'created_at': self.created_at,
            'updated_at': self.updated_at
        }


class Comment(models.Model):
    user = models.IntegerField()
    job = models.IntegerField()
    content = models.CharField(max_length=1000)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'comment'

    def to_dict(self):
        user = User.objects.filter(pk=self.user).first()
        if user is not None:
            print(user)
            user = user.simple_info()
        return {
            'id': self.id,
            'user': user,
            'job': self.job,
            'content': self.content,
            'created_at': self.created_at
        }


class ClassificationLabelType(models.Model):
    job = models.IntegerField()
    name = models.CharField(max_length=100, unique=True)
    description = models.CharField(max_length=1000)

    class Meta:
        db_table = 'classification'

    def to_dict(self):
        return {
            'id': self.id,
            'job': self.job,
            'name': self.name,
            'description': self.description
        }


class Task(models.Model):
    job = models.IntegerField()
    annotator = models.IntegerField()
    unit_qty = models.IntegerField()
    accepted = models.BooleanField(default=False)
    passed = models.BooleanField(default=False)
    rejected = models.BooleanField(default=False)
    # In scale 0.01
    shared_accuracy = models.IntegerField(default=0)
    # In scale 0.01
    truth_accuracy = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    accepted_at = models.DateTimeField(auto_now_add=True)
    is_submitted = models.BooleanField(default=False)

    class Meta:
        db_table = 'task'
        ordering = ['id']

    def to_dict(self):
        annotator = User.objects.filter(pk=self.annotator).first()
        job = Job.objects.filter(pk=self.job).first()
        if job is not None:
            job = job.to_dict_for_annotator()
        if annotator is not None:
            annotator = annotator.to_dict()
        units = Unit.objects.filter(task=self.id)
        not_labeled_units = Unit.objects.filter(task=self.id, label=None)
        return {
            'id': self.id,
            'annotator': annotator,
            'unit_qty': self.unit_qty,
            'labeled_unit': units.count() - not_labeled_units.count(),
            'accepted': self.accepted,
            'passed': self.passed,
            'rejected': self.rejected,
            'is_submitted': self.is_submitted,
            'created_at': self.created_at,
            'accepted_at': self.accepted_at,
            'shared_accuracy': self.shared_accuracy,
            'truth_accuracy': self.truth_accuracy,
            'job': job,
        }

    def to_dict_for_requester(self):
        result = self.to_dict()
        result['shared_accuracy'] = self.shared_accuracy
        result['truth_accuracy'] = self.truth_accuracy
        return result

    def to_dict_for_fire_base(self):
        task_data = self.to_dict()
        task_data['created_at'] = str(task_data['created_at'])
        task_data['accepted_at'] = str(task_data['accepted_at'])
        task_data['annotator']['created_at'] = str(task_data['annotator']['created_at'])
        task_data['annotator']['updated_at'] = str(task_data['annotator']['updated_at'])
        task_data['job']['created_at'] = str(task_data['job']['created_at'])
        task_data['job']['updated_at'] = str(task_data['job']['updated_at'])
        task_data['job']['requester']['created_at'] = str(task_data['job']['requester']['created_at'])
        task_data['job']['requester']['updated_at'] = str(task_data['job']['requester']['updated_at'])
        print(task_data)
        return task_data

    def to_dict_for_annotator(self):
        task_data = self.to_dict()
        rating = Rating.objects.filter(task=self.id, rater=self.annotator).first()
        if rating is not None:
            task_data['rated'] = True
            task_data['rating'] = rating.rating
        else:
            task_data['rated'] = False
        return task_data


class Unit(models.Model):
    job = models.IntegerField()
    task = models.IntegerField(null=True)
    data = models.CharField(max_length=1000)
    label = models.CharField(max_length=1000, null=True)
    assigned = models.BooleanField(default=False)
    shared_id = models.IntegerField(null=True, default=None)
    truth_id = models.IntegerField(null=True, default=None)

    class Meta:
        db_table = 'unit'

    def to_dict(self):
        return {
            'id': self.id,
            'job': self.job,
            'task': self.task,
            'data': self.data,
            'label': self.label,
            'assigned': self.assigned
        }


class TruthUnit(models.Model):
    job = models.IntegerField()
    data = models.CharField(max_length=1000)
    label = models.CharField(max_length=1000, default=None, null=True)

    class Meta:
        db_table = 'truth_unit'

    def to_dict(self):
        return {
            'id': self.id,
            'job': self.job,
            'data': self.data,
            'label': self.label
        }


class TruthLabel(models.Model):
    truth_unit = models.IntegerField()
    task = models.IntegerField()
    unit = models.IntegerField()
    label = models.CharField(max_length=1000, default=None, null=True)
    # In scale 0.01
    accuracy = models.IntegerField()

    class Meta:
        db_table = 'truth_label'


class SharedUnit(models.Model):
    job = models.IntegerField()
    data = models.CharField(max_length=1000)
    mean_value = models.CharField(max_length=1000, null=True, default=None)

    class Meta:
        db_table = 'shared_unit'


class SharedLabel(models.Model):
    shared_unit = models.IntegerField()
    task = models.IntegerField()
    unit = models.IntegerField()
    label = models.CharField(max_length=1000, default=None, null=True)
    # In scale 0.01
    accuracy = models.IntegerField()

    class Meta:
        db_table = 'shared_label'


class Rank(models.Model):
    user = models.IntegerField()
    rank_category = models.SmallIntegerField(RankCategory.choices)
    offset = models.IntegerField()

    class Meta:
        db_table = 'rank'


class Rating(models.Model):
    task = models.IntegerField()
    rater = models.IntegerField()
    ratee = models.IntegerField()
    comment = models.CharField(max_length=1000)
    # By scale 0.01
    rating = models.IntegerField()

    class Meta:
        db_table = 'rating'

    def to_dict(self):
        rater = User.objects.filter(pk=self.rater).first()
        if rater is not None:
            rater = rater.to_dict()
        ratee = User.objects.filter(pk=self.ratee).first()
        if ratee is not None:
            ratee = ratee.to_dict()
        return {
            'task_id': self.task,
            'rater': rater,
            'ratee': ratee,
            'comment': self.comment,
            'rating': self.rating
        }
