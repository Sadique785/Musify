from rest_framework import serializers
from friends.models import FriendList, FriendRequest



class FollowSerializer(serializers.ModelSerializer):
    class Meta:
        model = FriendRequest
        fields = ['id', 'sender', 'receiver', 'accepted_at']

    