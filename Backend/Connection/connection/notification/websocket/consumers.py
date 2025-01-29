from channels.generic.websocket import  AsyncWebsocketConsumer
import json
from django.contrib.auth import get_user_model
from channels.db import database_sync_to_async
from ..models import Notification
from channels.exceptions import StopConsumer

User = get_user_model()




class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user_id = self.scope['url_route']['kwargs']['user_id']
        self.user_group_name = f'notifications_{self.user_id}'

        await self.channel_layer.group_add(
            self.user_group_name,
            self.channel_name
        )

        await self.accept()

        print('WS Connected')

        notifications = await self.send_existing_notifications()
        print('NOitfied', notifications)

        for notification in notifications:
            await self.send(text_data=json.dumps(notification))

    


    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.user_group_name,
            self.channel_name
        )

        raise StopConsumer()


    @database_sync_to_async
    def send_existing_notifications(self):
        notifications = Notification.objects.filter(
            recipient_id=self.user_id, 
            is_read=False
        ).order_by('-created_at')[:20]
        
        notification_list = [{
            'type': 'existing_notification',
            'notification': {
                'id': notif.id,
                'sender_username': notif.sender_username,
                'notification_type': notif.notification_type,
                'created_at': notif.created_at.isoformat(),
                'post_id': notif.post_id,
                'comment_id': notif.comment_id,
                'sender_id': notif.sender_id,
                'is_read':notif.is_read,

            }
        } for notif in notifications]
        
        return notification_list


    def receive(self, text_data):
        self.send(text_data=text_data)


    async def notification_message(self, event):
        # Send notification to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'new_notification',
            'notification': event['notification']
        }))