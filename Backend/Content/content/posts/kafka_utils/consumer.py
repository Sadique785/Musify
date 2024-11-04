from confluent_kafka import Consumer, KafkaException
import json
from django.conf import settings
from posts.models import ContentUser
from friends_content.models import FriendList, FriendRequest
from django.utils import timezone

class KafkaConsumerService:
    def __init__(self, config):
        
        self.consumer = Consumer(config)
        self.consumer.subscribe(['user-creation', 'user-update', 'connection'])



    def handle_user_creation(self, user_data):
        try:
            user_id = user_data.get('id')
            username = user_data.get('username')
            email = user_data.get('email')
            image_url = user_data.get('image_url')

            user, created = ContentUser.objects.update_or_create(
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

            user, updated = ContentUser.objects.update_or_create(
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


    def handle_follow_request(self, user_data):
        try:
            sender_id = user_data.get('sender_id')
            receiver_id = user_data.get('receiver_id')
            sender = ContentUser.objects.get(id=sender_id)
            receiver = ContentUser.objects.get(id=receiver_id)

            # Create or update the FriendRequest to set it as active
            follow_request, created = FriendRequest.objects.get_or_create(sender=sender, receiver=receiver)
            follow_request.is_active = True
            follow_request.save()

            print(f"Follow request sent from {sender.username} to {receiver.username}.")

        except Exception as e:
            print(f'Error handling follow request: {e}')

    def handle_follow_cancel(self, user_data):
        try:
            sender_id = user_data.get('sender_id')
            receiver_id = user_data.get('receiver_id')
            sender = ContentUser.objects.get(id=sender_id)
            receiver = ContentUser.objects.get(id=receiver_id)

            follow_request = FriendRequest.objects.get(sender=sender, receiver=receiver)
            follow_request.cancel()

            print(f"Follow request from {sender.username} to {receiver.username} cancelled.")

        except FriendRequest.DoesNotExist:
            print(f'No active follow request found for cancellation.')
        except Exception as e:
            print(f'Error handling follow cancel: {e}')

    def handle_follow_accept(self, user_data):
        try:
            sender_id = user_data.get('sender_id')
            receiver_id = user_data.get('receiver_id')
            sender = ContentUser.objects.get(id=sender_id)
            receiver = ContentUser.objects.get(id=receiver_id)

            follow_request = FriendRequest.objects.get(sender=sender, receiver=receiver, is_active=True)
            follow_request.accept()

            print(f"{receiver.username} accepted the follow request from {sender.username}.")

        except FriendRequest.DoesNotExist:
            print(f'No active follow request found to accept.')
        except Exception as e:
            print(f'Error handling follow accept: {e}')

    def handle_unfollow(self, user_data):
        try:
            # Adjusted to match the data keys
            user_id = user_data.get('sender_id')
            unfollowed_user_id = user_data.get('receiver_id')
            
            user = ContentUser.objects.get(id=user_id)
            unfollowed_user = ContentUser.objects.get(id=unfollowed_user_id)

            user_friend_list = FriendList.objects.get(user=user)
            unfollowed_user_friend_list = FriendList.objects.get(user=unfollowed_user)

            user_friend_list.remove_friend(unfollowed_user)
            unfollowed_user_friend_list.remove_friend(user)

            follow_request, created = FriendRequest.objects.get_or_create(
                sender=unfollowed_user, 
                receiver=user          
            )

            if created:
                follow_request.is_active = True
                follow_request.timestamp = timezone.now()
            else:
                follow_request.re_follow()

            follow_request.save()

            print(f"{user.username} has unfollowed {unfollowed_user.username}.")

        except Exception as e:
            print(f'Error handling unfollow: {e}')



        

    def handle_connection(self, user_data):
        try:
            print('Guys reached inside handlerconnect and the data is',user_data)
            event_type = user_data.get('event_type')
            if event_type == 'follow_requested':
                print('Guys the event_type is:', event_type)
                self.handle_follow_request(user_data)
            elif event_type == 'follow_cancelled':
                self.handle_follow_cancel(user_data)
            elif event_type == 'follow_accepted':
                self.handle_follow_accept(user_data)
            elif event_type == 'unfollow':
                self.handle_unfollow(user_data)
        except Exception as e:
            print(f'Error processing connection message: {e}')

            


    def handle_message(self, message):
        try:
            user_data = json.loads(message.value().decode('utf-8'))


            if message.topic() == 'user-creation':
                self.handle_user_creation(user_data)
            elif message.topic() == 'user-update':
                self.handle_user_update(user_data)
            elif message.topic() == 'connection':
                print("Guys the topic is ", message.topic())
                self.handle_connection(user_data)
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
                self.handle_message(msg)

        except KeyboardInterrupt:
            print('Consumer Stopped.')
        finally: 
            self.consumer.close()
