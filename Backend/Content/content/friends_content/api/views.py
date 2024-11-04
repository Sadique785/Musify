from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status, generics, permissions
from posts.models import ContentUser
from django.db.models import Count



# Create your views here.


class SecondView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        print('reached get')

        return Response({"success": "Reached content"}, status=status.HTTP_200_OK)

