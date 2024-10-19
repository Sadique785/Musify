from rest_framework import serializers
from posts.models import Upload, Comment, Like, Share, ReportedPost

class UploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Upload
        fields = ['file_url', 'file_type', 'description']  

class MediaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Upload
        fields = ['id', 'user', 'file_url', 'file_type', 'description', 'created_at', 'updated_at']


class ContentSerializer(serializers.ModelSerializer):
    likes_count = serializers.IntegerField(source='liked_by.count', read_only=True)
    comments_count = serializers.IntegerField(source='comments.count', read_only=True)
    shares_count = serializers.IntegerField(source='shares.count', read_only=True)
    user = serializers.StringRelatedField() 
    is_liked = serializers.SerializerMethodField()
    recent_likes = serializers.SerializerMethodField()

    class Meta:
        model = Upload
        fields = [
            'id', 'user', 'file_url', 'file_type', 'description', 
            'likes_count', 'comments_count', 'shares_count', 
            'created_at', 'updated_at', 'is_liked', 'recent_likes'

        ]
    # def get_is_liked(self, obj):
    #     print(self.context)
    #     request = self.context.get('request')
    #     if request and request.user.is_authenticated:
    #         return Like.objects.filter(user=request.user, upload=obj).exists()
    #     return False
    
    # def get_recent_likes(self, obj):
    #     recent_likes = Like.objects.filter(upload=obj).order_by('-created_at')[:10]
    #     return [like.user.username for like in recent_likes]

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.liked_by.filter(id=request.user.id).exists()
        return False
    
    def get_recent_likes(self, obj):
        recent_likes = obj.liked_by.all().order_by('-id')[:10]
        return [user.username for user in recent_likes]



class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = ['id', 'user', 'post', 'text', 'created_at', 'updated_at']
class PostDetailSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField() 
    likes_count = serializers.IntegerField(source='liked_by.count', read_only=True)
    comments_count = serializers.IntegerField(source='comments.count', read_only=True)
    shares_count = serializers.IntegerField(source='shares.count', read_only=True)
    comments = CommentSerializer(many=True, read_only=True)  
    is_liked = serializers.SerializerMethodField()
    recent_likes = serializers.SerializerMethodField()


    class Meta:
        model = Upload
        fields = [
            'id', 'user', 'file_url', 'file_type', 'description',
            'likes_count', 'comments_count', 'shares_count',
            'comments', 'created_at', 'updated_at',
            'is_liked', 'recent_likes'
        ]
    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.liked_by.filter(id=request.user.id).exists()
        return False

    def get_recent_likes(self, obj):
        recent_likes = obj.liked_by.all().order_by('-id')[:10]
        return [user.username for user in recent_likes]




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



class ReportedPostSerializer(serializers.ModelSerializer):
    post_title = serializers.CharField(source='post.title', read_only=True) 
    reported_by_username = serializers.CharField(source='reported_by.username', read_only=True)

    class Meta:
        model = ReportedPost
        fields = ['id', 'post', 'post_title', 'reported_by', 'reported_by_username', 'report_reason', 'report_description', 'is_reviewed', 'created_at']

