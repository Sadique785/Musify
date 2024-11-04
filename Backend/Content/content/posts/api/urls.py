from django.urls import path
from .views import FirstView,VerifyUserView, SaveUploadView, UserUploadsListView, TrendingContentView, PostDetailView, ReportedContentView, LikePostView, CommentPostView

urlpatterns = [
    path('first/',FirstView.as_view(), name='first' ),
    path('verify-user/', VerifyUserView.as_view(), name='verify-user'),
    path('save-upload/', SaveUploadView.as_view(), name='save-upload'), 
    path('uploads/', UserUploadsListView.as_view(), name='user-uploads'), 
    path('uploads/<str:username>/', UserUploadsListView.as_view(), name='user-uploads-by-username'),
    path('trending/', TrendingContentView.as_view(), name='trending'), 
    path('reported/', ReportedContentView.as_view(), name='reported'), 
    path('post-detail/<int:pk>/', PostDetailView.as_view(), name='post-detail'), 
    path('posts/<int:post_id>/like/', LikePostView.as_view(), name='like-post'),
    path('posts/<int:post_id>/comment/', CommentPostView.as_view(), name='comment-post'),





]