# project-level urls.py
from django.contrib import admin
from django.urls import path, include
from django.conf.urls.static import static
from django.conf import settings
from django.views.static import serve


urlpatterns = [
    path('admin/', admin.site.urls),
    path('auth/', include('authentication.api.urls')),
    path('admin-side/', include('admin_side.api.urls')),
    path('friends/', include('friends.api.urls')), 
    path('media/<path:path>', serve, {
        'document_root': settings.MEDIA_ROOT
    }, name='media-files'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
