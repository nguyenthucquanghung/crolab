# from .models import *
from difflib import SequenceMatcher


def validate_string_label(origin, label):
    return int(SequenceMatcher(None, origin, label).ratio() * 100)
