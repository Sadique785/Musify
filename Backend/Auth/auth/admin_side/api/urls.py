from django.urls import path
from .views import AdminLoginView, FetchUsers, FetchAdminProfileImage

urlpatterns = [
    path('admin-login/', AdminLoginView.as_view(), name='admin-login'),
    path('fetch-users/', FetchUsers.as_view(), name='fetch-users'),
    path('fetch-profile-image/', FetchAdminProfileImage.as_view(), name='fetch-profile-image'),
]