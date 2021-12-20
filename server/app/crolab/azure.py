from storages.backends.azure_storage import AzureStorage
import os


ACCOUNT_NAME = os.environ.get('ACCOUNT_NAME')
ACCOUNT_KEY = os.environ.get('ACCOUNT_KEY')
MEDIA_CONTAINER = 'media'
STATIC_CONTAINER = 'static'


class AzureMediaStorage(AzureStorage):
    account_name = ACCOUNT_NAME
    account_key = ACCOUNT_KEY
    azure_container = MEDIA_CONTAINER
    expiration_secs = None


class AzureStaticStorage(AzureStorage):
    account_name = ACCOUNT_NAME
    account_key = ACCOUNT_KEY
    azure_container =STATIC_CONTAINER
    expiration_secs = None
