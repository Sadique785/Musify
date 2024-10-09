from django.db import models
from django.conf import settings
from django.contrib.auth.models import AbstractUser



class ContentUser(AbstractUser):
    # Add your additional fields here
    user_id = models.IntegerField(unique=True)  # Unique ID from auth service
    is_admin = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    password = None

    # Add related_name to avoid conflicts
    groups = models.ManyToManyField(
        'auth.Group',
        related_name='contentuser_set',  # Custom related name for ContentUser
        blank=True,
        help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.',
        verbose_name='groups',
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='contentuser_set',  # Custom related name for ContentUser
        blank=True,
        help_text='Specific permissions for this user.',
        verbose_name='user permissions',
    )

    def __str__(self):
        return self.username  

