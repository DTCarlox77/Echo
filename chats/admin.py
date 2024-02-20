from django.contrib import admin
from .models import CustomUser, SalasUsuarios, Salas

# Register your models here.
admin.site.register(CustomUser)
admin.site.register(Salas)
admin.site.register(SalasUsuarios)