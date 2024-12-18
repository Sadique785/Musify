# chat/consumer.py
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async
from ..models import ChatRoom, Message
from channels.layers import get_channel_layer
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from ..api.serializers import ChatRoomSerializer

User = get_user_model()


class ChatRoomConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self.user_id = self.scope['url_route']['kwargs']['user_id']
        self.room_group_name = f'chat_rooms_{self.user_id}'
        self.user = await self.get_user()


        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

        await self.send_initial_chat_rooms()


    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    @database_sync_to_async
    def get_user(self):
        return User.objects.get(id=self.user_id)

    @database_sync_to_async
    def get_user_chat_rooms(self):
        # Use a more sophisticated query to get unique chat rooms
        from django.db.models import Max

        # Get chat rooms with their most recent message timestamp
        chat_rooms = ChatRoom.objects.filter(participants=self.user).annotate(
            last_message_timestamp=Max('messages__timestamp')
        ).order_by('-last_message_timestamp').distinct()

        # Use serializer to prepare data
        serializer = ChatRoomSerializer(
            chat_rooms, 
            many=True, 
            context={'request': type('Request', (), {'user': self.user})()}
        )
        return serializer.data
    
    
    async def send_initial_chat_rooms(self):
        try:
            chat_rooms = await self.get_user_chat_rooms()
            await self.send_json({
                'type': 'initial_chat_rooms',
                'chat_rooms': chat_rooms
            })
        except Exception as e:
            await self.send_json({
                'type': 'error',
                'message': str(e)
            })

    async def receive_json(self, content):
        pass

    # Handler for messages sent to the group
    async def chat_room_update(self, event):
        await self.send_json(event['content'])

    @classmethod
    async def trigger_room_update(cls, user_id, room_id, last_message_timestamp, last_message=None):
        # Use get_channel_layer() instead of accessing cls.channel_layer
        channel_layer = get_channel_layer()
        await channel_layer.group_send(
            f'chat_rooms_{user_id}',
            {
                'type': 'chat_room_update',  # Match the handler method name
                'content': {
                    'type': 'room_order_update',
                    'room_id': room_id,
                    'last_message_timestamp': last_message_timestamp,
                    'last_message': last_message

                }
            }
        )


class PrivateMessageConsumer(AsyncJsonWebsocketConsumer):

    @database_sync_to_async
    def get_or_create_room(self):
        try:
            user1 = User.objects.get(id=self.current_user_id)
            user2 = User.objects.get(id=self.other_user_id)
            
            # Use the class method from ChatRoom model
            room, created = ChatRoom.get_or_create_chat_room(user1, user2)
            
            # If a new room is created, return a flag to trigger updates
            return {
                'room': room,
                'created': created,
                'participants': list(room.participants.all())
            }
        except (User.DoesNotExist, ValidationError):
            return None
        
    async def connect(self):
        # Get user IDs from URL route
        self.current_user_id = self.scope['url_route']['kwargs']['current_user_id']
        self.other_user_id = self.scope['url_route']['kwargs']['other_user_id']
        
        # Get or create chat room
        room_data = await self.get_or_create_room()
        if not room_data:
            await self.close()
            return
        
        self.room = room_data['room']
        
        # If a new room was created, trigger updates for both participants
        if room_data['created']:
            participants = room_data['participants']
            for participant in participants:
                # Trigger room update
                await ChatRoomConsumer.trigger_room_update(
                    participant.id, 
                    self.room.id, 
                    self.room.created_at.isoformat(),
                    {
                        'id': self.room.id,
                        'participants': [
                            {'id': p.id, 'username': p.username} 
                            for p in participants
                        ]
                    }
                )
                
                # Trigger sending initial chat rooms for each participant
                channel_layer = get_channel_layer()
                await channel_layer.group_send(
                    f'chat_rooms_{participant.id}',
                    {
                        'type': 'send_initial_chat_rooms'
                    }
                )
        
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
                await self.trigger_room_updates(message)

        
        elif message_type == 'mark_read':
            # Mark messages as read for the recipient
            await self.mark_messages_read()

            
    async def chat_message(self, event):
        await self.send_json({
            'type': 'message',
            'message': event['message']
        })


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



    async def trigger_room_updates(self, message):
        """
        Trigger room updates for all participants except the sender.
        """
        participants = await self.get_room_participants(message.room)
        
        for participant in participants:
            if participant.id != message.sender.id:
                await ChatRoomConsumer.trigger_room_update(
                    participant.id, 
                    message.room.id, 
                    message.timestamp.isoformat(),
                    {
                        'id':message.id,
                        'content':message.content,
                        'sender_id':message.sender.id,
                        'timestamp': message.timestamp.isoformat()
                    }
                )

    @database_sync_to_async
    def get_room_participants(self, room):
        """
        Get room participants in a database-safe way
        """
        return list(room.participants.all())
