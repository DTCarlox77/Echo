from django.urls import path
from . import views

urlpatterns = [
    path('', views.main, name='main'), # Presentación de la aplicación.
    path('login/', views.login_view, name='login'), # Inicio de sesión
    path('create/', views.create_room, name='create'), # Creación de sala
    path('register/', views.register_view, name='register'), # Registro
    path('rooms/', views.rooms_view, name='rooms'), # Todas las salas
    path('room/<int:id>/', views.room, name='room'), # Sala de chat
    path('sign_out/', views.logout_view, name='logout'), # Cierre de sesión
    path('union/<int:id>', views.union, name='union'), # Solicitud de ingreso
    path('edit/<int:id>', views.edit_room, name='edit'), # Configuración de sala
    path('remove/<int:id>', views.remove_room, name='remove'), # Eliminar sala
    path('myrooms/', views.myrooms, name='myrooms'), # Salas en donde se ingresó
    path('deluser/<int:room_id>/<int:user_id>', views.remove_member, name='deluser') # Eliminar usuario de sala
]
