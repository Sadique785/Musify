from rest_framework import serializers
from friends_content.models import FriendList, FriendRequest
from posts.models import Upload, Comment, Like, Share, ReportedPost, ContentUser

class UploadSerializer(serializers.ModelSerializer):
    # Make content_source optional since it has a default value
    content_source = serializers.CharField(required=False)
    title = serializers.CharField(required=False)
    
    class Meta:
        model = Upload
        fields = ['file_url', 'file_type', 'description', 'content_source', 'title']

    def create(self, validated_data):
        # If project_name is in the context, use it as title
        if 'project_name' in self.context:
            validated_data['title'] = self.context['project_name']
        
        # If content_source isn't provided, it will use the model's default ('UPLOAD')
        return super().create(validated_data)

class MediaSerializer(serializers.ModelSerializer):
    post_count = serializers.SerializerMethodField()
    class Meta:
        model = Upload
        fields = ['id', 'user', 'file_url', 'file_type', 'description', 'created_at', 'updated_at', 'post_count']


    def get_post_count(self, obj):
        return obj.user.uploads.count()


class ContentSerializer(serializers.ModelSerializer):
    likes_count = serializers.IntegerField(source='liked_by.count', read_only=True)
    comments_count = serializers.IntegerField(source='comments.count', read_only=True)
    shares_count = serializers.IntegerField(source='shares.count', read_only=True)
    user = serializers.StringRelatedField()
    user_id = serializers.IntegerField(source='user.id', read_only=True)
    is_liked = serializers.SerializerMethodField()
    recent_likes = serializers.SerializerMethodField()
    follow_status = serializers.SerializerMethodField()
    is_same_user = serializers.SerializerMethodField()


    class Meta:
        model = Upload
        fields = [
            'id', 'user', 'user_id', 'file_url', 'file_type', 'description',
            'likes_count', 'comments_count', 'shares_count',
            'created_at', 'updated_at', 'is_liked', 'recent_likes', 'follow_status',
            'is_same_user',
        ]

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.liked_by.filter(pk=request.user.pk).exists()
        return False

    def get_recent_likes(self, obj):
        recent_likes = obj.liked_by.all().order_by('-id')[:10]
        return [user.username for user in recent_likes]

    def get_follow_status(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return 'follow'

        post_user = obj.user  # The user related to the post
        requesting_user = request.user  # The user making the request

        # If the requesting user is viewing their own post
        if requesting_user == post_user:
            return 'same_user'

        if FriendList.objects.filter(user=post_user, friends=requesting_user).exists():
            return 'unfollow'

        # Check follow request statuses
        following_request = FriendRequest.objects.filter(
            sender=requesting_user,
            receiver=post_user,
            is_active=True
        ).exists()

        following_post_user = FriendRequest.objects.filter(
            sender=post_user,
            receiver=requesting_user,
            is_active=True
        ).exists()

        if following_request and not following_post_user:
            return 'following'
        elif following_post_user and not following_request:
            return 'follow back'
        elif following_request and following_post_user:
            return 'unfollow'
        else:
            return 'follow'
        
    def get_is_same_user(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return request.user == obj.user  # Check if the requesting user is the same as the post user
        return False

class LibraryMediaSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField()  # This will use the __str__ method of the User model
    
    class Meta:
        model = Upload
        fields = [
            'id',
            'user',
            'title',
            'file_url',
            'file_type',
            'is_private',
            'created_at',
            'updated_at'
        ]

class UserCommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContentUser
        fields = ['id', 'username']



class CommentSerializer(serializers.ModelSerializer):
    user = UserCommentSerializer()
    class Meta:
        model = Comment
        fields = ['id', 'user', 'upload', 'text', 'created_at', 'updated_at']


class PostDetailSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField() 
    user_id=serializers.IntegerField(source='user.id')
    likes_count = serializers.IntegerField(source='liked_by.count', read_only=True)
    comments_count = serializers.IntegerField(source='comments.count', read_only=True)
    shares_count = serializers.IntegerField(source='shares.count', read_only=True)
    comments = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()
    recent_likes = serializers.SerializerMethodField()
    title = serializers.CharField()  


    class Meta:
        model = Upload
        fields = [
            'id', 'user', 'user_id', 'file_url', 'file_type', 'description','title',
            'likes_count', 'comments_count', 'shares_count',
            'comments', 'created_at', 'updated_at',
            'is_liked', 'recent_likes'
        ]

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.liked_by.filter(pk=request.user.pk).exists()  # Updated to use pk directly
        return False

    def get_recent_likes(self, obj):
        recent_likes = obj.liked_by.all().order_by('-id')[:10]
        return [user.username for user in recent_likes]

    def get_comments(self, obj):
        comments = obj.comments.order_by('-created_at')
        return CommentSerializer(comments, many=True).data




class LikeSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField()  

    class Meta:
        model = Like
        fields = ['id', 'user']  

class ShareSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField() 

    class Meta:
        model = Share
        fields = ['id', 'user'] 



class ReportedPostViewSerializer(serializers.ModelSerializer):
    report_id = serializers.IntegerField(source='id', read_only=True)
    file_url = serializers.URLField(source='post.file_url', read_only=True)
    post_id = serializers.IntegerField(source='post.id', read_only=True)
    username = serializers.CharField(source='post.user.username', read_only=True)
    reported_by = serializers.CharField(source='reported_by.username', read_only=True)
    post_type = serializers.CharField(source='post.file_type', read_only=True)  
    post_status = serializers.BooleanField(source='post.is_active', read_only=True)  # Ensuring it's read-only

    class Meta:
        model = ReportedPost
        fields = [
            'post_id', 'report_id', 'is_reviewed', 'username', 'post_type',
            'file_url', 'report_reason', 'reported_by', 'report_description', 
            'created_at', 'post_status'  # Add post_status here
        ]

    def to_representation(self, instance):
        data = super().to_representation(instance)
        print("Serialized data:", data)  # Print serialized data to verify output structure
        return data


class ReportedPostSerializer(serializers.ModelSerializer):
    post_id = serializers.IntegerField()

    class Meta:
        model = ReportedPost
        fields = ['post_id', 'report_reason', 'report_description']
        
    def create(self, validated_data):
        post_id = validated_data.pop('post_id')
        post = Upload.objects.get(id=post_id)  # Consider adding error handling here
        reported_by = self.context['request'].user
        return ReportedPost.objects.create(post=post, reported_by=reported_by, **validated_data)
