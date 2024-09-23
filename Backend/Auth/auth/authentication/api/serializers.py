from rest_framework import serializers
from ..models import CustomUser, Role, UserRole, Profile, Talent, Genre
from django.contrib.auth.hashers import make_password
from django.contrib.auth import authenticate



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
    talents = serializers.SerializerMethodField()
    genres = serializers.SerializerMethodField()
    username = serializers.CharField(source='user.username', write_only=True)   

    class Meta:
        model = Profile
        fields = ['username', 'location', 'date_of_birth', 'gender', 'talents', 'genres', 'bio']  # Ensure 'username' is included

    def get_talents(self, obj):
        return [talent.name for talent in obj.talents.all()]

    def get_genres(self, obj):
        return [genre.name for genre in obj.genres.all()]

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
        talent_names = validated_data.pop('talents', [])
        talents = [Talent.objects.get_or_create(name=name)[0] for name in talent_names]
        instance.talents.set(talents)

        # Process genres
        genre_names = validated_data.pop('genres', [])
        genres = [Genre.objects.get_or_create(name=name)[0] for name in genre_names]
        instance.genres.set(genres)

        # Update other fields
        # for attr, value in validated_data.items():
        #     setattr(instance, attr, value)
        
        instance.save()
        return instance



    