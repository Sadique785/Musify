from django.apps import AppConfig
from authentication.kafka_utils.admin_service import KafkaAdminService


class AuthenticationConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'authentication'

    def ready(self):
        kafka_admin = KafkaAdminService()
        kafka_admin.initialize_topics()
