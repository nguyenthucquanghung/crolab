from storages.backends.azure_storage import AzureStorage


ACCOUNT_NAME = 'crolab'
ACCOUNT_KEY = 'dZSWtRqd7Yq3RPtF4JHrVsx3OFwlS27xPaEOff23R1CjGlqdQ3gMozuNQ0ZqUMMJ/cjFLA5fCrh311n2ug6UdQ=='
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
