from django.db import models


class Gender(models.IntegerChoices):
    FEMALE = 0
    MALE = 1
    NON_BINARY = 2


class UserRole(models.IntegerChoices):
    ADMIN = 0
    REQUESTER = 1
    ANNOTATOR = 2


class Category(models.IntegerChoices):
    SPEECH_TO_TEXT = 0
    DOCUMENT_CLASSIFICATION = 1


class RankCategory(models.IntegerChoices):
    REQUESTER = 0
    ANNOTATOR = 1
    ANNOTATOR_SPEECH_TO_TEXT = 2
    ANNOTATOR_DOCUMENT_CLASSIFICATION = 3