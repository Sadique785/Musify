from django.urls import re_path
from . import consumers
from chat.websocket import consumers as chat_consumers 



websocket_urlpatterns = [
    re_path(r'ws/notifications/(?P<user_id>\w+)/$', consumers.NotificationConsumer.as_asgi()),
    re_path(r'ws/chat-rooms/(?P<user_id>\w+)/$', chat_consumers.ChatRoomConsumer.as_asgi()),
    re_path(r'ws/private-message/(?P<current_user_id>\w+)/(?P<other_user_id>\w+)/$', chat_consumers.PrivateMessageConsumer.as_asgi()),

]