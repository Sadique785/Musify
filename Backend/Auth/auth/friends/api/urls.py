# friends/api/urls.py

from django.urls import path
from .views import first, FollowUserView,AcceptFollowRequestView, UnfollowUserView, CheckBlockStatusView

urlpatterns = [
    path('status/', first.as_view(), name='first'),  
    path('follow/<int:followed_id>/', FollowUserView.as_view(), name='follow-request'),
    path('accept/<int:sender_id>/', AcceptFollowRequestView.as_view(), name='accept-request'),
    path('unfollow/<int:user_id>/', UnfollowUserView.as_view(), name='unfollow'),
    path('block-status/', CheckBlockStatusView.as_view(), name='block-status'),

]
