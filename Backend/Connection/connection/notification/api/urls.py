from django.urls import path
from .views import  FirstView

urlpatterns = [      
    path('first/',FirstView.as_view(), name='first' ),
        ]