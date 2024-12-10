# chat/consumer.py
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async
from ..models import ChatRoom, Message
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError


User = get_user_model()



class ChatRoomConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self.user_id = self.scope['url_route']['kwargs']['user_id']
        self.room_group_name = f'chat_rooms_{self.user_id}'

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive_json(self, content):
        pass

    # Handler for messages sent to the group
    async def chat_room_update(self, event):
        await self.send_json(event['content'])


class PrivateMessageConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        # Get user IDs from URL route
        self.current_user_id = self.scope['url_route']['kwargs']['current_user_id']
        self.other_user_id = self.scope['url_route']['kwargs']['other_user_id']
        
        # Get or create chat room
        self.room = await self.get_or_create_room()
        if not self.room:
            await self.close()
            return
            
        # Set room group name
        self.room_group_name = f'chat_{self.room.id}'

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.mark_messages_read()


        await self.accept()
        
        # Send existing messages
        await self.send_existing_messages()

    async def disconnect(self, close_code):
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )

    async def receive_json(self, content):
        message_type = content.get('type', 'message')
        
        if message_type == 'message':
            # Save the message to database
            message = await self.save_message(content['message'])
            
            if message:
                # Send message to room group
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'chat_message',
                        'message': {
                            'id': message.id,
                            'content': message.content,
                            'sender_id': message.sender.id,
                            'timestamp': message.timestamp.isoformat(),
                            'is_read': False  # Always set to False when new message is sent
                        }
                    }
                )
        
        elif message_type == 'mark_read':
            # Mark messages as read for the recipient
            await self.mark_messages_read()

            
    async def chat_message(self, event):
        await self.send_json({
            'type': 'message',
            'message': event['message']
        })

    @database_sync_to_async
    def get_or_create_room(self):
        try:
            user1 = User.objects.get(id=self.current_user_id)
            user2 = User.objects.get(id=self.other_user_id)
            room, created = ChatRoom.get_or_create_chat_room(user1, user2)
            return room
        except (User.DoesNotExist, ValidationError):
            return None

    @database_sync_to_async
    def save_message(self, content):
        try:
            sender = User.objects.get(id=self.current_user_id)
            return Message.objects.create(
                room=self.room,
                sender=sender,
                content=content
            )
        except User.DoesNotExist:
            return None
        
    @database_sync_to_async
    def mark_messages_read(self):
        # Update unread messages in this room from the other user
        Message.objects.filter(
            room=self.room,
            sender_id=self.other_user_id,  # Messages from the other user
            is_read=False  # Only unread messages
        ).update(is_read=True)

    @database_sync_to_async
    def get_existing_messages(self):
        messages = Message.objects.filter(room=self.room).select_related('sender')
        return [{
            'id': msg.id,
            'content': msg.content,
            'sender_id': msg.sender.id,
            'timestamp': msg.timestamp.isoformat(),
            'is_read': msg.is_read
        } for msg in messages]

    async def send_existing_messages(self):
        messages = await self.get_existing_messages()
        await self.send_json({
            'type': 'history',
            'messages': messages
        })
