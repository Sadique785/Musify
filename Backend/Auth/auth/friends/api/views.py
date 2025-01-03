from django.shortcuts import render, get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from friends.models import FriendList, FriendRequest, NotificationSettings
from authentication.models import CustomUser
from django.db import models
from django.db.models import Q
from django.utils import timezone
from .serializers import UserSerializer, UnfollowedUserSerializer
from authentication.kafka_utils.producer import KafkaProducerService, FOLLOW_ACCEPTED,FOLLOW_CANCELLED,FOLLOW_REQUESTED,UNFOLLOW
from random import sample


User = get_user_model()

# Create your views here.
class first(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self,request):
        print('user friend: ',request.user)
        return Response({'message':'Reached at friends house'}, status=status.HTTP_200_OK) 
    

 
class FollowUserView(APIView):
    permission_classes = [IsAuthenticated]
    kafka_producer = KafkaProducerService(config={})


    def post(self, request, followed_id):
        """Send a follow request"""
        receiver = get_object_or_404(User, id=followed_id)
        sender = request.user
        print(receiver, 'RECEIVER')
        print(sender, 'sender')

        if sender == receiver:
            return Response({"message": "You cannot follow yourself."}, status=status.HTTP_400_BAD_REQUEST)

        # Check if there's an active follow request between the users
        follow_request, created = FriendRequest.objects.get_or_create(sender=sender, receiver=receiver)
        
        if follow_request.is_active:
            return Response({"message": "You are already following this user."}, status=status.HTTP_400_BAD_REQUEST)
        
        # Set follow request to active if created or inactive before
        follow_request.is_active = True
        follow_request.save()
        print(sender.id, 'sender_id')
        print(receiver.id, 'receiver_id')
        print('FollowRequested', FOLLOW_REQUESTED)

        self.kafka_producer.send_follow_event(FOLLOW_REQUESTED, sender.id, receiver.id)
        self.kafka_producer.send_follow_notification(FOLLOW_REQUESTED, sender.id, receiver.id)
        
        return Response({"message": f"Follow request sent to {receiver.username}."}, status=status.HTTP_201_CREATED)
    
    def delete(self, request, followed_id):
        """Cancel the follow request"""

        receiver = get_object_or_404(User, id=followed_id)
        sender = request.user

        try:
            follow_request = FriendRequest.objects.get(sender=sender, receiver=receiver)
            follow_request.cancel()

            self.kafka_producer.send_follow_event(FOLLOW_CANCELLED, sender.id, receiver.id)
            self.kafka_producer.send_follow_notification(FOLLOW_CANCELLED, sender.id, receiver.id)

            return Response({"message": f"Follow request to {receiver.username} canceled."}, status=status.HTTP_200_OK)
        except FriendRequest.DoesNotExist:
            return Response({"message": "No active follow request found."}, status=status.HTTP_400_BAD_REQUEST)


class AcceptFollowRequestView(APIView):
    permission_classes = [IsAuthenticated]
    kafka_producer = KafkaProducerService(config={})


    def post(self, request, sender_id):
        """Accept a follow request from a specific user."""
        receiver = request.user  
        sender = get_object_or_404(User, id=sender_id)

        try:
            follow_request = FriendRequest.objects.get(sender=sender, receiver=receiver, is_active=True)
        except FriendRequest.DoesNotExist:
            return Response({"message": "No active follow request found."}, status=status.HTTP_404_NOT_FOUND)

        follow_request.accept()

        self.kafka_producer.send_follow_event(FOLLOW_ACCEPTED, sender.id, receiver.id)
        self.kafka_producer.send_follow_notification(FOLLOW_ACCEPTED, sender.id, receiver.id)


        return Response({"message": f"You are now following {sender.username}."}, status=status.HTTP_200_OK)

class UnfollowUserView(APIView):
    permission_classes = [IsAuthenticated]
    kafka_producer = KafkaProducerService(config={})


    def post(self, request, user_id):
        """Unfollow a user."""
        user = request.user 
        unfollowed_user = get_object_or_404(User, id=user_id)

        user_friend_list = FriendList.objects.get(user=user)
        unfollowed_user_friend_list = FriendList.objects.get(user=unfollowed_user)

        user_friend_list.remove_friend(unfollowed_user)
        unfollowed_user_friend_list.remove_friend(user)

        follow_request, created = FriendRequest.objects.get_or_create(
            sender=unfollowed_user,
            receiver=user
        )

        if created:
            print(follow_request, '1111')
            follow_request.is_active = True
            follow_request.timestamp = timezone.now()
        else:
            print(follow_request, '2222')
            follow_request.re_follow()

        follow_request.save()

        self.kafka_producer.send_follow_event(UNFOLLOW, user.id, unfollowed_user.id)


        return Response({"message": f"You have unfollowed {unfollowed_user.username}."}, status=status.HTTP_200_OK)
    
    

class CheckBlockStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        username = request.query_params.get('username')
        print('Got into blockstatus check', username)
        
        if not username:
            return Response({"error": "Username is required."}, status=400)
        
        try:
            profile_user = CustomUser.objects.get(username=username)
            is_blocked = profile_user.blocked_users.filter(id=request.user.id).exists()
            return Response({"isBlocked": is_blocked})
        except CustomUser.DoesNotExist:
            return Response({"isBlocked": False})
        


class BlockedUsersView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        blocked_users = user.blocked_users.all()

        if not blocked_users:

            return Response({"message":"No blocked Users"}, status=status.HTTP_200_OK)
        blocked_users_data = UserSerializer(blocked_users, many=True)

        return Response({"blocked_users":blocked_users_data.data}, status=status.HTTP_200_OK)
    

class UserSearchView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        search_query = request.query_params.get('q', '')
        print('Seach for this guys' ,search_query)

        blocked_by_users_ids = user.blocked_by.values_list('id', flat=True)

        print('Here is the blocked guys',blocked_by_users_ids)

        users = CustomUser.objects.filter(
            Q(is_active=True) &  
            ~Q(id__in=blocked_by_users_ids) & 
            (Q(username__icontains=search_query) | Q(email__icontains=search_query)) 
        ).distinct()[:6]  

        print( 'search results users:' ,users)

        users_data = UserSerializer(users, many=True)
        print( 'sersa' ,users_data)

        if users_data.data:
            return Response({"results": users_data.data}, status=status.HTTP_200_OK)
        else:
            return Response({"message": "No users found"}, status=status.HTTP_200_OK)


class NotificationStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        settings, _ = NotificationSettings.objects.get_or_create(user=request.user)
        return Response({"enabled": settings.is_enabled})

    def post(self, request):
        settings, _ = NotificationSettings.objects.get_or_create(user=request.user)
        settings.is_enabled = not settings.is_enabled
        settings.save()
        return Response({"enabled": settings.is_enabled})



class UnfollowedAccountsView(generics.ListAPIView):
    serializer_class = UnfollowedUserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        try:
            friend_list = FriendList.objects.get(user=user)
            mutual_friends = friend_list.friends.all()
        except FriendList.DoesNotExist:
            mutual_friends = CustomUser.objects.none()
            
        following_requests = FriendRequest.objects.filter(sender=user, is_active=True)
        following_users = [request.receiver for request in following_requests]
        
        following_users_ids = set(mutual_friends.values_list('id', flat=True)) | set([user.id for user in following_users])
        blocked_users_ids = user.blocked_users.values_list('id', flat=True)
        users_that_blocked_me_ids = CustomUser.objects.filter(blocked_users=user).values_list('id', flat=True)
        
        queryset = CustomUser.objects.exclude(
            id__in=following_users_ids
        ).exclude(
            id__in=blocked_users_ids
        ).exclude(
            id__in=users_that_blocked_me_ids
        ).exclude(
            id=user.id
        ).filter(
            is_active=True
        )

        # Get random 4 users
        user_ids = list(queryset.values_list('id', flat=True))
        if len(user_ids) > 4:
            random_ids = sample(user_ids, 4)
            queryset = queryset.filter(id__in=random_ids)
        
        return queryset