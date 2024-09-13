from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView, TokenObtainPairView
from .views import RegisterView, VerifyOtp, LoginView, LogoutView,TokenRefresherView, EditProfileView



urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('verify-otp/',VerifyOtp.as_view(), name='verify-otp' ),
    path('login/',LoginView.as_view(), name='login' ),
    path('logout/',LogoutView.as_view(), name='logout' ),
    # path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('refresh_access_token/', TokenRefresherView.as_view(), name='token_refresh'),

    path('token/refresh/',TokenRefreshView.as_view(), name = 'token_refesh' ),
    path('edit-profile/',EditProfileView.as_view(), name = 'edit-profile' ),
]
