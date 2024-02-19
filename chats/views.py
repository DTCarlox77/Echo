from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, logout, login

from .models import CustomUser, Salas, SalasUsuarios

# Create your views here.
def main(request):
    
    return redirect('login')

def register_view(request):
    
    if request.user.is_authenticated:
        return redirect('rooms')  
    
    message = ''

    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        
        if username and password:
            try:
                user = CustomUser.objects.create_user(username=username, password=password)
                user.save()
                return redirect('login')
            
            except Exception as e:
                if 'UNIQUE constraint' in str(e):
                    message = 'Nombre de usuario no dispobible'
                else:
                    message = 'Error de registro'
                
        else:
            message = 'Complete todos los campos.'
    
    return render(request, 'registration/register.html', {
        'message' : message if message else None
    })

def login_view(request):
    
    if request.user.is_authenticated:
        return redirect('rooms')  

    message = ''
    
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        
        if username and password:
            user = authenticate(request, username=username, password=password)
            
            if user is not None:
                login(request, user)
                return redirect('rooms')
            
            else:
                message = 'Credenciales no válidas.'
                
        else:
            message = 'Complete todos los campos.'
    
    return render(request, 'registration/login.html', {
        'message' : message if message else None
    })
    
@login_required
def logout_view(request):
    logout(request)
    return redirect('login')

@login_required
def rooms_view(request):
    
    rooms = Salas.objects.all()
    
    return render(request, 'interfaces/rooms.html', {
        'rooms' : rooms if rooms else None,
        'public' : True
    })

@login_required
def myrooms(request):
    
    user_rooms = SalasUsuarios.objects.filter(usuario=request.user)
    
    return render(request, 'interfaces/rooms.html', {
        'rooms' : user_rooms if user_rooms else None,
        'public' : False
    })

@login_required
def create_room(request):
    message = ''
    respaldo = ''
    
    if request.method == 'POST':
        nombre = request.POST.get('nombre')
        descripcion = request.POST.get('descripcion')
        password = request.POST.get('password')
        imagen = request.POST.get('imagen')
        
        respaldo = {
            'nombre' : nombre,
            'descripcion' : descripcion,
            'password' : password,
            'imagen' : imagen
        }
        
        if nombre:
            salas = Salas.objects.filter(nombre=nombre).count()
            if salas == 0:
                try:
                    nueva_sala = Salas(nombre=nombre, descripcion=(descripcion if descripcion else 'Sin descripción.'), password=(password if password else None), creador=request.user, imagen=(imagen if imagen else 'https://www.shutterstock.com/image-vector/default-image-icon-vector-missing-600nw-2079504220.jpg'))
                    nueva_sala.save()
                    
                    unir = SalasUsuarios(usuario=request.user, sala=nueva_sala)
                    unir.save()
                    return redirect('rooms')
                    
                except Exception as e:
                    message = f'Algo salió mal: {e}'
            else:
                message = 'El nombre no se encuentra disponible.'
        else:
            message = 'La sala necesita de un nombre.'
    
    return render(request, 'interfaces/create_room.html', {
        'message' : message,
        'respaldo' : respaldo
    })
    
@login_required
def edit_room(request, id):
    room = get_object_or_404(Salas, id=id)
    message = ''
    relacion = SalasUsuarios.objects.filter(sala=id)
    members = [member.usuario for member in relacion]
    
    if room.creador != request.user:
        return redirect('room', id=id)
        
    if request.method == 'POST':
        descripcion = request.POST.get('descripcion')
        password = request.POST.get('password')
        imagen = request.POST.get('imagen')
        
        try:
            room.descripcion = (descripcion if descripcion else 'Sin descripción.')
            room.password = (password if password else None)
            room.imagen = (imagen if imagen else 'https://www.shutterstock.com/image-vector/default-image-icon-vector-missing-600nw-2079504220.jpg')
            room.save()
                    
            return redirect('edit', id=room.id)
                    
        except Exception as e:
            message = f'Algo salió mal: {e}'

            
    return render(request, 'interfaces/configure_room.html', {
        'room' : room,
        'message' : message,
        'users' : members
    })

@login_required
def remove_room(request, id):
    room = get_object_or_404(Salas, id=id)
    
    if room.creador == request.user:
        room.delete()
        
    return redirect('rooms')

@login_required
def remove_member(request, room_id, user_id):
    
    room = get_object_or_404(Salas, id=room_id)
    
    if room.creador == request.user:
        user = get_object_or_404(SalasUsuarios, sala=room_id, usuario=user_id)
        user.delete()
    
    return redirect('edit', id=room_id)

@login_required
def room(request, id):
    
    room_select = get_object_or_404(Salas, id=id)
    
    if room_select:
        
        if room_select.password:
            validacion = SalasUsuarios.objects.filter(usuario=request.user, sala=room_select).exists()
            if validacion:
                return render(request, 'interfaces/room.html', {
                    'room' : room_select
                }) 
            else:
                return redirect('union', id=id)
        else:
            
            validacion = SalasUsuarios.objects.filter(usuario=request.user, sala=room_select).exists()
            if not validacion:
                autorizar = SalasUsuarios(usuario=request.user, sala=room_select)
                autorizar.save()

            return render(request, 'interfaces/room.html', {
                    'room' : room_select
                }) 

@login_required
def union(request, id):
    
    message = ''
    room_select = get_object_or_404(Salas, id=id)
        
    if request.method == 'POST':
        
        password = request.POST.get('password')
            
        if room_select.password == password:
            autorizar = SalasUsuarios(usuario=request.user, sala=room_select)
            autorizar.save()
            return redirect('room', id=id)
            
        else:
            message = 'Contraseña no válida.'
                
    return render(request, 'interfaces/union.html', {
        'room_select': room_select,
        'message': message
    })
