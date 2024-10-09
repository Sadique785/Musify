from django.urls import path
from .views import AdminLoginView, FetchUsers, FetchAdminProfileImage, AdminLogoutView, FetchUserDetails, MakeAdminView, BlockUserView

urlpatterns = [
    path('admin-login/', AdminLoginView.as_view(), name='admin-login'),
    path('admin-logout/', AdminLogoutView.as_view(), name='admin-logout'),
    path('fetch-users/', FetchUsers.as_view(), name='fetch-users'),
    path('fetch-profile-image/', FetchAdminProfileImage.as_view(), name='fetch-profile-image'),
    path('fetch-user-details/<int:id>/', FetchUserDetails.as_view(), name='fetch-user-details'),
    path('make-admin/<int:user_id>/', MakeAdminView.as_view(), name='admin-make-admin'),
    path('admin-block-user/<int:user_id>/', BlockUserView.as_view(), name='admin-block-user'),

]