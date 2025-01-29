from django.core.management.base import BaseCommand
from posts.kafka_utils.consumer import KafkaConsumerService
from django.conf import settings


class Command(BaseCommand):
    help = 'Start Kafka Consumer for the Content Service'

    def handle(self, *args, **options):
        config = {
            'bootstrap.servers': settings.KAFKA_CONFIG['bootstrap.servers'],
            'group.id': 'content-consumer-group',
            'auto.offset.reset': 'earliest'
        }
        consumer = KafkaConsumerService(config)
        consumer.consume_message()