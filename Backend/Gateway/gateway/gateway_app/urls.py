from django.urls import path
from .views import AuthMicroservice, MediaFilesProxy, AdminService, ContentMicroservice, UnifiedService, FriendsService

urlpatterns = [
    path('auth/<path:path>', AuthMicroservice.as_view(), name='auth-microservice'), 
    path('admin-side/<path:path>', AdminService.as_view(), name='admin-microservice'),
    path('media/<path:path>', MediaFilesProxy.as_view(), name='media-path'),
    path('content/<path:path>', ContentMicroservice.as_view(), name='content-micorservice'),
    path('friends/<path:path>', FriendsService.as_view(), name='content-micorservice'),


]

# urlpatterns = [
#     path('auth/<path:path>', UnifiedService.as_view(), name='auth-microservice'), 
#     path('admin-side/<path:path>', UnifiedService.as_view(), name='admin-microservice'),
#     path('friends/<path:path>', UnifiedService.as_view(), name='friends-microservice'),
#     path('media/<path:path>', MediaFilesProxy.as_view(), name='media-path'),
#     path('content/<path:path>', ContentMicroservice.as_view(), name='content-micorservice'),
# ]


