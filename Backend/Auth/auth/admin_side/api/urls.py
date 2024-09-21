from django.urls import path
from .views import AdminLoginView, FetchUsers  # Adjust the import based on your project structure

urlpatterns = [
    path('admin-login/', AdminLoginView.as_view(), name='admin-login'),
    path('fetch-users/', FetchUsers.as_view(), name='fetch-users'),
]