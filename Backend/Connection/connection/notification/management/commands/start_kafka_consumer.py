from django.core.management.base import BaseCommand
from notification.kafka_utils.consumer import KafkaConsumerService

class Command(BaseCommand):
    help = 'Start Kafka Consumer for the Content Service'

    def handle(self, *args, **options):
        config = {
            'bootstrap.servers':'localhost:9092',
            'group.id':'connection-consumer-group',
            'auto.offset.reset':'earliest'
        }
        consumer = KafkaConsumerService(config)
        consumer.consume_message()