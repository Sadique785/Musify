from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils import timezone
import uuid
from django.conf import settings


STATUS_CHOICES = (
    ('send', 'Sent'),
    ('accepted', 'Accepted'),
)



class CustomUserManager(BaseUserManager):
    use_in_migrations = True

    def create_user(self, username, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Email is required")

        if not username:
            raise ValueError('Username is required')
        
        email = self.normalize_email(email)
        user = self.model(username=username, email=email, **extra_fields)

        if password:
            user.set_password(password)
        else:
            user.password = None

        user.save(using=self._db)
        return user

    def create_superuser(self, username, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(username, email, password, **extra_fields)
    

class CustomUser(AbstractBaseUser, PermissionsMixin):
    id = models.AutoField(primary_key=True)
    username = models.CharField(max_length=255, unique=True, db_index=True)
    email = models.EmailField(max_length=255, unique=True, db_index=True)
    password = models.CharField(max_length=128)  # Storing hashed password
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    email_verified = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)  # This field determines admin access
    date_joined = models.DateTimeField(default=timezone.now)
    last_login = models.DateTimeField(null=True)
    blocked_users = models.ManyToManyField(
        'self',
        symmetrical=False,
        related_name='blocked_by',
        blank=True
    )

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.username

    # Custom related names to avoid conflicts
    groups = models.ManyToManyField(
        'auth.Group',
        related_name='customuser_groups',
        blank=True,
        help_text='The groups this user belongs to.',
        verbose_name='groups',
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='customuser_permissions',
        blank=True,
        help_text='Specific permissions for this user.',
        verbose_name='user permissions',
    )

class Role(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class UserRole(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='user_roles')
    role = models.ForeignKey(Role, on_delete=models.CASCADE, related_name='roles_users')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'role')

    def __str__(self):
        return f"{self.user.username} - {self.role.name}"


class Talent(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name
    

class Genre(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name


class Profile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='user_profile', to_field='id', db_index=True)
    name = models.CharField(max_length=255, default='your name')
    location = models.CharField(max_length=255, default='city')
    is_online = models.BooleanField(default=False)
    following = models.ManyToManyField('self', related_name='followers', symmetrical=False, blank=True )
    friends = models.ManyToManyField('self', related_name='friends', symmetrical=True, blank=True )
    blocked_users = models.ManyToManyField('self', related_name='blocked_by', symmetrical=False, blank=True)
    bio = models.CharField(default='', blank=True, null=True, max_length=350)
    date_of_birth = models.CharField(blank=True, max_length=150)
    image = models.ImageField(default='profile_pics/default.png', upload_to='profile_pics', blank=True, null=True)
    image_url = models.URLField(max_length=500, blank=True, null=True)  
    gender = models.CharField(max_length=50, blank=True)
    talents = models.ManyToManyField(Talent, related_name='profiles_with_talent', blank=True)
    genres = models.ManyToManyField(Genre, related_name='profiles_with_genre', blank=True)
    
    def get_friends(self):
        return self.friends.all()
    
    def get_friends_no(self):
        return self.friends.all().count()
    
    def __str__(self):
        return f'{self.user.username} Profile' 
    
    def get_image_url(self):
        """Return the appropriate image URL"""
        if self.image_url:
            return self.image_url
        elif self.image:
            return self.image.url
        return 'profile_pics/default.png'


class Relationship(models.Model):
    sender = models.ForeignKey('Profile', on_delete=models.CASCADE, related_name='friend_sender')
    receiver = models.ForeignKey('Profile', on_delete=models.CASCADE, related_name='friend_receiver')
    status = models.CharField(max_length=8, choices=STATUS_CHOICES)
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)   

    def __str__(self):
        return f"{self.sender.user.username} -> {self.receiver.user.username} ({self.status})"

