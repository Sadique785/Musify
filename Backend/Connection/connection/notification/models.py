from django.db import models
from django.conf import settings
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.utils import timezone
from datetime import timedelta
from channels.layers import get_channel_layer
import json
from asgiref.sync import async_to_sync



class CustomUserManager(BaseUserManager):
    def create_user(self, username, email, id, password=None, **extra_fields):
        if not id:
            raise ValueError('The id must be set')  # Ensure an id is provided
        email = self.normalize_email(email)
        user = self.model(username=username, email=email, id=id, **extra_fields)  # Set the id here
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, email, id, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(username, email, id, password, **extra_fields)

class ConnectionUser(AbstractUser):
    id = models.IntegerField(primary_key=True)  # Define id as the primary key
    is_admin = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    password = None
    image_url = models.URLField(blank=True, null=True)
    blocked_users = models.ManyToManyField(
        'self',
        symmetrical=False,
        related_name='blocked_by',
        blank=True
    )

    groups = models.ManyToManyField(
        'auth.Group',
        related_name='connectionuser_set',  
        blank=True,
        help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.',
        verbose_name='groups',
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='connectionuser_set',  
        blank=True,
        help_text='Specific permissions for this user.',
        verbose_name='user permissions',
    )

    objects = CustomUserManager()

    def __str__(self):
        return self.username

    

class Notification(models.Model):
    NOTIFICATION_TYPES = (
        ('FOLLOW_REQUEST', 'Follow Request'),
        ('FOLLOW_CANCELLED', 'Follow Request Cancelled'),
        ('FOLLOW_ACCEPT', 'Follow Request Accepted'),
        ('POST_LIKE', 'Post Like'),
        ('POST_COMMENT', 'Post Comment'),
    )
    
    # Core fields
    recipient_id = models.IntegerField(db_index=True)
    sender_id = models.IntegerField(db_index=True)
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    is_read = models.BooleanField(default=False, db_index=True)
    
    # Reference IDs for post/comment notifications
    post_id = models.IntegerField(null=True, blank=True, db_index=True)
    comment_id = models.IntegerField(null=True, blank=True)
    
    # Store sender's username
    sender_username = models.CharField(max_length=150, blank=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['recipient_id', 'created_at']),
            models.Index(fields=['recipient_id', 'is_read']),
        ]
        ordering = ['-created_at']

    @classmethod
    def create_notification(cls, recipient_id, sender_id, notification_type, **kwargs):
        """
        Create a notification with deduplication logic
        Prevents creating duplicate notifications for the same event
        """
        try:
            # Fetch username from ConnectionUser model
            sender = ConnectionUser.objects.get(id=sender_id)
            sender_username = sender.username
        except ConnectionUser.DoesNotExist:
            sender_username = ''
        
        # Check for existing similar notification
        existing_notification = None
        
        # For post-related notifications (like and comment)
        if notification_type in ['POST_LIKE', 'POST_COMMENT']:
            post_id = kwargs.get('post_id')
            comment_id = kwargs.get('comment_id', None)
            
            # Look for an existing notification within a short time window
            time_threshold = timezone.now() - timedelta(minutes=5)
            
            existing_notification = cls.objects.filter(
                recipient_id=recipient_id,
                sender_id=sender_id,
                notification_type=notification_type,
                post_id=post_id,
                created_at__gt=time_threshold
            )
            
            # For comments, also check comment_id
            if notification_type == 'POST_COMMENT':
                existing_notification = existing_notification.filter(comment_id=comment_id)
        
        # For follow-related notifications
        elif notification_type in ['FOLLOW_REQUEST', 'FOLLOW_CANCELLED', 'FOLLOW_ACCEPT']:
            # Prevent duplicate follow-related notifications within a short time window
            time_threshold = timezone.now() - timedelta(minutes=5)
            
            existing_notification = cls.objects.filter(
                recipient_id=recipient_id,
                sender_id=sender_id,
                notification_type=notification_type,
                created_at__gt=time_threshold
            )
        
        # If no existing similar notification found, create a new one
        if not existing_notification.exists():
            notification = cls(
                recipient_id=recipient_id,
                sender_id=sender_id,
                notification_type=notification_type,
                sender_username=sender_username
            )
            
            # Add post_id or comment_id if provided
            if notification_type in ['POST_LIKE', 'POST_COMMENT']:
                if 'post_id' in kwargs:
                    notification.post_id = kwargs['post_id']
                if 'comment_id' in kwargs:
                    notification.comment_id = kwargs['comment_id']
                    
            notification.save()
            return notification
        
        return None  # Return None if a similar notification already exists

    @classmethod
    def cleanup_old_notifications(cls, days_to_keep=30, batch_size=1000):
        """
        Cleanup notifications older than specified days in batches
        """
        cutoff_date = timezone.now() - timedelta(days=days_to_keep)
        
        while True:
            notifications_to_delete = cls.objects.filter(
                created_at__lt=cutoff_date,
                is_read=True
            ).values_list('id', flat=True)[:batch_size]
            
            if not notifications_to_delete:
                break
                
            cls.objects.filter(id__in=notifications_to_delete).delete()

    def __str__(self):
        return f"{self.sender_username} -> {self.recipient_id}: {self.notification_type}"


    @classmethod
    def send_real_time_notification(cls, recipient_id, sender_id, notification_type, **kwargs):
        """
        Send a real-time notification via WebSocket
        """
        # First, create the notification
        print("entered", notification_type)

        notification = cls.create_notification(
            recipient_id=recipient_id,
            sender_id=sender_id,
            notification_type=notification_type,
            **kwargs
        )
        
        # If notification was created successfully
        if notification:
            # Get the channel layer
            channel_layer = get_channel_layer()
            
            # Prepare notification data
            notification_data = {
                'id': notification.id,
                'sender_username': notification.sender_username,
                'notification_type': notification_type,
                'created_at': notification.created_at.isoformat(),
                'sender_id': notification.sender_id,
                'is_read':notification.is_read,
                'post_id': kwargs.get('post_id'),
                'comment_id': kwargs.get('comment_id'),
            }
            
            # Send to the user's notification channel
            async_to_sync(channel_layer.group_send)(
                f'notifications_{recipient_id}',
                {
                    'type': 'notification_message',
                    'notification': notification_data
                }
            )
            
            return notification
        
        return None