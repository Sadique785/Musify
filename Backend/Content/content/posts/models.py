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
        related_name='contentuser_set',  
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
    


class Upload(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE,
        related_name='uploads', 
    )
    title = models.CharField(max_length=300, default='Title', blank=True)
    file_url = models.URLField(max_length=200)  
    file_type = models.CharField(max_length=50) 
    description = models.TextField(blank=True, null=True) 
    is_active = models.BooleanField(default=True)  
    is_private = models.BooleanField(default=False) 
    created_at = models.DateTimeField(auto_now_add=True) 
    updated_at = models.DateTimeField(auto_now=True)
    liked_by = models.ManyToManyField(
        settings.AUTH_USER_MODEL, 
        related_name='liked_uploads', 
        blank=True
    )   

    def __str__(self):
        return f"{self.user.username} - {self.file_type}"
    @property
    def total_likes(self):
        return self.liked_by.count()



class Like(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='likes'
    )
    upload = models.ForeignKey(
        'Upload', 
        on_delete=models.CASCADE, 
        related_name='likes'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} liked {self.upload.id}"
    
    @property
    def likes_count(self):
        return self.likes.count()
    
    @property
    def comments_count(self):
        return self.comments.count()

    @property
    def shares_count(self):
        return self.shares.count()



class Comment(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='comments'
    )
    upload = models.ForeignKey(
        'Upload', 
        on_delete=models.CASCADE, 
        related_name='comments'
    )
    text = models.TextField() 
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} commented on {self.upload.id}"


class Share(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='shares'
    )
    upload = models.ForeignKey(
        'Upload', 
        on_delete=models.CASCADE, 
        related_name='shares'
    )
    shared_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} shared {self.upload.id}"

class ReportedPost(models.Model):
    post = models.ForeignKey(Upload, on_delete=models.CASCADE, related_name="reported_posts")
    reported_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="reports")
    report_reason = models.CharField(max_length=255)
    report_description = models.TextField(blank=True, null=True)
    is_reviewed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Reported Post"
        verbose_name_plural = "Reported Posts"

    def __str__(self):
        return f"Report for Post ID {self.post.id} by {self.reported_by.username}"