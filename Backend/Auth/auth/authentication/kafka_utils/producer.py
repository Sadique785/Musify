
from confluent_kafka import Producer
from django.conf import settings
import json
from datetime import datetime, timezone

FOLLOW_REQUESTED = "follow_requested"
FOLLOW_CANCELLED = "follow_cancelled"
FOLLOW_ACCEPTED = "follow_accepted"
UNFOLLOW = "unfollow"
BLOCKED = "blocked"


class KafkaProducerService:
    def __init__(self, config):
        self.producer = Producer(settings.KAFKA_CONFIG)

    def delivery_report(self, err, msg):
        if err is not None:
            print(f"Delivery failed for record {msg.key()}: {err}")
        else:
            print(f"Record {msg.key()} successfully produced to {msg.topic()} [{msg.partition()}] at offset {msg.offset()}")

    def send_user_creation_message(self, user_data):
        try:
            self.producer.produce(
                'user-creation',
                key=str(user_data['id']),
                value=json.dumps(user_data),
                on_delivery=self.delivery_report
            )
            self.producer.flush()
        except Exception as e:
            print(f"Failed to send message: {e}")

    def send_user_updation_message(self, user_data):
        """Send a message to the 'user-update' topic when a user profile is updated."""
        try:
            print('guys updation producer been called')
            print(user_data)
            self.producer.produce(
                'user-update',
                key=str(user_data['id']),
                value=json.dumps(user_data),
                on_delivery=self.delivery_report
            )
            self.producer.flush()
        except Exception as e:
            print(f"Failed to send update message:{e}")

    def send_follow_event(self, event_type, sender_id, receiver_id):
        message = {
            "event_type": event_type,
            "sender_id": sender_id,
            "receiver_id": receiver_id,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

        print("Preparing to send message:", message) 

        try:
            self.producer.produce(
                'connection',  
                key=f"{sender_id}-{receiver_id}", 
                value=json.dumps(message),  
                on_delivery=self.delivery_report  
            )
            
            self.producer.flush()
            
            print("Message successfully sent to 'connection' topic")

        except Exception as e:
            print(f"Failed to send follow event message: {e}")
            

    
    def send_block_event(self, sender_id, receiver_id, event_type):
        """Send a block/unblock event to the 'connection' topic to notify other services."""
        message = {
            "event_type": event_type,  # This can be 'BLOCKED' or 'UNBLOCKED'
            "sender_id": sender_id,
            "receiver_id": receiver_id,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

        print("Preparing to send block/unblock event message:", message)

        try:
            self.producer.produce(
                'connection',  
                key=f"{sender_id}-{receiver_id}", 
                value=json.dumps(message),
                on_delivery=self.delivery_report  
            )
            self.producer.flush()
            print(f"{event_type.capitalize()} message successfully sent to 'connection' topic")

        except Exception as e:
            print(f"Failed to send {event_type} event message: {e}")
