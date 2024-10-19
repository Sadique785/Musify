from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status, generics, permissions
from .serializers import UploadSerializer, MediaSerializer, ContentSerializer, PostDetailSerializer, ReportedPostSerializer, LikeSerializer, CommentSerializer
from posts.models import Upload, ReportedPost, Like, Comment
from django.db.models import Count



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
    


class TrendingContentView(generics.ListAPIView):
    serializer_class = ContentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Upload.objects.annotate(
                likes_count=Count('liked_by')  # Change from 'likes' to 'liked_by'
            ).order_by('-likes_count', '-created_at')

        queryset = queryset.filter(is_active=True, is_private=False)

        return queryset
    
    #     queryset = Upload.objects.annotate(
    #         likes_count=Count('likes')
    #     ).order_by('-likes_count', '-created_at')

    
    def get_serializer_context(self):
        return {'request': self.request}
    
class PostDetailView(generics.RetrieveAPIView):
    serializer_class = PostDetailSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Upload.objects.filter(is_active=True, is_private=False)
    
    def get_serializer_context(self):
        return {'request': self.request}
    

class ReportedContentView(generics.ListAPIView):
    serializer_class = ReportedPostSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = ReportedPost.objects.all().order_by('-created_at')

        # Optionally, filter by is_reviewed if you want to display only unreviewed reports
        is_reviewed = self.request.query_params.get('is_reviewed')
        if is_reviewed is not None:
            queryset = queryset.filter(is_reviewed=is_reviewed.lower() in ['true', '1'])

        return queryset
    
# class LikePostView(generics.CreateAPIView):
#     serializer_class = LikeSerializer
#     permission_classes = [IsAuthenticated]

#     def post(self, request, *args, **kwargs):
#         user = request.user
#         print('reached here at the like view')

#         post_id = kwargs.get('post_id')
#         post = Upload.objects.get(id=post_id)

#         existing_like = Like.objects.filter(user=user, upload=post).first()
#         if existing_like:
#             existing_like.delete()
#             return Response({'message':'Post unliked'}, status=status.HTTP_200_OK)

#         else:
#             Like.objects.create(user=user, upload=post)
#             return Response({'message': 'Post liked'}, status=status.HTTP_201_CREATED)
    

class LikePostView(generics.CreateAPIView):
    serializer_class = LikeSerializer
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        user = request.user
        post_id = kwargs.get('post_id')
        post = Upload.objects.get(id=post_id)

        if post.liked_by.filter(id=user.id).exists():
            post.liked_by.remove(user)
            return Response({'message': 'Post unliked'}, status=status.HTTP_200_OK)
        else:
            post.liked_by.add(user)
            return Response({'message': 'Post liked'}, status=status.HTTP_201_CREATED)


class CommentPostView(generics.CreateAPIView):
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        user = request.user
        post_id = kwargs.get('post_id')
        post = Upload.objects.get(id=post_id)
        content = request.data.get('content')

        Comment.objects.create(user=user, post=post, content=content)
        return Response({'message': 'Comment added'}, status=status.HTTP_201_CREATED)
