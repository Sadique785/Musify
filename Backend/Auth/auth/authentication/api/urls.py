from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView, TokenObtainPairView
from .views import RegisterView, VerifyOtp, LoginView, SendEmailVerificationOTPView, VerifyEmailUpdateView,  LogoutView,TokenRefresherView, EditProfileView, FetchProfileView, ChangeProfileImageView, GoogleLoginView, BlockUserView



urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('verify-otp/',VerifyOtp.as_view(), name='verify-otp' ),
    path('login/',LoginView.as_view(), name='login' ),
    path('logout/',LogoutView.as_view(), name='logout' ),
    # path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('refresh_access_token/', TokenRefresherView.as_view(), name='token_refresh'),

    path('token/refresh/',TokenRefreshView.as_view(), name = 'token_refesh' ),
    path('edit-profile/',EditProfileView.as_view(), name = 'edit-profile' ),
    path('fetch-profile/',FetchProfileView.as_view(), name = 'fetch-profile' ),
    path('fetch-profile/<str:username>/', FetchProfileView.as_view(), name='fetch-profile-with-username'),

    path('change-profile-image/', ChangeProfileImageView.as_view(), name='change-profile-image'),
    path('google-login/', GoogleLoginView.as_view(), name='google-login'),
    path('block-user/',BlockUserView.as_view(), name = 'block-user' ),
    path('send-email-otp/', SendEmailVerificationOTPView.as_view(), name='send-email-otp'),
    path('update-email/', VerifyEmailUpdateView.as_view(), name='update-email'),

]
