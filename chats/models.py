from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.
class CustomUser(AbstractUser):

    image = models.CharField(max_length=255, null=True, default='https://cdn0.iconfinder.com/data/icons/unigrid-flat-human-vol-2/90/011_101_anonymous_anonym_hacker_vendetta_user_human_avatar-512.png')
    def __str__(self) -> str:
        return self.username


class Salas(models.Model):

    nombre = models.CharField(max_length=255, null=False)
    descripcion = models.TextField()
    imagen = models.CharField(max_length=255, default='https://liquipedia.net/commons/images/1/1a/Brawl_Kit.png')
    password = models.CharField(max_length=100, null=True)
    creador = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='room_creator')
    fecha = models.DateTimeField(auto_now_add=True)


# class Conferencias(models.Model):

#     sala = models.ForeignKey(Salas, on_delete=models.CASCADE, related_name='room_conference')
#     fecha = models.DateTimeField(auto_now_add=True)


class Mensajes(models.Model):

    emisor = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='emisor_message')
    sala = models.ForeignKey(Salas, on_delete=models.CASCADE, related_name='emisor_room')
    mensaje = models.TextField()
    fecha = models.DateTimeField(auto_now_add=True)
    archivo = models.FileField(upload_to='uploads/', null=True, blank=True)


class SalasUsuarios(models.Model):

    usuario = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='user_member')
    sala = models.ForeignKey(Salas, on_delete=models.CASCADE, related_name='user_room')
