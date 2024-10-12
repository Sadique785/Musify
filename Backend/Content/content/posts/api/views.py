from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status, generics, permissions
from .serializers import UploadSerializer, MediaSerializer
from posts.models import Upload


# Create your views here.


class FirstView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        print('reached get')

        return Response({"success": "Reached content"}, status=status.HTTP_200_OK)


class VerifyUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Just checking if user is authenticated
        if request.user.is_authenticated:
            return Response({"message": "User is authenticated"}, status=status.HTTP_200_OK)
        else:
            return Response({"error": "User not authenticated"}, status=status.HTTP_401_UNAUTHORIZED)

    
class SaveUploadView(APIView):
    permission_classes = [IsAuthenticated]  # Require authentication for this view

    def post(self, request):

        serializer = UploadSerializer(data=request.data)
        print(request.user)
        print(request.user.id)
        print(request.user.user_id)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        # serializer = UploadSerializer(data=request.data, context={'request': request})
        # if serializer.is_valid():
        #     serializer.save()  # The user will be set in the serializer
        #     return Response(serializer.data, status=status.HTTP_201_CREATED)  # Return the serialized data
        # return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserUploadsListView(generics.ListAPIView):
    serializer_class = MediaSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Upload.objects.filter(user=user).order_by('-created_at')
