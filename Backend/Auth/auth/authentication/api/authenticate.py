from typing import Tuple, Union
from django.middleware.csrf import CsrfViewMiddleware
from rest_framework import exceptions
from rest_framework.request import Request
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.tokens import AccessToken
from django.conf import settings
from django.utils import timezone


def enforce_csrf(request):
    """Function to enforce CSRF checks."""
    check = CsrfViewMiddleware(lambda r: None)
    check.process_request(request)
    reason = check.process_view(request, None, (), {})
    if reason:
        raise exceptions.PermissionDenied(f'CSRF failed: {reason}')

class CustomAuthentication(JWTAuthentication):
    """Custom authentication class to enforce JWT and CSRF checks."""

    def authenticate(self, request: Request) -> Union[Tuple[object, AccessToken], None]:
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

        enforce_csrf(request)
        user = self.get_user(validated_token)

        # Update the last_login field for the user
        user.last_login = timezone.now()
        user.save(update_fields=['last_login'])

        return user, validated_token
