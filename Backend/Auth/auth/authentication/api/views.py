
import requests
from django.conf import settings
from rest_framework import status
from django.middleware import csrf
from django.contrib.auth import logout
from datetime import datetime, timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.utils.decorators import method_decorator
from django.shortcuts import get_object_or_404, render
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from authentication.api.services.send_otp import send_otp
from django.views.decorators.csrf import ensure_csrf_cookie 
from authentication.models import CustomUser, Profile, Talent, Genre
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
from .serializers import UserRegisterSerializer, VerifyEmailSerializer, UserLoginSerializer, ProfileImageSerializer, ProfileSerializer, ProfileViewSerializer,  GoogleLoginSerializer
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from authentication.kafka_utils.producer import KafkaProducerService



# Create your views here.


def generate_token_with_claims(user):
    refresh = RefreshToken.for_user(user)
    
    # Custom Claims
    refresh["username"] = str(user.username)
    refresh['isAdmin'] = user.is_superuser

    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }



class RegisterView(APIView):
    def post(self, request):
        serializer = UserRegisterSerializer(data = request.data)


        if serializer.is_valid():
            email = serializer.data["email"]
            otp = send_otp(email)

            print(email)
            print(otp)

            request.session['email_otp'] = otp
            request.session['email_for_otp'] = email
            request.session['user_data'] = serializer.validated_data
            request.session.save()
            print("Session ID:", request.session.session_key)



            content = {"message": "An OTP has been sent to your email"}
            return Response(content, status=status.HTTP_201_CREATED)
        else:
            error_messages = []
            for field, errors in serializer.errors.items():
                for error in errors:
                    if field == 'email' and 'unique' in error:
                        error_messages.append("Email already exists")
                    elif field == 'password' and 'min_length' in error:
                        error_messages.append("Password must be at least 8 characters long")
                    else:
                        error_messages.append(f"{field.capitalize()}: {error}")
                
            content = {"message": error_messages}
            return Response(content, status=status.HTTP_400_BAD_REQUEST)


class VerifyOtp(APIView):
    def post(self, request):
        serializer = VerifyEmailSerializer(data = request.data)
        if serializer.is_valid():
            print("Session ID:", request.session.session_key)

            email = serializer.validated_data.get("email")
            otp = serializer.validated_data.get("otp")

            session_otp = request.session.get('email_otp')
            session_email = request.session.get('email_for_otp')

            print('Session', session_email, session_otp)
            print('Send', email, otp)


            if session_email != email:
                return Response({"message": 'Invalid email address'}, status=status.HTTP_400_BAD_REQUEST)

            if session_otp != otp:
                return Response({'message': "Invalid Otp"}, status=status.HTTP_400_BAD_REQUEST)
            

            user_data = request.session.get('user_data')
            if user_data:
                print('userdata to send', user_data)
                user = CustomUser.objects.create(**user_data, email_verified=True)
                user.save()
                print('reached here')

                profile, created = Profile.objects.get_or_create(user=user)
                image_url = profile.image.url if profile.image else None 

                content_user_data = {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'is_admin': user.is_staff,  # Map is_staff to is_admin
                    'created_at': user.created_at.isoformat(),  # Convert to ISO format
                    'updated_at': user.updated_at.isoformat(),  # Convert to ISO format
                    'image_url': image_url
                }

                print('this is the new user_data', content_user_data)
                

                kafka_producer = KafkaProducerService(config={})  # Add actual config here
                kafka_producer.send_user_creation_message(content_user_data)


                request.session.pop('email_otp', None)
                request.session.pop('email_for_otp', None)
                request.session.pop('user_data', None)

                return Response({"message":"Email verified and account created You can login now."}, status=status.HTTP_200_OK)
            else:
                return Response({"message":"No user data found. Please register again."}, status=status.HTTP_400_BAD_REQUEST)
                
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)




class LoginView(APIView):
    authentication_classes = []  
    permission_classes = []  
    def post(self, request):
        print(request.headers, 'header')
        serializer = UserLoginSerializer(data=request.data)

        if serializer.is_valid():
            user = serializer.validated_data['user']
            if user.is_active:
                tokens = generate_token_with_claims(user)
                csrf_token = csrf.get_token(request)

                request.session['user_id'] =  user.id
                response_data = {
                    "success":True,
                    "message":"Login Successful",
                    "data":{
                        "accessToken": tokens["access"],
                        "refreshToken": tokens["refresh"],
                        "csrfToken":csrf_token,
                        "user":{
                            "id":user.id,
                            "username":user.username,
                            "email":user.email,
                            "isActive":user.is_active,
                            "isSuperuser":user.is_superuser,
                        }
                    }

                }
                response = Response(response_data)

                # response.set_cookie(
                # key=settings.SIMPLE_JWT['AUTH_COOKIE'],
                # value=tokens["access"],
                # expires=settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'],
                # secure=settings.SIMPLE_JWT['AUTH_COOKIE_SECURE'],
                # httponly=settings.SIMPLE_JWT['AUTH_COOKIE_HTTP_ONLY'],
                # samesite=settings.SIMPLE_JWT['AUTH_COOKIE_SAMESITE']
                # )

                # response.set_cookie(
                #     key='refresh_token',  
                #     value=tokens["refresh"],
                #     expires=settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'],
                #     secure=settings.SIMPLE_JWT['AUTH_COOKIE_SECURE'],
                #     httponly=settings.SIMPLE_JWT['AUTH_COOKIE_HTTP_ONLY'],
                #     samesite=settings.SIMPLE_JWT['AUTH_COOKIE_SAMESITE']
                # )
                
                response.set_cookie(
                    key='csrftoken',
                    value=csrf_token,
                    httponly=False,  
                    samesite=settings.SIMPLE_JWT['AUTH_COOKIE_SAMESITE']
                )
                
                
                return response
            else:
                return Response({"error": "This account is not active"}, status=status.HTTP_404_NOT_FOUND)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        
class GoogleLoginView(APIView):
    def post(self, request):
        print(request.data)
        serializer = GoogleLoginSerializer(data=request.data)
        
        if serializer.is_valid():
            # Get the access token from the validated data
            access_token = serializer.validated_data['access_token']
            user_info_url = 'https://www.googleapis.com/oauth2/v3/userinfo'
            print('reached here')
            print(access_token, 'Token here')
            
            # Fetch user info from Google
            response = requests.get(user_info_url, headers={'Authorization': f'Bearer {access_token}'})
            if response.status_code != 200:
                print('errror')
                return Response({"error": "Invalid token"}, status=status.HTTP_400_BAD_REQUEST)
            
            user_data = response.json()
            print(user_data, "Userdata received")
            email = user_data.get('email')

            user, created = CustomUser.objects.get_or_create(email=email, defaults={
                'username': email.split('@')[0],
                'is_active': True,
            })


            if created:

                Profile.objects.create(user=user)

            print(user, 'userhere')

            tokens = generate_token_with_claims(user)
            csrf_token = csrf.get_token(request)
            request.session['user_id'] = user.id
            print(tokens)

         
            response_data = {
                "success": True,
                "message": "Login Successful",
                "data": {
                    "accessToken": tokens["access"],
                    "refreshToken": tokens["refresh"],
                    "csrfToken":csrf_token,
                    "user": {
                        "id": user.id,
                        "username": user.username,
                        "email": user.email,
                        "isActive": user.is_active,
                    }
                }
            }
            
            response = Response(response_data)

            # Set the cookies
            # response.set_cookie(
            #     key=settings.SIMPLE_JWT['AUTH_COOKIE'],
            #     value=tokens["access"],
            #     expires=settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'],
            #     secure=settings.SIMPLE_JWT['AUTH_COOKIE_SECURE'],
            #     httponly=settings.SIMPLE_JWT['AUTH_COOKIE_HTTP_ONLY'],
            #     samesite=settings.SIMPLE_JWT['AUTH_COOKIE_SAMESITE']
            # )

            # response.set_cookie(
            #     key='refresh_token',
            #     value=tokens["refresh"],
            #     expires=settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'],
            #     secure=settings.SIMPLE_JWT['AUTH_COOKIE_SECURE'],
            #     httponly=settings.SIMPLE_JWT['AUTH_COOKIE_HTTP_ONLY'],
            #     samesite=settings.SIMPLE_JWT['AUTH_COOKIE_SAMESITE']
            # )
            response.set_cookie(
                key='csrftoken',
                value=csrf_token,
                httponly=False,  
                samesite=settings.SIMPLE_JWT['AUTH_COOKIE_SAMESITE']
            )

            return response
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        


class TokenRefresherView(APIView):

    permission_classes = [AllowAny]
    authentication_classes = []

    @method_decorator(ensure_csrf_cookie)
    def post(self, request, *args, **kwargs):

        print("reached hereeeee")
        

        refresh_token = request.COOKIES.get(settings.SIMPLE_JWT['AUTH_COOKIE_REFRESH'])

        if not refresh_token:
            return Response({'detail': 'Refresh token not provided.'}, status=status.HTTP_401)
        

        try:
            token = RefreshToken(refresh_token)

            if token['exp'] < datetime.now(tz=timezone.utc).timestamp():
                return Response({'detail': 'Refresh token expired'}, status=status.HTTP_401)



            new_access_token = str(token.access_token)

            response = Response({"access":new_access_token, 'refresh':str(token)}, status=status.HTTP_200_OK)

            # response.set_cookie(
            #     key=settings.SIMPLE_JWT['AUTH_COOKIE'],
            #     value=new_access_token,
            #     expires=settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'],
            #     secure=settings.SIMPLE_JWT['AUTH_COOKIE_SECURE'],
            #     httponly=settings.SIMPLE_JWT['AUTH_COOKIE_HTTP_ONLY'],
            #     samesite=settings.SIMPLE_JWT['AUTH_COOKIE_SAMESITE']
            # )

            # response.set_cookie(
            #     key='refresh_token',
            #     value=str(token),
            #     expires=settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'],
            #     secure=settings.SIMPLE_JWT['AUTH_COOKIE_SECURE'],
            #     httponly=settings.SIMPLE_JWT['AUTH_COOKIE_HTTP_ONLY'],
            #     samesite=settings.SIMPLE_JWT['AUTH_COOKIE_SAMESITE']
            # )

            print(new_access_token, 'This is the new access token')

            return response

        except (TokenError, InvalidToken) as e :
            return Response({"detail": "Invalid or expired refresh token."}, status=status.HTTP_401_UNAUTHORIZED)




        





class LogoutView(APIView):

    authentication_classes = []  
    permission_classes = []  

    def post(self, request):
        print(request.headers, 'header')

        print('reached here')
        try:            
            refresh_token = request.headers.get('X-Refresh-Token')
            print(f"Refresh token: {refresh_token}")

            if refresh_token:
                try:
                    
                    token = RefreshToken(refresh_token)
                    print(f"Token before blacklisting: {token}")
                    token.blacklist()
                except TokenError as e:
                    print(f"Token error (invalid or expired): {str(e)}")

            logout(request)

            session_key = request.session.session_key
            if session_key:
                print('reached inside the if condition')
                from django.contrib.sessions.models import Session
                try:
                    Session.objects.get(session_key=session_key).delete()
                    print(f"Deleted session for key: {session_key}")
                except Session.DoesNotExist:
                    print(f"No session found for key: {session_key}")

            response = Response({"message": "Logged out successfully"}, status=status.HTTP_200_OK)
            # response.delete_cookie(key=settings.SIMPLE_JWT['AUTH_COOKIE'])
            # response.delete_cookie(key='refresh_token')
            response.delete_cookie(
                key='csrftoken', 
                path='/',

            )

            response.delete_cookie(
                key='sessionid', 
                path='/',

            )

            print('Successfully logged out and cleared cookies')

            return response
        
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
class FetchProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, username=None):
        try:
            # Fetch the user based on the username if provided, else use the request user
            if username:
                user = CustomUser.objects.filter(username=username).first()
                if not user:
                    return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)
            else:
                user = request.user

            # Get the profile and serialize it
            profile = Profile.objects.get(user=user)
            serializer = ProfileViewSerializer(profile, context = {"request": request})
            print("Serialized image_url:", serializer.data.get('image_url'))  # Debugging line


            # Return the serialized data
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Profile.DoesNotExist:
            return Response({"error": "Profile not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
    
class EditProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request):
        print(request.data)
        try:
            profile = Profile.objects.get(user=request.user)
            serializer = ProfileSerializer(profile, data=request.data, partial=True)

            if serializer.is_valid():
                serializer.save()

                request.user.refresh_from_db()

                updated_user_data = {
                    'id':request.user.id,
                    'username':request.user.username,
                    'email':request.user.email,
                    'image_url':profile.image.url,
                    
                }
                print('Guys this is the updated user data' ,updated_user_data)

                kafka_producer = KafkaProducerService(config={})
                kafka_producer.send_user_updation_message(updated_user_data)

                print('here is the serializer data',serializer.data)
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Profile.DoesNotExist:
            return Response({"error": "Profile not found"}, status=status.HTTP_404_NOT_FOUND)
    

class ChangeProfileImageView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, *args, **kwargs):
        print('PUT request received for changing profile image')
        print('Request headers:', request.headers)
        print('Request files:', request.FILES)

        user = request.user
        print('Authenticated user:', user)

        profile = get_object_or_404(Profile, user=user)
        print('Profile found:', profile.id)

        if 'image' in request.FILES:
            print('First Image  file found', profile.image.url)
            profile.image = request.FILES['image']
            profile.save()
            print('second  Image  file found', profile.image.url)

            print('Profile image updated')

            request.user.refresh_from_db()
            new_user = request.user

            updated_image_data = {
                'id': new_user.id,
                'username': new_user.username,
                'email': new_user.email,
                'image_url':profile.image.url if profile.image else None
            }

            kafka_producer = KafkaProducerService(config={})
            kafka_producer.send_user_updation_message(updated_image_data)


            serializer = ProfileImageSerializer(profile)
            print('Serializer data:', serializer.data)
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            print('No image file found')
            return Response({"error": "No image provided"}, status=status.HTTP_400_BAD_REQUEST)




