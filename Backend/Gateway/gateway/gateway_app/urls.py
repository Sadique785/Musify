from django.urls import path
from .views import AuthMicroservice, MediaFilesProxy, AdminService

urlpatterns = [
    path('auth/<path:path>', AuthMicroservice.as_view(), name='auth-microservice'), 
    path('admin-side/<path:path>', AdminService.as_view(), name='admin-microservice'),
    path('media/<path:path>', MediaFilesProxy.as_view(), name='media-path')


]


