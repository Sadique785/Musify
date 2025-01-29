from rest_framework import serializers
from chat.models import ChatRoomModel, Message
from django.contrib.auth import get_user_model


User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'image_url']

class ChatRoomSerializer(serializers.ModelSerializer):
    participants = UserSerializer(many=True, read_only=True)
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()

    class Meta:
        model = ChatRoomModel
        fields = ['id', 'participants', 'created_at', 'last_message', 'unread_count']

    def get_last_message(self, obj):
        last_message = obj.messages.last()
        if last_message:
            return {
                'content': last_message.content,
                'timestamp': last_message.timestamp.isoformat(),  # Convert to ISO 8601 string
                'sender': last_message.sender.username
            }
        return None

    def get_unread_count(self, obj):
        user = self.context['request'].user
        return obj.messages.filter(is_read=False).exclude(sender=user).count()

    def to_representation(self, instance):
        # Convert created_at to ISO 8601 string
        representation = super().to_representation(instance)
        representation['created_at'] = instance.created_at.isoformat()
        return representation

class MessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)

    class Meta:
        model = Message
        fields = ['id', 'sender', 'content', 'timestamp', 'is_read']