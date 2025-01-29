from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status, generics, permissions
from .serializers import UploadSerializer, MediaSerializer, ContentSerializer, LibraryMediaSerializer, PostDetailSerializer, ReportedPostViewSerializer, LikeSerializer, CommentSerializer, ReportedPostSerializer
from posts.models import Upload, ReportedPost, Like, Comment, ContentUser
from django.db.models import Count, Q, Avg, F, FloatField, Exists, OuterRef, Prefetch
from friends_content.models import FriendList, FriendRequest
from django.shortcuts import get_object_or_404
from rest_framework.pagination import PageNumberPagination
from ..kafka_utils.producer import KafkaProducerService, LIKED, COMMENTED
from django.db.models.functions import Cast
from django.utils import timezone
from datetime import timedelta



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
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Extract project_name if it exists in the request data
        project_name = request.data.get('project_name')
        
        # Create serializer context with additional data if needed
        context = {}
        if project_name:
            context['project_name'] = project_name

        serializer = UploadSerializer(data=request.data, context=context)
        
        if serializer.is_valid():
            # Save with the authenticated user
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

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
    pagination_class = TrendingContentPagination

    def get_queryset(self):
        user = self.request.user
        
        # Get blocked users
        blocked_users = user.blocked_users.all()
        users_that_blocked_me = ContentUser.objects.filter(blocked_users=user)

        queryset = Upload.objects.annotate(
            likes_count=Count('liked_by'),
            comments_count=Count('comments'),
            shares_count=Count('shares')
        ).prefetch_related(
            'liked_by',
            'user'
        ).filter(
            is_active=True,
            is_private=False
        ).exclude(
            user__in=blocked_users
        ).exclude(
            user__in=users_that_blocked_me
        ).order_by('-likes_count', '-created_at')

        return queryset

    def get_serializer_context(self):
        return {'request': self.request}
    

class LibraryMediaView(generics.ListAPIView):
    serializer_class = LibraryMediaSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        user = self.request.user
        queryset = Upload.objects.filter(
            user=user,
            content_source='EDITED_AUDIO',
            is_active=True
        ).order_by('-created_at')
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


class ContentDistributionView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        # Get the distribution of content types
        distribution_data = (
            Upload.objects.filter(is_active=True)
            .values('file_type')
            .annotate(value=Count('id'))
            .order_by('-value')
        )

        # Transform the data to match the frontend requirements
        formatted_data = []
        for item in distribution_data:
            formatted_data.append({
                'name': self._get_display_name(item['file_type']),
                'value': item['value']
            })

        return Response(formatted_data)

    def _get_display_name(self, file_type):
        """Convert file_type to a more readable display name"""
        display_names = {
            'image': 'Images',
            'audio': 'Music Edits',
            'text': 'Text Posts',
            # Add more mappings as needed
        }
        return display_names.get(file_type.lower(), file_type.title())




class UserEngagementMetricsView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        # Get time period from query params or default to last 30 days
        days = int(request.query_params.get('days', 30))
        time_threshold = timezone.now() - timedelta(days=days)

        # Get active users in the time period
        active_users = ContentUser.objects.filter(
            uploads__created_at__gte=time_threshold
        ).distinct().count()

        # Calculate posts per user
        total_posts = Upload.objects.filter(
            created_at__gte=time_threshold,
            is_active=True
        ).count()
        
        posts_per_user = total_posts / active_users if active_users > 0 else 0

        # Calculate interaction rate (percentage of posts with likes)
        posts_with_interactions = Upload.objects.filter(
            created_at__gte=time_threshold,
            is_active=True,
            liked_by__isnull=False
        ).distinct().count()
        
        interaction_rate = (posts_with_interactions / total_posts * 100) if total_posts > 0 else 0

        # For session time, you might need to implement session tracking
        # This is a placeholder average session time in minutes
        avg_session_time = 25  # Replace with actual session time calculation if you have session data

        metrics_data = [{
            'name': 'Average',
            'postsPerUser': round(posts_per_user, 1),
            'sessionTime': avg_session_time,
            'interactionRate': round(interaction_rate, 1)
        }]

        return Response(metrics_data)
