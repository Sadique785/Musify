from rest_framework import serializers
from posts.models import Upload

class UploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Upload
        fields = ['file_url', 'file_type', 'description']  # Exclude user from fields

class MediaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Upload
        fields = ['id', 'user', 'file_url', 'file_type', 'description', 'created_at', 'updated_at']
