from rest_framework import serializers
from django.contrib.auth import authenticate
from authentication.models import *

class AdminLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        email = data.get('email').strip()
        password = data.get('password').strip()

        if not email or not password:
            raise serializers.ValidationError('Both email and password are required')

        user = CustomUser.objects.filter(email=email).first()

        if not user:
            raise serializers.ValidationError('Invalid email address')

        if not user.is_active:
            raise serializers.ValidationError('User account is inactive')

        # Check if the user is a superuser
        if not user.is_superuser:
            raise serializers.ValidationError('You do not have admin privileges.')

        user = authenticate(username=email, password=password)
        if user is None:
            raise serializers.ValidationError('Invalid password')

        data['user'] = user
        return data
    


class TalentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Talent
        fields = ['name']

class GenreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Genre
        fields = ['name']

class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ['name']



class ProfileSerializer(serializers.ModelSerializer):
    profile_image = serializers.ImageField(source='image', allow_null=True, required=False)
    talents = TalentSerializer(many=True, read_only=True)
    genres = GenreSerializer(many=True, read_only=True)
    friends_count = serializers.IntegerField(source='get_friends_no', read_only=True)

    class Meta:
        model = Profile
        fields = [
            'name', 'location', 'is_online', 'bio', 'date_of_birth', 
            'gender', 'profile_image', 'talents', 'genres', 'friends_count'
        ]

class UserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)
    is_admin = serializers.BooleanField(source='is_staff', read_only=True)
    last_logged_in = serializers.DateTimeField(source='last_login', format='%Y-%m-%d', allow_null=True)

    class Meta:
        model = CustomUser
        fields = [
            'id', 'username', 'email', 'is_active', 'is_admin', 
            'last_logged_in', 'date_joined', 'profile'
        ]


