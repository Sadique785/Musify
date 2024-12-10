from django.urls import path,include
from .views import ChatRoomListView


urlpatterns = [
    path('rooms/',ChatRoomListView.as_view(), name='rooms' )
]