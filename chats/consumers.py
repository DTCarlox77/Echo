from channels.generic.websocket import AsyncWebsocketConsumer
import json
from .models import Mensajes, Salas, SalasUsuarios
from channels.db import database_sync_to_async
import datetime
from dotenv import load_dotenv
from os import getenv
from openai import OpenAI
import base64
import mimetypes
import os
import markdown

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
        
        # Notificar la unión.
        await self.system_message_send(f'{self.user.username} se ha conectado.', 0)

        # Carga y envía los mensajes anteriores de la sala al usuario.
        await self.cargar_mensajes_previos()

    # Desconexión del usuario.
    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
        
        await self.system_message_send(f'{self.user.username} se ha desconectado.', 1)

    # Mensaje recibido desde el cliente.
    async def receive(self, text_data=None, alert_data=None, bytes_data=None):
        
        # En caso de haber contenido.
        if text_data:
            text_data_json = json.loads(text_data)
            message = text_data_json.get('message')
            id_archivo = text_data_json.get('id_archivo')
            username = self.user.username
            userimage = self.user.image
            
            # Para validación de la IA.
            changed_message = message.lower()
            
            # Revisa si el emisor pertenece a la sala.
            validar = await self.validacion_membresia()

            if validar:
                
                # Envío tradicional de mensajes.
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'chat_message',
                        'message': message,
                        'username': username,
                        'userimage' : userimage,
                        'fecha' : datetime.datetime.now().strftime("%d/%m/%Y %H:%M:%S"),
                        'id_archivo' : id_archivo
                    }
                )
                
                # Almacena el mensaje en la base de datos.
                await self.guardar_mensaje(message)
                
                # Uso de la IA con la api de OpenAI, en las variables de entorno se establecen sus parámetros.
                if changed_message.startswith('/eb') and (str(getenv('OPENAI_ACTIVE')) == 'True'): 
                    
                    try:
                        
                        chat_completion = client.chat.completions.create(
                            messages = [
                                {
                                    'role' : 'user',
                                    'content' : message,
                                }
                            ],
                            model = getenv('OPENAI_ENGINE'),
                        )
                        
                        chat_message = chat_completion.choices[0].message.content
                        format_message = f'/EB:CODE:18-Respuesta de EchoBot: {chat_message}'
                        
                        await self.channel_layer.group_send(
                            self.room_group_name,
                            {
                                'type': 'chat_message',
                                'message': f'/md {chat_message}',
                                'username': 'EchoBot',
                                'userimage' : 'https://piks.eldesmarque.com/thumbs/660/bin/2024/01/11/kit.jpg',
                                'fecha' : datetime.datetime.now().strftime("%d/%m/%Y %H:%M:%S"),
                                'id_archivo' : None,
                            }
                        )
                        
                        # Almacena el mensaje en la base de datos.
                        await self.guardar_mensaje(format_message)   
                    
                    except Exception as e:
                        
                        await self.channel_layer.group_send(
                            self.room_group_name,
                            {
                                'type': 'chat_message',
                                'message': f'/md <p>Error de conexión con OpenAI.</p><br><code>{e}</code>',
                                'username': 'EchoBot',
                                'userimage' : 'https://piks.eldesmarque.com/thumbs/660/bin/2024/01/11/kit.jpg',
                                'fecha' : datetime.datetime.now().strftime("%d/%m/%Y %H:%M:%S"),
                                'id_archivo' : None,
                            }
                        )
            
            # Si el usuario no pertenece a la sala se le reflejará que fue expulsado.
            else:
                
                await self.send(text_data=json.dumps({
                    'message' : {                        
                        'message' : 'Has sido expulsado de la sala.',
                        'username' : 'EchoBot',
                        'fecha' : datetime.datetime.now().strftime("%d/%m/%Y %H:%M:%S"),
                        'userimage' : 'https://piks.eldesmarque.com/thumbs/660/bin/2024/01/11/kit.jpg',
                        'id_archivo' : None,
                        'expelled' : True,
                        'id' : None
                    }
                }))
    
    # Método para informar en la sala los eventos de unión.    
    async def system_message_send(self, message, event):
        
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type' : 'system_message',
                'message' : message,
                'evento' : event,
            }
        )
                
    # Método de notificación de eventos de unión.
    async def system_message(self, event):
        
        await self.send(text_data=json.dumps({
            'sistema' : event['message'],
            'evento' : event['evento'],
            'username' : self.user.username
        }))
            
    # Envía los mensajes al cliente.
    async def chat_message(self, event):
        message = event['message']
        username = event['username']
        userimage = event['userimage']
        fecha = event['fecha']
        archivo = event['id_archivo']
        validar = await self.validacion_membresia()
        markdown_validation = False
        
        if message.startswith('/md'):
            message = message[3:].strip()
            message = markdown.markdown(message)
            markdown_validation = True
        
        # Mantiene en control el límite de mensajes.
        await self.eliminar_mensajes()
        
        # Revisa que el usuario pertenezca a la sala.
        if validar:
            
            if archivo:
                
                # Obtiene la ubicación del archivo recién enviado.
                url_archivo = await self.obtener_url(archivo)
                
                file_path = f'multimedia/{url_archivo}'
                
                try:
                        
                    with open(file_path, 'rb') as file:
                        file_content = file.read()
                                    
                    # Conversión del archivo a binario.
                    file_base64 = base64.b64encode(file_content).decode('utf-8')
                                
                    # Obtención del tipo de archivo.
                    file_type, _ = mimetypes.guess_type(file_path)
                    
                    await self.send(text_data=json.dumps({
                        'message' : {
                            'message': message,
                            'username': username,
                            'userimage' : userimage,
                            'fecha' : fecha,
                            'file_content' : file_base64,
                            'file_type' : file_type,
                            'file_name' : os.path.basename(file_path),
                            'id' : self.user.id
                        },
                    }))
                
                except Exception as e:
                    print(f'Ha ocurrido un error al momento de tomar el archivo {e}')

            else:
                
                await self.send(text_data=json.dumps({
                    'message' : {
                        'message': message,
                        'username': username,
                        'userimage' : userimage,
                        'fecha' : fecha,
                        'markdown' : markdown_validation,
                        'id' : self.user.id
                    },
                }))
            
    # Almacena los mensajes en la base de datos.
    @database_sync_to_async
    def guardar_mensaje(self, mensaje=None, archivo=None):
        sala = Salas.objects.get(id=int(self.room_name))
        Mensajes.objects.create(emisor=self.user, sala=sala, mensaje=mensaje, archivo=archivo)

    # Carga y envía los mensajes al cliente.
    async def cargar_mensajes_previos(self):
        await self.eliminar_mensajes()
        mensajes = await self.obtener_mensajes()
        for mensaje in mensajes:
            
            if mensaje['archivo']:
                
                # Ruta del archivo.
                file_path = f'multimedia/{mensaje["archivo"]}'
                
                try:
                
                    with open(file_path, 'rb') as file:
                        file_content = file.read()
                        
                    # Conversión del archivo a binario.
                    file_base64 = base64.b64encode(file_content).decode('utf-8')
                    
                    # Obtención del tipo de archivo.
                    file_type, _ = mimetypes.guess_type(file_path)
                
                    await self.send(text_data=json.dumps({
                        'message' : {                    
                            'message': mensaje['mensaje'],
                            'username': mensaje['emisor__username'],
                            'userimage' : mensaje['emisor__image'],
                            'fecha' : mensaje['fecha'].strftime("%d/%m/%Y %H:%M:%S"),
                            'file_content' : file_base64,
                            'file_type' : file_type,
                            'file_name' : os.path.basename(mensaje['archivo']),
                            'id' : mensaje['emisor__id']
                        }
                    }))
                    
                    # Esto en caso de que el archivo haya sido eliminado y no pueda encontrarse.
                except Exception as e:
                    print(f'Ha ocurrido un error al momento de tomar el archivo {e}')
                    
                    await self.send(text_data=json.dumps({
                        'message' : {                    
                            'message': 'Archivo eliminado',
                            'username': mensaje['emisor__username'],
                            'userimage' : mensaje['emisor__image'],
                            'fecha' : mensaje['fecha'].strftime("%d/%m/%Y %H:%M:%S"),
                            'id' : mensaje['emisor__id']
                        }
                    }))
                
            else:
                username = mensaje['emisor__username']
                message = mensaje['mensaje']
                userimage = mensaje['emisor__image']
                markdown_validation = False
                
                if message.startswith('/EB:CODE:18-Respuesta de EchoBot:'):
                    username = 'Echobot'
                    userimage = 'https://piks.eldesmarque.com/thumbs/660/bin/2024/01/11/kit.jpg'
                    message = markdown.markdown(message[34:])
                    markdown_validation = True
                
                if message.startswith('/md'):
                    message = message[3:].strip()
                    message = markdown.markdown(message)
                    markdown_validation = True
                
                await self.send(text_data=json.dumps({
                    'message' : {                    
                        'message': message,
                        'username': username,
                        'userimage' : userimage,
                        'fecha' : mensaje['fecha'].strftime("%d/%m/%Y %H:%M:%S"),
                        'markdown' : markdown_validation,
                        'id' : mensaje['emisor__id']
                    }
                }))
    
    # Carga los mensajes desde la base de datos.
    @database_sync_to_async
    def obtener_mensajes(self):
        mensajes = list(Mensajes.objects.filter(sala__id=int(self.room_name)).order_by('fecha').values('mensaje', 'emisor__username', 'fecha', 'emisor__image', 'archivo', 'emisor__id'))
        return mensajes
    
    # Valida la relación entre el usuario y el grupo de chats.
    @database_sync_to_async
    def validacion_membresia(self):
        validacion = SalasUsuarios.objects.filter(sala=int(self.room_name), usuario=self.user).exists()
        return validacion
    
    # Obtener dirección de multimedia.
    @database_sync_to_async
    def obtener_url(self, id):
        
        if id:
            ruta = Mensajes.objects.get(id=int(id))
            return ruta.archivo
        
    @database_sync_to_async
    def eliminar_mensajes(self):
        # Obtener los IDs de los últimos 30 mensajes.
        mensajes_a_mantener = Mensajes.objects.filter(sala__id=int(self.room_name)).order_by('-fecha').values_list('id', flat=True)[:20]

        # Obtener los IDs de todos los mensajes.
        todos_los_mensajes = Mensajes.objects.filter(sala__id=int(self.room_name)).values_list('id', flat=True)

        # Identificar los mensajes a eliminar.
        mensajes_a_eliminar = set(todos_los_mensajes) - set(mensajes_a_mantener)

        # Eliminar los mensajes que no deben ser mantenidos.
        Mensajes.objects.filter(id__in=mensajes_a_eliminar).delete()