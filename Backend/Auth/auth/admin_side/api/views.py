from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from authentication.models import CustomUser
from .serializers import AdminLoginSerializer, UserSerializer  # Adjust import as needed
 # Adjust import as needed
from django.conf import settings
from django.middleware import csrf
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated



def generate_token_with_claims(user):
    refresh = RefreshToken.for_user(user)
    
    # Custom Claims
    refresh["username"] = str(user.username)
    refresh['isAdmin'] = user.is_superuser

    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }

class AdminLoginView(APIView):
    def post(self, request):
        serializer = AdminLoginSerializer(data=request.data)

        if serializer.is_valid():
            user = serializer.validated_data['user']
            if user.is_active:
                tokens = generate_token_with_claims(user)
                response_data = {
                    "success": True,
                    "message": "Login Successful",
                    "data": {
                        "accessToken": tokens["access"],
                        "refreshToken": tokens["refresh"],
                        "user": {
                            "id": user.id,
                            "username": user.username,
                            "email": user.email,
                            "isActive": user.is_active,
                            "isSuperuser": user.is_superuser,
                        }
                    }
                }
                print(response_data)
                response = Response(response_data)

                response.set_cookie(
                    key=settings.SIMPLE_JWT['AUTH_COOKIE'],
                    value=tokens["access"],
                    expires=settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'],
                    secure=settings.SIMPLE_JWT['AUTH_COOKIE_SECURE'],
                    httponly=settings.SIMPLE_JWT['AUTH_COOKIE_HTTP_ONLY'],
                    samesite=settings.SIMPLE_JWT['AUTH_COOKIE_SAMESITE']
                )

                response.set_cookie(
                    key='refresh_token',
                    value=tokens["refresh"],
                    expires=settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'],
                    secure=settings.SIMPLE_JWT['AUTH_COOKIE_SECURE'],
                    httponly=settings.SIMPLE_JWT['AUTH_COOKIE_HTTP_ONLY'],
                    samesite=settings.SIMPLE_JWT['AUTH_COOKIE_SAMESITE']
                )
                csrf.get_token(request)

                return response
            else:
                return Response({"error": "This account is not active"}, status=status.HTTP_404_NOT_FOUND)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
class FetchUsers(APIView):
    permission_classes = [IsAuthenticated]  # Only authenticated users can access this view

    def get(self, request):
        print("FetchUsers API accessed.")  # Print when the API is accessed
        
        # Fetch all users
        users = CustomUser.objects.all()
        print(f"Total users fetched: {users.count()}")  # Print the total number of users fetched

        # Serialize the user data
        serialized_users = UserSerializer(users, many=True)
        print(f"Serialized users data: {serialized_users.data}") 
        
        for user_data in serialized_users.data:
            user_data['role'] = 'User' # Print serialized data

        # Calculate counts
        total_users = users.count()
        active_users = users.filter(is_active=True).count()
        print(f"Active users count: {active_users}")  # Print the number of active users

        # Admin's profile image
        admin_profile_image = request.user.user_profile.image.url if request.user.user_profile and request.user.user_profile.image else None
        print(f"Admin profile image: {admin_profile_image}")  # Print the admin profile image URL (or None if missing)

        # Response structure
        data = {
            "admin_profile_image": admin_profile_image,
            "total_users": total_users,
            "active_users": active_users,
            "users": serialized_users.data,
        }

        print("Response data prepared.")  # Indicate that the response data is ready
        
        return Response(data)
    

