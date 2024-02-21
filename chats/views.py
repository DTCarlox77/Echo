from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, logout, login
from django.views.decorators.csrf import csrf_exempt
from django.template.loader import render_to_string

from .models import CustomUser, Salas, SalasUsuarios, Mensajes

def main(request):
    
    return redirect('login')

def register_view(request):
    
    if request.user.is_authenticated:
        return redirect('rooms')  
    
    message = ''

    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        image = request.POST.get('imagen')
        
        if username and password:
            try:
                user = CustomUser.objects.create_user(username=username, password=password, image=(image if image else 'https://cdn0.iconfinder.com/data/icons/unigrid-flat-human-vol-2/90/011_101_anonymous_anonym_hacker_vendetta_user_human_avatar-512.png'))
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
    rooms = Salas.objects.all().order_by('fecha').reverse()[:3]

    return render(request, 'interfaces/rooms.html', {
        'rooms': rooms,
        'public': True
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
        print('Hola mundo')
        return render(request, 'interfaces/configure_room.html', {
            'room' : room,
            'message' : message,
            'users' : members,
            'editar' : False
        })
        
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
        'users' : members,
        'editar' : True
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
    user = get_object_or_404(SalasUsuarios, sala=room_id, usuario=user_id)
    
    if room.creador == request.user or request.user == user.usuario:
        user.delete()
        
        if room.creador == request.user:
            return redirect('edit', id=room_id)
        
    return redirect('rooms')

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

@login_required
@csrf_exempt
def mediaroom(request, id):
    
    room = get_object_or_404(Salas, id=id)
    autorizacion = SalasUsuarios.objects.filter(usuario=request.user, sala=room).exists()
    
    if autorizacion:
        if request.method == 'POST':
            archivo = request.FILES.get('multimedia')
            
            if archivo:
                nuevo_archivo = Mensajes.objects.create(emisor=request.user, sala=room, archivo=archivo)
                id_archivo = nuevo_archivo.id

                return JsonResponse({
                    'id': id_archivo
                })
                
@login_required 
def profile_view(request, id):
    
    profile = get_object_or_404(CustomUser, id=id)
    
    if profile.id == request.user.id:
        
        if request.method == 'POST':
            biografia = request.POST.get('biografia')
            image = request.POST.get('imagen')
            
            try:
                
                profile.biografia = biografia
                profile.image = image
                profile.save()
                
            except Exception as e:
                message = 'No se pudieron almacenar los cambios.'
                
                return render(request, 'interfaces/profile.html', {
                    'profile' : profile,
                    'propio' : True,
                    'message' : message
                })  
            
        return render(request, 'interfaces/profile.html', {
            'profile' : profile,
            'propio' : True
        })    
        
    return render(request, 'interfaces/profile.html', {
        'profile' : profile,
        'propio' : False
    })    

def load_rooms(request):
    offset = int(request.GET.get('offset', 0))

    if offset:
        salas_adicionales = Salas.objects.all().order_by('fecha').reverse()[offset:offset+3]
        salas_html = render_to_string('interfaces/rooms_shortcut.html', {'rooms': salas_adicionales, 'public': True})

        return JsonResponse({
            'salas_html': salas_html
        })

    return JsonResponse({
        'message': 'No se proporcionó un valor de offset válido.'
    })

def search_view(request):
    busqueda = request.GET.get('busqueda', '')
    
    if busqueda:
        salas_buscadas = Salas.objects.filter(nombre__contains=busqueda)
        
        if salas_buscadas:
            salas_html = render_to_string('interfaces/rooms_shortcut.html', {'rooms': salas_buscadas, 'public': True})
            return JsonResponse({
                'salas_html': salas_html
            })
        else:
            return JsonResponse({
                'message': 'No se encontraron salas.'
            })

def cancel_search(request):
    rooms = Salas.objects.all().order_by('fecha').reverse()[:3]
    
    if rooms:
        salas_html = render_to_string('interfaces/rooms_shortcut.html', {'rooms': rooms, 'public': True})

        return JsonResponse({
            'salas_html': salas_html
        })
    else:
        return JsonResponse({
            'message': 'No hay salas disponibles.'
        })
