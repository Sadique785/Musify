from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status, generics, permissions
from .serializers import UploadSerializer, MediaSerializer, ContentSerializer, PostDetailSerializer, ReportedPostViewSerializer, LikeSerializer, CommentSerializer, ReportedPostSerializer
from posts.models import Upload, ReportedPost, Like, Comment, ContentUser
from django.db.models import Count, Q
from friends_content.models import FriendList, FriendRequest
from django.shortcuts import get_object_or_404
from rest_framework.pagination import PageNumberPagination
from ..kafka_utils.producer import KafkaProducerService, LIKED, COMMENTED




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
        username = self.kwargs.get('username', None)
        user = self.request.user

        if username:
            target_user = get_object_or_404(ContentUser, username=username)
        else:
            target_user = user

        if target_user in user.blocked_users.all():
            return Upload.objects.none()

        return Upload.objects.filter(user=target_user).order_by('-created_at')
    


class TrendingContentPagination(PageNumberPagination):
    page_size = 5
    page_size_query_param = 'page_size'
    max_page_size = 100


class TrendingContentView(generics.ListAPIView):
    serializer_class = ContentSerializer
    permission_classes = [IsAuthenticated]
    pagination_class  = TrendingContentPagination

    def get_queryset(self):
        user = self.request.user  # The current authenticated user
        
        # Exclude posts from users blocked by the current user
        blocked_users_ids = user.blocked_users.values_list('id', flat=True)
        
        # Exclude posts from users who have blocked the current user
        users_that_blocked_me_ids = ContentUser.objects.filter(blocked_users=user).values_list('id', flat=True)

        queryset = Upload.objects.annotate(
                likes_count=Count('liked_by')  # Change from 'likes' to 'liked_by'
            ).filter(
                is_active=True, 
                is_private=False
            ).exclude(
                user_id__in=blocked_users_ids  # Exclude posts from blocked users
            ).exclude(
                user_id__in=users_that_blocked_me_ids  # Exclude posts from users who blocked the current user
            ).order_by('-likes_count', '-created_at')

        return queryset
    
    def get_serializer_context(self):
        return {'request': self.request}

class FollowingContentPagination(PageNumberPagination):
    page_size = 5
    page_size_query_param = 'page_size'
    max_page_size = 100


class FollowingContentView(generics.ListAPIView):
    serializer_class = ContentSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = FollowingContentPagination

    def get_queryset(self):
        user = self.request.user

        try:
            friend_list = FriendList.objects.get(user=user)
            mutual_friends = friend_list.friends.all()
        except FriendList.DoesNotExist:
            mutual_friends = FriendList.objects.none()

        following_requests = FriendRequest.objects.filter(sender=user, is_active=True)
        following_users = [request.receiver for request in following_requests]

        following_users_ids = set(mutual_friends.values_list('id', flat=True)) | set([user.id for user in following_users])

        blocked_users_ids = user.blocked_users.values_list('id', flat=True)
        users_that_blocked_me_ids = ContentUser.objects.filter(blocked_users=user).values_list('id', flat=True)

        queryset = Upload.objects.filter(
            user_id__in=following_users_ids,
            is_active=True,
            is_private=False
        ).exclude(
            user_id__in=blocked_users_ids
        ).exclude(
            user_id__in=users_that_blocked_me_ids
        ).annotate(
            likes_count=Count('liked_by')
        ).order_by('-likes_count', '-created_at')

        return queryset




    
class PostDetailView(generics.RetrieveAPIView):
    serializer_class = PostDetailSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Upload.objects.filter(is_active=True, is_private=False)
    
    def get_serializer_context(self):
        return {'request': self.request}
    

class ReportedContentView(generics.ListAPIView):
    serializer_class = ReportedPostViewSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        print("ReportedContentView: Accessed get_queryset")  # Check if view is accessed

        queryset = ReportedPost.objects.all().order_by('-created_at')
        print("Initial queryset:", queryset)  # Print the initial queryset to confirm data is fetched

        # Optionally, filter by is_reviewed if you want to display only unreviewed reports
        is_reviewed = self.request.query_params.get('is_reviewed')
        if is_reviewed is not None:
            queryset = queryset.filter(is_reviewed=is_reviewed.lower() in ['true', '1'])
            print("Filtered queryset by is_reviewed:", queryset)  # Print filtered queryset if applicable

        return queryset

    


class LikePostView(generics.CreateAPIView):
    serializer_class = LikeSerializer
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        user = request.user
        post_id = kwargs.get('post_id')
        post = Upload.objects.get(id=post_id)
        kafka_producer = KafkaProducerService()

        if post.liked_by.filter(id=user.id).exists():
            post.liked_by.remove(user)
            return Response({'message': 'Post unliked'}, status=status.HTTP_200_OK)
        else:
            post.liked_by.add(user)
            # Send Kafka notification when post is liked
            kafka_producer.send_post_activity_notification(
                event_type=LIKED,
                sender_id=user.id,
                receiver_id=post.user.id,  # post owner's ID
                post_id=post_id
            )
            print('Produced for Liked')

            return Response({'message': 'Post liked'}, status=status.HTTP_201_CREATED)


class CommentPostView(generics.CreateAPIView):
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        user = request.user
        post_id = kwargs.get('post_id')
        post = Upload.objects.get(id=post_id)
        content = request.data.get('content')

        comment = Comment.objects.create(user=user, upload=post, text=content)
        kafka_producer = KafkaProducerService()
        kafka_producer.send_post_activity_notification(
            event_type=COMMENTED,
            sender_id=user.id,
            receiver_id=post.user.id,  # post owner's ID
            post_id=post_id,
            comment_id=comment.id
        )
        print('Produced for comment', comment)


        return Response({'message': 'Comment added'}, status=status.HTTP_201_CREATED)


class ReportPostView(generics.CreateAPIView):
    serializer_class = ReportedPostSerializer
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({'message': 'Report submitted successfully'}, status=status.HTTP_201_CREATED)

class UpdateReviewStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        report_id = request.data.get('reportId')
        new_status = request.data.get('newStatus')

        try:
            reported_post = ReportedPost.objects.get(id=report_id)
            reported_post.is_reviewed = new_status

            reported_post.save()
            return Response({'message':'Review status updated successfully'}, status=status.HTTP_200_OK)
        
        except ReportedPost.DoesNotExist:
            return Response({"error": "Reported post not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        

class PostBlockToggleView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        post_id = request.data.get('post_id')
        new_status = request.data.get('new_status')
        print("Received post_id:", post_id)  # Debugging line
        print("Received new_status:", new_status)  # Debugging line
        try:
            post = Upload.objects.get(id=post_id)
            post.is_active = new_status
            post.save()
            action = "blocked" if new_status is False else "unblocked"
            return Response({'message': f'Post successfully {action}.'}, status=status.HTTP_200_OK)
        except Upload.DoesNotExist:
            return Response({"error": "Post not found"}, status=status.HTTP_404_NOT_FOUND)
