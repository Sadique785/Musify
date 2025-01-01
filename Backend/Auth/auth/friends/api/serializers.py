from rest_framework import serializers
from friends.models import FriendList, FriendRequest
from authentication.models import CustomUser, Profile



class FollowSerializer(serializers.ModelSerializer):
    class Meta:
        model = FriendRequest
        fields = ['id', 'sender', 'receiver', 'accepted_at']

    

class UserSerializer(serializers.ModelSerializer):
    profile_image = serializers.SerializerMethodField()
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'profile_image']

    def get_profile_image(self, obj):
        try:
            profile = Profile.objects.get(user=obj)
            return profile.image.url if profile.image else None
        except Profile.DoesNotExist:
            return None


class UnfollowedUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email']