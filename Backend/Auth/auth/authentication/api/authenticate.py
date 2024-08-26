from typing import Tuple, Union
from django.middleware.csrf import CsrfViewMiddleware
from rest_framework import exceptions
from rest_framework.request import Request
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.tokens import AccessToken
from django.conf import settings

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
        # Get the token from the header or cookie
        header = self.get_header(request)
        if header is None:
            raw_token = request.COOKIES.get(settings.SIMPLE_JWT['AUTH_COOKIE']) or None
        else:
            raw_token = self.get_raw_token(header)

        # If no token is found, return None
        if raw_token is None:
            return None

        # Validate the token
        validated_token = self.get_validated_token(raw_token)

        # Enforce CSRF check
        enforce_csrf(request)

        # Return the user and the validated token
        return self.get_user(validated_token), validated_token
