from rest_framework import serializers
from ..models import CustomUser, Role, UserRole
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

    def validate(self, data):
        """
        Additional validation can be added here.
        """
        return data
    

class VerifyEmailSerializer(serializers.Serializer):
     email = serializers.EmailField()
     otp = serializers.CharField()




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

            
               
        