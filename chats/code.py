from django.utils.crypto import get_random_string
import string
from .models import Salas

def generar_codigo():
    while True:
        formato_aleatorio = get_random_string(length=8, allowed_chars=string.ascii_letters + string.digits)
        codigo = f"room-{formato_aleatorio}"

        # Verifica si el código ya existe en la base de datos.
        if not Salas.objects.filter(codigo=codigo).exists():
            break

    return codigo