from django.urls import path
from .views import SecondView

urlpatterns = [
    path('second/',SecondView.as_view(), name='second' ),

]