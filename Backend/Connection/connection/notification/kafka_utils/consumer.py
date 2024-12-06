from confluent_kafka import Consumer, KafkaException    
import json
from django.conf import settings
from notification.models import ConnectionUser, Notification
from django.utils import timezone


class KafkaConsumerService:
    def __init__(self, config):
        self.consumer = Consumer(config)
        self.consumer.subscribe(['user-creation', 'user-update', 'connection', 'notification'])

    def handle_user_creation(self, user_data):
        try:
            user_id = user_data.get('id')
            username = user_data.get('username')
            email = user_data.get('email')
            image_url = user_data.get('image_url')

            user, created = ConnectionUser.objects.update_or_create(
                id=user_id,
                defaults={
                    'username':username,
                    'email': email,
                    'image_url':image_url,
                }
            )

            print(f"User {username} {'created' if created else 'updated'} with image URL: {image_url}")

        except Exception as e:
            print(f'Error processing message : {e}')  

    def handle_user_update(self, user_data):
        try:
            user_id = user_data.get('id')
            username = user_data.get('username')
            email = user_data.get('email')
            image_url = user_data.get('image_url')
            print( 'user_data from updation ',user_data)

            user, updated = ConnectionUser.objects.update_or_create(
                id=user_id,
                defaults={
                    'username': username,
                    'email': email,
                    'image_url': image_url,
                    'updated_at': timezone.now()
                }
            )

            print(user.username)
            print(f"User {username} updated with new details and image URL: {image_url}")
        except Exception as e:
            print(f'Error updating user: {e}') 

    def handle_block_unblock(self, user_data):
        """Handles adding or removing users from the blocked_users list based on the event type."""
        try:
            user_id = user_data.get('sender_id')
            blocked_user_id = user_data.get('receiver_id')
            event_type = user_data.get('event_type')
            print(f'The content is here u{user_id}, b{blocked_user_id}, e{event_type}')
            
            user = ConnectionUser.objects.get(id=user_id)
            blocked_user = ConnectionUser.objects.get(id=blocked_user_id)

            print(f'Got the users:{user} is going to block {blocked_user}')

            if event_type == 'block':
                user.blocked_users.add(blocked_user)
                print(f"{user.username} has blocked {blocked_user.username}.")
            elif event_type == 'unblock':
                user.blocked_users.remove(blocked_user)
                print(f"{user.username} has unblocked {blocked_user.username}.")
            
            user.save()
        except ConnectionUser.DoesNotExist as e:
            print(f"User not found: {e}")
        except Exception as e:
            print(f"Error handling block/unblock: {e}")


    def handle_connection(self, user_data):
        try:
            print('Guys reached inside handlerconnect and the data is',user_data)
            event_type = user_data.get('event_type')
            if event_type == 'block' or event_type == 'unblock':
                self.handle_block_unblock(user_data)
        except Exception as e:
            print(f'Error processing connection message: {e}')

    def handle_notification(self, notification_data):
        """
        Handle notification events from the notification topic.
        Manages follow requests, cancellations, acceptances, and post activities.
        """
        try:
            event_type = notification_data.get('event_type')
            sender_id = notification_data.get('sender_id')
            receiver_id = notification_data.get('receiver_id')
            
            notification_type_mapping = {
                'follow_requested': 'FOLLOW_REQUEST',
                'follow_cancelled': 'FOLLOW_CANCELLED',
                'follow_accepted': 'FOLLOW_ACCEPT',
                'liked': 'POST_LIKE',
                'commented': 'POST_COMMENT'
            }
            
            # Handle follow-related notifications
            if event_type in ['follow_requested', 'follow_cancelled', 'follow_accepted']:

                extra_data = {}

                if event_type == 'follow_requested':

                    print('Reached here 1 ')
                    Notification.send_real_time_notification(
                        recipient_id=receiver_id,
                        sender_id=sender_id,
                        notification_type=notification_type_mapping[event_type],
                        **extra_data
                        )
                    print('Reached here 2 ')
                    
                elif event_type == 'follow_cancelled':
                    # Delete existing follow request notification
                    Notification.objects.filter(
                        recipient_id=receiver_id,
                        sender_id=sender_id,
                        notification_type='FOLLOW_REQUEST',
                        is_read=False
                    ).delete()
                    
                elif event_type == 'follow_accepted':
                    current_not = Notification.objects.filter(
                    recipient_id=receiver_id,
                    sender_id=sender_id,
                    notification_type='FOLLOW_REQUEST',
                    is_read=False
                ).update(is_read=True)
                    print(current_not)

                    # Create new notification for acceptance
                    print('Reached here at the follow accepted elif ')
                    Notification.send_real_time_notification(
                        recipient_id=sender_id,
                        sender_id=receiver_id,
                        notification_type=notification_type_mapping[event_type],
                        **extra_data
                        )
                    print('Reached here 2 ')

            
            # Handle post activity notifications
            elif event_type in ['liked', 'commented']:
                extra_data = {
                    'post_id': notification_data.get('post_id')
                }
                
                # Add comment_id for comment notifications
                if event_type == 'commented':
                    extra_data['comment_id'] = notification_data.get('comment_id')

                print('Reached here 1 ')
                Notification.send_real_time_notification(
                    recipient_id=receiver_id,
                    sender_id=sender_id,
                    notification_type=notification_type_mapping[event_type],
                    **extra_data
                )
                print('Reached here 2 ')
                
                    
            print(f"Successfully processed {event_type} notification")
                
        except Exception as e:
            print(f"Error processing notification: {e}")
    

    def handle_message(self, message):
        try:
            user_data = json.loads(message.value().decode('utf-8'))


            if message.topic() == 'user-creation':
                self.handle_user_creation(user_data)
            elif message.topic() == 'user-update':
                self.handle_user_update(user_data)
            elif message.topic() == 'connection':
                self.handle_connection(user_data)
            elif message.topic() == 'notification':
                self.handle_notification(user_data)

                
        except Exception as e:
            print(f'Error processing message: {e}')


    def consume_message(self):
        try:
            while True:
                msg = self.consumer.poll(timeout=1.0)
                if msg is None:
                    continue
                if msg.error():
                    if msg.error().code() == KafkaException._PARTITION_EOF:
                        continue
                    else:
                        print(f"consumer error: {msg.error()}")
                        continue
                print(msg, 'message')
                self.handle_message(msg)

        except KeyboardInterrupt:
            print('Consumer Stopped.')
        finally: 
            self.consumer.close()