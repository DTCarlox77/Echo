from django.urls import path
from . import views

urlpatterns = [
    path('', views.main, name='main'),
    path('login/', views.login_view, name='login'),
    path('create/', views.create_room, name='create'),
    path('register/', views.register_view, name='register'), # Registro
    path('rooms/', views.rooms_view, name='rooms'), # Todas las salas
    path('room/<int:id>/', views.room, name='room'), # Sala de chat
    path('sign_out/', views.logout_view, name='logout'), # Cierre de sesión
    path('union/<int:id>', views.union, name='union'),
    path('edit/<int:id>', views.edit_room, name='edit'),
    path('remove/<int:id>', views.remove_room, name='remove'),
    path('myrooms/', views.myrooms, name='myrooms'),
    path('deluser/<int:room_id>/<int:user_id>', views.remove_member, name='deluser')
]
