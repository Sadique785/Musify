from typing import Tuple, Union
from django.middleware.csrf import CsrfViewMiddleware
from rest_framework import exceptions
from rest_framework.request import Request
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.tokens import AccessToken
from django.conf import settings
from django.shortcuts import get_object_or_404
from notification.models import ConnectionUser


def enforce_csrf(request):
    """Function to enforce CSRF checks."""

    print('reacher here at enforce')
    check = CsrfViewMiddleware(lambda r: None)
    check.process_request(request)
    reason = check.process_view(request, None, (), {})
    if reason:
        raise exceptions.PermissionDenied(f'CSRF failed: {reason}')

class CustomAuthentication(JWTAuthentication):
    """Custom authentication class to enforce JWT and CSRF checks."""

    def authenticate(self, request: Request) -> Union[Tuple[object, AccessToken], None]:

        print(request.headers)
        """Override the authenticate method to add CSRF checks."""

        jwt_bypass_paths = ['/login','/register',  '/home', '/forgot-password']
        
        if request.path in jwt_bypass_paths:
            return None  
        header = self.get_header(request)
        if header is None:
            raw_token = request.COOKIES.get(settings.SIMPLE_JWT['AUTH_COOKIE']) or None
        else:
            raw_token = self.get_raw_token(header)

        if raw_token is None:
            return None

        validated_token = self.get_validated_token(raw_token)

        user_id = validated_token.get('user_id')

        user = get_object_or_404(ConnectionUser, id=user_id)
        print('User Found',user)
        print('validated token here', validated_token)

        enforce_csrf(request)

        return  user, validated_token
