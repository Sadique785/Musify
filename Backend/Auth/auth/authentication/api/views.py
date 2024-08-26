from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response
from authentication.models import CustomUser, Profile
from .serializers import UserRegisterSerializer, VerifyEmailSerializer, UserLoginSerializer
from authentication.api.services.send_otp import send_otp
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from django.conf import settings
from django.middleware import csrf
from django.views.decorators.csrf import csrf_protect


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
            email = serializer.validated_data.get("email")
            otp = serializer.validated_data.get("otp")

            print('Send by user', email, otp)
            print(type(otp))


            session_otp = request.session.get('email_otp')
            session_email = request.session.get('email_for_otp')

            print('Session', session_email, session_otp)
            print(type(session_otp))


            if session_email != email:
                return Response({"message": 'Invalid email address'}, status=status.HTTP_400_BAD_REQUEST)

            if session_otp != otp:
                return Response({'message': "Invalid Otp"}, status=status.HTTP_400_BAD_REQUEST)
            

            user_data = request.session.get('user_data')
            if user_data:
                user = CustomUser.objects.create(**user_data, email_verified=True)
                user.save()

                Profile.objects.get_or_create(user=user)


                request.session.pop('email_otp', None)
                request.session.pop('email_for_otp', None)
                request.session.pop('user_data', None)

                return Response({"message":"Email verified and account created You can login now."}, status=status.HTTP_200_OK)
            else:
                return Response({"message":"No user data found. Please register again."}, status=status.HTTP_400_BAD_REQUEST)
                
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)




class LoginView(APIView):
    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)

        if serializer.is_valid():
            user = serializer.validated_data['user']
            if user.is_active:
                tokens = generate_token_with_claims(user)
                response = Response()

                response.set_cookie(
                key=settings.SIMPLE_JWT['AUTH_COOKIE'],
                value=tokens["access"],
                expires=settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'],
                secure=settings.SIMPLE_JWT['AUTH_COOKIE_SECURE'],
                httponly=settings.SIMPLE_JWT['AUTH_COOKIE_HTTP_ONLY'],
                samesite=settings.SIMPLE_JWT['AUTH_COOKIE_SAMESITE']
                )
                csrf.get_token(request)
                response.data = {"Sucess": "Login successfully", "data": tokens}
                print(response)
                return response
            else:
                return Response({"error": "This account is not active"}, status=status.HTTP_404_NOT_FOUND)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        





class LogoutView(APIView):
    def post(self, request):
        try:
            print(settings.SIMPLE_JWT['AUTH_COOKIE'])

            refresh_token = request.data.get("refresh_token")


            if refresh_token is None:
                return Response({"error": "Refresh token not provided"}, status=status.HTTP_400_BAD_REQUEST)

            token = RefreshToken(refresh_token)
            token.blacklist()

            response = Response({"message": "Logged out Successfully"}, status=status.HTTP_200_OK)
            response.delete_cookie(key=settings.SIMPLE_JWT['AUTH_COOKIE'])

            return response
        
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
