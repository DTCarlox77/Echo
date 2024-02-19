from channels.generic.websocket import AsyncWebsocketConsumer
import json
from .models import Mensajes, Salas, SalasUsuarios
from channels.db import database_sync_to_async
import datetime
from dotenv import load_dotenv
from os import getenv
from openai import OpenAI

load_dotenv()

# Instancia a la clase de openai.
client = OpenAI(
    api_key=getenv('OPENAI_KEY'),
)

# Consumidor de chats para el websocket.
class ChatConsumer(AsyncWebsocketConsumer):
    
    # Evento de conexión a una sala.
    async def connect(self):
        self.user = self.scope["user"]
        self.room_name = self.scope['url_route']['kwargs']['id']
        self.room_group_name = f'chat_{self.room_name}'

        # Une al usuario a un grupo de sala.
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        # El usuario ha sido aceptado.
        await self.accept()

        # Carga y envía los mensajes anteriores de la sala al usuario.
        await self.cargar_mensajes_previos()

    # Desconexión del usuario.
    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    # Mensaje recibido desde el cliente.
    async def receive(self, text_data=None, alert_data=None, bytes_data=None):
        
        # En caso de haber contenido.
        if text_data:
            text_data_json = json.loads(text_data)
            message = text_data_json.get('message')
            username = self.user.username
                
            # Revisa si el emisor pertenece a la sala.
            validar = await self.validacion_membresia()

            if validar:
                    
                # Envía el mensaje recibido al método de envío.
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'chat_message',
                        'message': message,
                        'username': username,
                        'fecha' : datetime.datetime.now().strftime("%d/%m/%Y %H:%M:%S")
                    }
                )
                
                # Uso de la IA con la api de OpenAI, en las variables de entorno se establecen sus parámetros.
                if message.startswith('/EchoBot') and (str(getenv('OPENAI_ACTIVE')) == 'True'): 
                    
                    chat_completion = client.chat.completions.create(
                        messages=[
                            {
                                'role' : 'user',
                                'content' : message,
                            }
                        ],
                        model=getenv('OPENAI_ENGINE'),
                    )
                    
                    chat_message = chat_completion.choices[0].message.content
                    format_message = f'Respuesta de EchoBot: {chat_message}'
                    
                    await self.channel_layer.group_send(
                        self.room_group_name,
                        {
                            'type': 'chat_message',
                            'message': format_message,
                            'username': username,
                            'fecha' : datetime.datetime.now().strftime("%d/%m/%Y %H:%M:%S")
                        }
                    )
                    
                    # Almacena el mensaje en la base de datos.
                    await self.guardar_mensaje(format_message)
                    
                # Almacena el mensaje en la base de datos.
                await self.guardar_mensaje(message)
            
            # Si el usuario no pertenece a la sala se le reflejará que fue expulsado.
            else:
                
                await self.send(text_data=json.dumps({
                    'message' : {                        
                        'message' : 'Has sido expulsado de la sala.',
                        'username' : 'Echo Bot',
                        'fecha' : datetime.datetime.now().strftime("%d/%m/%Y %H:%M:%S"),
                        'expelled' : True
                    }
                }))
            
    # Envía los mensajes al cliente.
    async def chat_message(self, event):
        message = event['message']
        username = event['username']
        fecha = event['fecha']
        validar = await self.validacion_membresia()
        
        # Revisa que el usuario pertenezca a la sala.
        if validar:

            await self.send(text_data=json.dumps({
                'message' : {
                    'message': message,
                    'username': username,
                    'fecha' : fecha
                },
                # 'alert' : {
                #     'message' : 'testing 123 testing'
                # }
            }))
            
    # Almacena los mensajes en la base de datos.
    @database_sync_to_async
    def guardar_mensaje(self, message):
        sala = Salas.objects.get(id=int(self.room_name))
        Mensajes.objects.create(emisor=self.user, sala=sala, mensaje=message)

    # Carga y envía los mensajes al cliente.
    async def cargar_mensajes_previos(self):
        mensajes = await self.obtener_mensajes()
        for mensaje in mensajes:
            
            await self.send(text_data=json.dumps({
                'message' : {                    
                    'message': mensaje['mensaje'],
                    'username': mensaje['emisor__username'],
                    'fecha' : mensaje['fecha'].strftime("%d/%m/%Y %H:%M:%S")
                }
            }))
    
    # Carga los mensajes desde la base de datos.
    @database_sync_to_async
    def obtener_mensajes(self):
        mensajes = list(Mensajes.objects.filter(sala__id=int(self.room_name)).order_by('fecha').values('mensaje', 'emisor__username', 'fecha'))
        return mensajes
    
    # Valida la relación entre el usuario y el grupo de chats.
    @database_sync_to_async
    def validacion_membresia(self):
        validacion = SalasUsuarios.objects.filter(sala=int(self.room_name), usuario=self.user).exists()
        return validacion