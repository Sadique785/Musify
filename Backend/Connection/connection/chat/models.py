from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError

class ChatRoom(models.Model):
    participants = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='chat_rooms')
    created_at = models.DateTimeField(auto_now_add=True)
    
    def clean(self):
        # This will run during full_clean()
        if self.pk:  # if the room already exists
            if self.participants.count() > 2:
                raise ValidationError("ChatRoom cannot have more than 2 participants")
    
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Check for duplicate rooms after saving
        if self.participants.count() == 2:
            users = list(self.participants.all())
            duplicate_rooms = ChatRoom.objects.filter(
                participants=users[0]
            ).filter(
                participants=users[1]
            ).exclude(pk=self.pk)
            
            if duplicate_rooms.exists():
                self.delete()
                raise ValidationError("A chat room already exists for these users")

    @classmethod
    def get_or_create_chat_room(cls, user1, user2):
        # Look for existing chat room
        chat_rooms = cls.objects.filter(participants=user1).filter(participants=user2)
        
        if chat_rooms.exists():
            return chat_rooms.first(), False
        
        # Create new chat room if none exists
        chat_room = cls.objects.create()
        chat_room.participants.add(user1, user2)
        return chat_room, True

    def __str__(self):
        participants_str = ' & '.join([user.username for user in self.participants.all()])
        return f"Chat between {participants_str}"

class Message(models.Model):
    room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sent_messages')
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['timestamp']
    
    def __str__(self):
        return f"Message from {self.sender.username} at {self.timestamp}"