from channels.generic.websocket import AsyncWebsocketConsumer
import json
from .models import Mensajes, Salas
from channels.db import database_sync_to_async
import datetime

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]
        self.room_name = self.scope['url_route']['kwargs']['id']
        self.room_group_name = f'chat_{self.room_name}'

        # Une al usuario a un grupo de sala
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

        # Carga y envía los mensajes anteriores de la sala al usuario
        await self.cargar_mensajes_previos()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data=None, bytes_data=None):
        if text_data:
            text_data_json = json.loads(text_data)
            message = text_data_json.get('message')
            username = self.user.username

            await self.guardar_mensaje(message)

            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'message': message,
                    'username': username,
                }
            )

    async def chat_message(self, event):
        message = event['message']
        username = event['username']
        fecha = datetime.datetime.now().strftime("%d/%m/%Y %H:%M:%S")

        await self.send(text_data=json.dumps({
            'message': message,
            'username': username,
            'fecha' : fecha
        }))
        
    @database_sync_to_async
    def guardar_mensaje(self, message):
        sala = Salas.objects.get(id=int(self.room_name))
        Mensajes.objects.create(emisor=self.user, sala=sala, mensaje=message)

    async def cargar_mensajes_previos(self):
        mensajes = await self.obtener_mensajes()
        for mensaje in mensajes:
            
            await self.send(text_data=json.dumps({
                'message': mensaje['mensaje'],
                'username': mensaje['emisor__username'],
                'fecha' : mensaje['fecha'].strftime("%d/%m/%Y %H:%M:%S")
            }))
            
    @database_sync_to_async
    def obtener_mensajes(self):
        mensajes = list(Mensajes.objects.filter(sala__id=int(self.room_name)).order_by('fecha').values('mensaje', 'emisor__username', 'fecha'))
        return mensajes