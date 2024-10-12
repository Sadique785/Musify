from django.contrib import admin
from .models import ContentUser, Upload

# Register your models here.
class ContentUserAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'is_admin', 'created_at', 'updated_at')  # Customize the columns displayed
    search_fields = ('username', 'email')  # Enable search by username and email
    list_filter = ('is_admin',)  # Add filters for admin users

class UploadAdmin(admin.ModelAdmin):
    list_display = ('user', 'file_url', 'file_type', 'created_at')  # Customize the columns displayed
    search_fields = ('user__username', 'file_url', 'file_type')  # Enable search by user and file attributes
    list_filter = ('file_type', 'created_at')  # Add filters for file type and upload date

# Register your models with the admin site
admin.site.register(ContentUser, ContentUserAdmin)
admin.site.register(Upload, UploadAdmin)
