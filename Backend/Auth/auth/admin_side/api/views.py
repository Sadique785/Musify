from rest_framework.views import APIView
from django.db.models.functions import TruncMonth
from django.db.models import Count
from django.utils import timezone
from rest_framework.response import Response
from rest_framework import status
from authentication.models import CustomUser, Profile, Role, UserRole
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
from datetime import timedelta
from collections import OrderedDict
from dateutil.relativedelta import relativedelta
    







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
                            "isSuperuser": user.is_staff,
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
    permission_classes = [IsAuthenticated]

    def get(self, request):
        print("FetchUsers API accessed.")
        
        users = CustomUser.objects.filter(is_superuser=False).exclude(id=request.user.id)
        print(f"Total users fetched: {users.count()}")

        serialized_users = UserSerializer(users, many=True)
        print(f"Serialized users data: {serialized_users.data}")
        
        for user_data in serialized_users.data:
            user_data['role'] = 'User'

        total_users = users.count()
        active_users = users.filter(is_active=True).count()
        print(f"Active users count: {active_users}")

        # Updated to check image_url first
        admin_profile = request.user.user_profile
        admin_profile_image = None
        if admin_profile:
            admin_profile_image = admin_profile.image_url if admin_profile.image_url else (
                admin_profile.image.url if admin_profile.image else None
            )
        print(f"Admin profile image: {admin_profile_image}")

        data = {
            "admin_profile_image": admin_profile_image,
            "total_users": total_users,
            "active_users": active_users,
            "users": serialized_users.data,
        }

        print("Response data prepared.")
        return Response(data)
        
    


class FetchAdminProfileImage(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            profile = request.user.user_profile
            # First try to get image_url, if not found fall back to image.url
            profile_image = profile.image_url if profile.image_url else profile.image.url

            if profile_image:
                return Response({"profileImage": profile_image}, status=status.HTTP_200_OK)
            else:
                return Response({"profileImage": None}, status=status.HTTP_404_NOT_FOUND)
            
        except Profile.DoesNotExist:
            return Response(
                {"error": "Profile does not exist for this user."}, 
                status=status.HTTP_404_NOT_FOUND
            )
        

class FetchUserDetails(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, id):
        try:

            

            user = get_object_or_404(CustomUser, id=id)
            print('user here',user)
            profile = get_object_or_404(Profile, user=user)
            print(profile)
            admin_profile = request.user.user_profile
            admin_profile_image = None
            if admin_profile:
                admin_profile_image = admin_profile.image_url if admin_profile.image_url else (
                    admin_profile.image.url if admin_profile.image else None
                )



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
                "userImage": profile.image_url if profile.image_url else profile.image.url,
                'admin_profile_image': admin_profile_image,
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

            admin_role, _ = Role.objects.get_or_create(name="admin")
            user_role, _ = Role.objects.get_or_create(name="user")

            if user.is_staff:
                user.is_staff = False
                user.save()

                UserRole.objects.update_or_create(user=user, defaults={'role': user_role})

                message = "User has been demoted to a regular user."
            else:
                user.is_staff = True
                user.save()

                UserRole.objects.update_or_create(user=user, defaults={'role': admin_role})

                message = "User has been promoted to admin." 
            return Response({"message": message}, status=status.HTTP_200_OK)
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
            refresh_token = request.COOKIES.get('refresh_token')
            print(f"Refresh token: {refresh_token}")

            if refresh_token:
                try:
                    token = RefreshToken(refresh_token)
                    print(f"Token before blacklisting: {token}")
                    token.blacklist() 
                except TokenError as e:
                    print(f"Token error (invalid or expired): {str(e)}")

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
        

class UserGrowthDataView(APIView):
    """
    View to get user growth data for the past 6 months.
    Returns monthly data with total and active users, including months with zero data.
    """
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        end_date = timezone.now()
        start_date = end_date - timedelta(days=180)

        # Initialize all 6 months properly
        all_months = OrderedDict()
        current_month = end_date
        for _ in range(6):
            month_str = current_month.strftime('%b')
            all_months[month_str] = {'month': month_str, 'totalUsers': 0, 'activeUsers': 0}
            current_month = current_month - relativedelta(months=1)  # Proper month subtraction

        # Get total users by month
        total_users = (
            CustomUser.objects
            .filter(date_joined__gte=start_date)
            .annotate(month=TruncMonth('date_joined'))
            .values('month')
            .annotate(total_users=Count('id'))
            .order_by('month')
        )

        # Get active users by month
        active_users = (
            CustomUser.objects
            .filter(last_login__gte=start_date)
            .annotate(month=TruncMonth('last_login'))
            .values('month')
            .annotate(active_users=Count('id'))
            .order_by('month')
        )

        # Update with actual data where available
        for entry in total_users:
            month_str = entry['month'].strftime('%b')
            if month_str in all_months:
                all_months[month_str]['totalUsers'] = entry['total_users']

        for entry in active_users:
            month_str = entry['month'].strftime('%b')
            if month_str in all_months:
                all_months[month_str]['activeUsers'] = entry['active_users']

        return Response(list(reversed(all_months.values()))) 