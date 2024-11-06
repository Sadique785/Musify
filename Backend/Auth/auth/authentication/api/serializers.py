from rest_framework import serializers
from ..models import CustomUser, Role, UserRole, Profile, Talent, Genre
from django.contrib.auth.hashers import make_password
from django.contrib.auth import authenticate
from friends.models import FriendList, FriendRequest
from django.conf import settings




class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'is_active', 'is_staff', 'is_superuser', 'date_joined', 'last_login' ]


class RoleSerializer(serializers.ModelSerializer):
    class Meta:
            model = Role
            fields = ['id', 'name', 'created_at', 'updated_at']


class UserRoleSerializer(serializers.ModelSerializer):
    user = CustomUserSerializer(read_only=True)
    role = RoleSerializer(read_only=True)

    class Meta:
            
            model = UserRole
            fields = ['id', 'user', 'role', 'created_at', 'updated_at']
    

class UserRegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ["id", 'username', 'email', 'password']
        extra_kwargs = {"password": {"write_only": True}}


    def validate_password(self, value):
        """
        Hash the password before storing it in the session.
        """
        return make_password(value)
    
    
    def validate_email(self, value):
        if CustomUser.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already exists.")
        return value
    
    def validate_username(self, value):
        
        if CustomUser.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already exists.")
        return value

    def validate(self, data):
        """
        Additional validation can be added here.
        """
        return data
    

    


class VerifyEmailSerializer(serializers.Serializer):
     email = serializers.EmailField()
     otp = serializers.CharField()

class GoogleLoginSerializer(serializers.Serializer):
    access_token = serializers.CharField()
    print(access_token)

    def validate_access_token(self, value):
        if not value:
            raise serializers.ValidationError("Access token is required.")
        return value



class UserLoginSerializer(serializers.Serializer):
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

        user = authenticate(username=email, password=password)
        if user is None:
            raise serializers.ValidationError('Invalid password')

        if not user.email_verified:
            raise serializers.ValidationError('Email address not verified.')

        data['user'] = user
        return data
    


class ProfileImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ['user', 'image']

class ProfileSerializer(serializers.ModelSerializer):
    talents = serializers.ListField(child=serializers.CharField(), write_only=True)
    genres = serializers.ListField(child=serializers.CharField(), write_only=True)
    username = serializers.CharField(source='user.username', write_only=True) 

    class Meta:
        model = Profile
        fields = ['username', 'location', 'date_of_birth', 'gender', 'talents', 'genres', 'bio']  # Ensure 'username' is included



    def update(self, instance, validated_data):
        print(validated_data, 'Validated Data')
        # Extract username and update user
        username = validated_data.pop('user', {}).get('username')
        if username:
            instance.user.username = username
            instance.user.save()


        instance.location = validated_data.get('location', instance.location)
        instance.date_of_birth = validated_data.get('date_of_birth', instance.date_of_birth)
        instance.gender = validated_data.get('gender', instance.gender)
        instance.bio = validated_data.get('bio', instance.bio)
        
        # Process talents
        talent_names = validated_data.get('talents', [])

        if talent_names:
            talents = [Talent.objects.get_or_create(name=name)[0] for name in talent_names]
            instance.talents.set(talents)  # Replace with new talents

        # Process genres
        genre_names = validated_data.get('genres', [])
        if genre_names:
            genres = [Genre.objects.get_or_create(name=name)[0] for name in genre_names]
            instance.genres.set(genres)


        
        instance.save()
        return instance




class TalentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Talent
        fields = ['name']

class GenreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Genre
        fields = ['name']



class ProfileViewSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username')  # Accessing the username from the related `user`
    user_id = serializers.IntegerField(source='user.id')
    email = serializers.EmailField(source='user.email')
    image_url = serializers.SerializerMethodField()  
    talents = serializers.SerializerMethodField()
    genres = serializers.SerializerMethodField()
    following_count = serializers.SerializerMethodField()  
    followers_count = serializers.SerializerMethodField()  
    follow_status = serializers.SerializerMethodField()
    is_blocked = serializers.SerializerMethodField()


    class Meta:
        model = Profile
        fields = [
            'username', 
            'user_id',
            'email',
            'image_url', 
            'location', 
            'gender', 
            'date_of_birth', 
            'talents', 
            'genres', 
            'following_count',  
            'followers_count', 
            'follow_status',
            'is_blocked',
        ]

    def get_is_blocked(self, obj):
        print(f'THis is the get_is_blocked function {self.context.get('is_blocked')}')
        return self.context.get("is_blocked", False)
    
    def get_image_url(self, obj):
        if obj.image:
            return f"{settings.MEDIA_URL}{obj.image}"
        return None

    def get_talents(self, obj):
        return [talent.name for talent in obj.talents.all()]

    def get_genres(self, obj):
        return [genre.name for genre in obj.genres.all()]
    
    def get_following_count(self, obj):
        friend_list = FriendList.objects.filter(user=obj.user).first()  
        if friend_list:
            return friend_list.following_count()  # Call the method from FriendList if it exists
        else:
            return FriendRequest.get_following_count(obj.user)  # Directly call the static method

    def get_followers_count(self, obj):
        friend_list = FriendList.objects.filter(user=obj.user).first()  
        if friend_list:
            return friend_list.followers_count()  # Call the method from FriendList if it exists
        else:
            return FriendRequest.get_followers_count(obj.user)

    def get_follow_status(self, obj):
        request = self.context.get('request')
        
        if not request or not request.user.is_authenticated:
            print('it is returning from here')
            return 'follow'

        profile_user = obj.user
        requesting_user = request.user

        if requesting_user == profile_user:
            return 'same_user'

        # Check if already friends
        if FriendList.objects.filter(user=profile_user, friends=requesting_user).exists():
            print('Already friends, returning unfollow')
            return 'unfollow'

        # Check follow request statuses
        following_request = FriendRequest.objects.filter(sender=requesting_user, receiver=profile_user, is_active=True).exists()
        following_profile_user = FriendRequest.objects.filter(sender=profile_user, receiver=requesting_user, is_active=True).exists()
        
        # Debug output for request states
        print(f"following_request (Micky following Dhinu-21): {following_request}")
        print(f"following_profile_user (Dhinu-21 following Micky): {following_profile_user}")

        if following_request and not following_profile_user:
            return 'following'
        elif following_profile_user and not following_request:
            return 'follow back'
        elif following_request and following_profile_user:
            return 'unfollow'
        else:
            return 'follow'
        
    def to_representation(self, instance):
        """
        Customize representation to restrict data if the profile is blocked.
        """
        rep = super().to_representation(instance)
        if self.context.get("is_blocked"):
            return {
                "username": rep["username"],
                "user_id": rep["user_id"],
                "image_url": rep["image_url"],
                "is_blocked": True,
            }
        return rep


class BlockUserSerializer(serializers.Serializer):
    user_id = serializers.IntegerField()

    def validate_user_id(self, value):
        print(f"Validating user_id: {value}")
        try:
            user_to_block = CustomUser.objects.get(id=value)
            print("User to block/unblock found:", user_to_block)
        except CustomUser.DoesNotExist:
            print("User to block/unblock does not exist")
            raise serializers.ValidationError("User not found.")
        return value

    def save(self, current_user, action):
        print("Updating block relationship based on action")
        user_to_block = CustomUser.objects.get(id=self.validated_data['user_id'])
        
        if action == 'block':
            current_user.blocked_users.add(user_to_block)
            print(f"Blocked user {user_to_block} for {current_user}")
        elif action == 'unblock':
            current_user.blocked_users.remove(user_to_block)
            print(f"Unblocked user {user_to_block} for {current_user}")
        
        current_user.save()
        print("Blocked users updated in the database")