# backend/chat/routing.py

from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    # (?P<room_id>\w+) -> Bu hissə URL-dən ID-ni tutur
    re_path(r'ws/chat/(?P<room_id>\w+)/$', consumers.ChatConsumer.as_asgi()),
]