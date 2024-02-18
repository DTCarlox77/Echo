import os

from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'payplay.settings')

application = get_asgi_application()

# Configuración del websocket.
from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.routing import ProtocolTypeRouter
from django.core.asgi import get_asgi_application
from channels.security.websocket import AllowedHostsOriginValidator
from chats.routing import websocket_urlpatterns

application = ProtocolTypeRouter(
    {
        'http' : get_asgi_application(),
        'websocket' : AllowedHostsOriginValidator(
            AuthMiddlewareStack(URLRouter(websocket_urlpatterns))
        ),
    }
)