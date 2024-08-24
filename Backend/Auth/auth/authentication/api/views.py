from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response
from authentication.models import CustomUser, Profile
from .serializers import UserRegisterSerializer, VerifyEmailSerializer
from authentication.api.services.send_otp import send_otp


# Create your views here.



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


