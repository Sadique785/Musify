from confluent_kafka import Producer
from django.conf import settings
import json
from datetime import datetime, timezone

# Event type constants
LIKED = 'liked'
COMMENTED = 'commented'

class KafkaProducerService:
    def __init__(self):
        self.producer = Producer(settings.KAFKA_CONFIG)

    def delivery_report(self, err, msg):
        """Callback function to handle delivery reports from Kafka"""
        if err is not None:
            print(f"Delivery failed for record {msg.key()}: {err}")
        else:
            print(f"Record {msg.key()} successfully produced to {msg.topic()} [{msg.partition()}] at offset {msg.offset()}")

    def send_post_activity_notification(self, event_type, sender_id, receiver_id, post_id, comment_id=None):
        """
        Send post activity notifications (likes/comments) to the notification topic.
        
        Args:
            event_type (str): Type of activity (liked/commented)
            sender_id (int): ID of the user who performed the action
            receiver_id (int): ID of the post owner who will receive the notification
            post_id (int): ID of the post that was liked or commented on
            comment_id (int, optional): ID of the comment if event_type is 'commented'
        """
        notification_message = {
            "event_type": event_type,
            "sender_id": sender_id,
            "receiver_id": receiver_id,
            "post_id": post_id,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "read": False,
            "notification_category": "post_activity"
        }

        # Add comment_id to the message only for comment notifications
        if event_type == COMMENTED and comment_id is not None:
            notification_message["comment_id"] = comment_id

        print(f"Preparing to send post activity notification: {notification_message}")

        try:
            self.producer.produce(
                'notification',  # Topic name
                key=str(receiver_id),  # Using receiver_id as key for partitioning
                value=json.dumps(notification_message),
                on_delivery=self.delivery_report
            )
            
            self.producer.flush()
            print(f"Post activity notification successfully sent to notification topic")

        except Exception as e:
            print(f"Failed to send post activity notification: {e}")