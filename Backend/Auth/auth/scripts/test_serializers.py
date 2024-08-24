# import os
# import sys
# import django
# from django.conf import settings

# # Add the project directory to the sys.path
# sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# # Set the Django settings module
# os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'auth.settings')

# # Initialize Django
# django.setup()

# from authentication.api.serializers import CustomUserSerializer
# from authentication.models import CustomUser

# user_instance = CustomUser.objects.first()
# serializer = CustomUserSerializer(user_instance)
# print(serializer.data)
