from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from authentication.models import CustomUser, Profile
from .serializers import AdminLoginSerializer, UserSerializer  # Adjust import as needed
 # Adjust import as needed
from django.conf import settings
from django.middleware import csrf
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework_simplejwt.tokens import RefreshToken, TokenError
from django.contrib.auth import logout
from django.shortcuts import get_object_or_404
from django.contrib.sessions.models import Session
from django.utils import timezone
from django.contrib.auth import get_user_model






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
    authentication_classes = []  
    permission_classes = []  

    def post(self, request):
        serializer = AdminLoginSerializer(data=request.data)

        if serializer.is_valid():
            user = serializer.validated_data['user']
            if user.is_active:
                tokens = generate_token_with_claims(user)
                csrf_token = csrf.get_token(request)

                response_data = {
                    "success": True,
                    "message": "Login Successful",
                    "data": {
                        "accessToken": tokens["access"],
                        "refreshToken": tokens["refresh"],
                        "csrfToken": csrf_token,
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

                # No need to set access and refresh tokens in the cookie
                # Only set the CSRF token as a cookie if required
                response.set_cookie(
                    key='csrftoken',
                    value=csrf_token,
                    httponly=False,  # CSRF cookie shouldn't be HTTP-only
                    samesite=settings.SIMPLE_JWT['AUTH_COOKIE_SAMESITE']
                )

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
    


class FetchAdminProfileImage(APIView):
    permission_classes = [IsAuthenticated]


    def get(self, request):
        
        try:
            profile = request.user.user_profile
            admin_profile_image = profile.image.url if profile.image else None

            if admin_profile_image:
                return Response({"profileImage":admin_profile_image}, status=status.HTTP_200_OK)
            else:
                return Response({"profileImage":None}, status=status.HTTP_404_NOT_FOUND)
            
        except Profile.DoesNotExist:

            return Response({"error": "Profile does not exist for this user."}, status=status.HTTP_404_NOT_FOUND)
                
class FetchUserDetails(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, id):
        try:

            

            user = get_object_or_404(CustomUser, id=id)
            print('user here',user)
            profile = get_object_or_404(Profile, user=user)
            print(profile)
            admin_profile_image = request.user.user_profile.image.url if request.user.user_profile and request.user.user_profile.image else None



            user_data = {
                "id":user.id,
                "username":user.username,
                "email":user.email,
                "is_active":user.is_active,
                "is_staff":user.is_staff,
                "last_login":user.last_login,
                "is_online": profile.is_online,
                "friends_count": profile.get_friends_no(),
                "following_count": profile.following.count(),
                "followers_count": profile.followers.count(),
                "blocked_users_count": profile.blocked_users.count(),
                "talents": [talent.name for talent in profile.talents.all()],
                "genres": [genre.name for genre in profile.genres.all()],
                "userImage":profile.image.url,
                'admin_profile_image':admin_profile_image,
            }

            return Response(user_data, status=status.HTTP_200_OK)
        except CustomUser.DoesNotExist:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)
        except Profile.DoesNotExist:
            return Response({"error": "Profile does not exist for this user."}, status=status.HTTP_404_NOT_FOUND)


class MakeAdminView(APIView):
    permission_classes = [IsAuthenticated]  # Ensure user is authenticated and an admin

    def post(self, request, user_id):
        print(request.headers)
        try:

            user = CustomUser.objects.get(id=user_id) 
            print(user)
            user.is_staff = True  
            user.save() 
            return Response({"message": "User has been made an admin."}, status=status.HTTP_200_OK)
        except CustomUser.DoesNotExist:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

class BlockUserView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser] 

    def post(self, request, user_id):
        try:
            user = CustomUser.objects.get(id=user_id)  
            user.is_active = not user.is_active  
            user.save() 

            if not user.is_active:
                sessions = Session.objects.filter(expire_date__gte=timezone.now())  # Only valid sessions
                deleted_sessions = 0  
                print('sessions here', sessions)

                for session in sessions:
                    session_data = session.get_decoded()
                    if session_data.get('_auth_user_id') == str(user.id):  # User ID stored as string in sessions
                        session.delete()  
                        deleted_sessions += 1
                print('deleted sessions:', deleted_sessions, user)

            if user.is_active:
                return Response({"message": "User has been unblocked."}, status=status.HTTP_200_OK)
            else:
                return Response({"message": "User has been blocked."}, status=status.HTTP_200_OK)
                
        except CustomUser.DoesNotExist:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)


class AdminLogoutView(APIView):

    authentication_classes = []  
    permission_classes = []  

    def post(self, request):
        print(request.headers, 'header')
        print('Admin logout initiated')

        try:
            # Get refresh token from the cookies or headers
            refresh_token = request.COOKIES.get('refresh_token')
            print(f"Refresh token: {refresh_token}")

            if refresh_token:
                try:
                    token = RefreshToken(refresh_token)
                    print(f"Token before blacklisting: {token}")
                    token.blacklist()  # Blacklist the refresh token
                except TokenError as e:
                    print(f"Token error (invalid or expired): {str(e)}")

            # Log out the admin (invalidate the session, if any)
            logout(request)

            # Create the response and delete the cookies
            response = Response({"message": "Logged out successfully"}, status=status.HTTP_200_OK)
            response.delete_cookie('csrftoken')  # Clear the refresh token cookie
            # response.delete_cookie('access_token')  # Clear access token if stored in cookies
            print('Successfully logged out and cleared cookies')

            return response

        except Exception as e:
            print(f"Logout failed: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)