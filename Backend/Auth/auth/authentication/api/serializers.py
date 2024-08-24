from rest_framework import serializers
from ..models import CustomUser, Role, UserRole
from django.contrib.auth.hashers import make_password



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