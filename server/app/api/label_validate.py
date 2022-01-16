from .models import *
from difflib import SequenceMatcher


def validate_string_label(origin, label):
    return int(SequenceMatcher(None, origin, label).ratio() * 100)


def check_valid_label(job_id, label):
    label_types = ClassificationLabelType.objects.filter(job=job_id)
    if label_types.count() == 0:
        return True
    label_type = label_types.filter(name=label).first()
    if label_type is None:
        return False
    return True
