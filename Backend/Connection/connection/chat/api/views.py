from rest_framework import generics
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from chat.models import ChatRoomModel, Message
from .serializers import ChatRoomSerializer, MessageSerializer


class ChatRoomListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ChatRoomSerializer

    def get_queryset(self):
        print("Working Perfectly")
        return ChatRoomModel.objects.filter(participants=self.request.user)