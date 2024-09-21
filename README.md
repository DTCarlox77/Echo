# Project 5: Echo (Capstone)

¡Bienvenido a Echo! Aquí tienes una descripción general del proyecto, la lista de archivos y las instrucciones para ejecutar la aplicación en tu entorno local.

## Descripción del Proyecto

Echo es una aplicación web innovadora diseñada para ofrecer una experiencia única de comunicación en tiempo real y creación de salas de chat. Su objetivo principal es proporcionar un espacio interactivo donde los usuarios puedan conectarse, compartir multimedia y comunicarse de manera auténtica.

## Distinctiveness and Complexity

### ¿Por qué Echo se destaca?

Echo destaca por su enfoque en proporcionar una experiencia de chat única y compleja. Utiliza tecnologías avanzadas como Django para el backend, Channels para WebSocket y una integración inteligente con la API de OpenAI. Además, la aplicación permite la creación de salas personalizadas, compartición de multimedia en tiempo real y un sistema de comandos único para formatear mensajes.

### Descripción de los Archivos

- **chats (Directorio de la Aplicación):**
   - **migrations (Registro de Migraciones):**
      Almacena los registros de migraciones para mantener la consistencia de la base de datos.

   - **static (Archivos Estáticos):**
      - **css:**
         - **style.css:**
            Contiene estilos adicionales que mejoran el diseño de la interfaz, adaptándose tanto al modo oscuro como al diseño responsivo.

      - **icons:**
         Contiene vectores SVG utilizados para representar elementos visuales dentro de la aplicación.

      - **images:**
         Almacena imágenes relevantes para la interfaz y funcionalidades de la aplicación.

      - **javascript:**
         - **load.js:**
            Contiene funcionalidades implementadas con jQuery y Ajax para cargar y buscar salas en la interfaz pública.
         - **options.js:**
            Incluye funciones de búsqueda específicas para la interfaz personal de salas.
         - **socket.js:**
            Contiene todas las funciones relacionadas con el WebSocket de Channels, específicamente dentro de cada sala.

   - **templates:**
      - **components:**
         Almacena fragmentos de plantillas HTML utilizados en varias partes de la aplicación.
      - **interfaces:**
         Contiene plantillas HTML que ensamblan diferentes componentes para crear vistas completas.
      - **layouts:**
         Introduce interfaces en una plantilla común para evitar redundancias en el código, como llamadas a bibliotecas y otros elementos comunes.
      - **registration:**
         Incluye plantillas HTML que definen las vistas de inicio de sesión y registro.

   - **code.py:**
      Script encargado de generar un código único para cada nueva sala.

   - **consumers.py:**
      Script que contiene el consumidor del WebSocket, gestionando la actividad en tiempo real de cada sala.

   - **models.py:**
      Contiene los modelos de datos fundamentales para la aplicación.

   - **regularmarkdown.py:**
      Script basado en expresiones regulares para transformar la sintaxis específica de Echo a HTML.

   - **routing.py:**
      Gestiona el sistema de rutas para la ejecución del consumidor WebSocket.

   - **urls.py:**
      Controla las rutas de la aplicación, direccionando las solicitudes a las funciones correspondientes en views.py.

- **echo (Directorio del Proyecto):**
   - **asgi.py:**
      Establece el modo asíncrono en la aplicación, especialmente para el funcionamiento del WebSocket.

   - **settings.py:**
      Configuración general necesaria para ejecutar el proyecto, incluyendo ajustes relacionados con bases de datos, aplicaciones instaladas y configuraciones del framework Django.

   - **urls.py:**
      Controla las rutas específicas del proyecto, direccionando las solicitudes a las diferentes aplicaciones dentro de Echo.

   - **wsgi.py:**
      Controla el modo síncrono del servidor web.

- **db.sqlite3:**
   Base de datos principal de la aplicación. Puedes borrar este archivo y generar una nueva migración para reiniciar y vaciar la aplicación, manteniendo la consistencia de la base de datos.

## Modelos de la Aplicación

### 1. Usuario Personalizado (`CustomUser`)

- Este modelo representa a los usuarios de la aplicación y hereda de `AbstractUser`.
- Campos:
  - `image`: URL de la imagen asignada por el usuario.
  - `biografia`: Biografía del usuario (texto, predeterminado 'Sin biografía').
- Método `__str__` personalizado para mostrar el nombre de usuario en la representación de cadena.

### 2. Sala de Chat (`Salas`)

- Modelo que representa las salas de chat en la aplicación.
- Campos:
  - `nombre`: Nombre de la sala (cadena, no nulo

).
  - `codigo`: Código único de la sala (cadena, único).
  - `descripcion`: Descripción de la sala (texto).
  - `imagen`: URL de la imagen asociada a la sala (cadena, predeterminado 'https://liquipedia.net/commons/images/1/1a/Brawl_Kit.png').
  - `password`: Contraseña de la sala (cadena, opcional).
  - `creador`: Relación con el usuario creador de la sala (clave foránea a `CustomUser`).
  - `fecha`: Fecha y hora de creación de la sala (automática).

### 3. Mensaje (`Mensajes`)

- Modelo que representa los mensajes enviados en las salas de chat.
- Campos:
  - `emisor`: Relación con el usuario que envía el mensaje (clave foránea a `CustomUser`).
  - `sala`: Relación con la sala a la que pertenece el mensaje (clave foránea a `Salas`).
  - `mensaje`: Contenido del mensaje (texto).
  - `fecha`: Fecha y hora de creación del mensaje (automática).
  - `archivo`: Archivo adjunto al mensaje (opcional, subido a 'uploads/').

### 4. Usuarios de Sala (`SalasUsuarios`)

- Modelo que registra los usuarios presentes en una sala de chat.
- Campos:
  - `usuario`: Relación con el usuario que es miembro de la sala (clave foránea a `CustomUser`).
  - `sala`: Relación con la sala a la que pertenece el usuario (clave foránea a `Salas`).

## Funcionalidades Clave de Echo

1. **Creación de Salas:** Los usuarios pueden crear nuevas salas de chat, proporcionando detalles como nombre, código, descripción, imagen y contraseña opcional.

2. **Exploración de Salas:** Los usuarios pueden explorar todas las salas disponibles, viendo información esencial como nombre, descripción, imagen y el nombre del creador.

3. **Mensajería en Tiempo Real:** Al ingresar a una sala, los usuarios pueden enviar y recibir mensajes en tiempo real. También pueden compartir archivos multimedia.

4. **Gestión de Usuarios en Salas:** Los creadores de salas tienen la capacidad de expulsar usuarios. Los usuarios pueden unirse o abandonar salas según sus preferencias.

5. **Búsqueda de Salas:** Se ha implementado una función de búsqueda de salas, tanto en las interfaces pública como personal.

6. **Perfil de Usuario:** Los usuarios tienen un perfil con imagen, biografía y nombre de usuario. Pueden acceder al perfil de otros usuarios tocando sus nombres.

7. **Indicadores de Actividad:** En las salas, se indica si un usuario está activo, mejorando la experiencia de interacción.

8. **Inteligencia Artificial:** Se ha introducido una función de inteligencia artificial con el comando '/eb' + consulta.

9. **Diseño Distintivo:** EchoBot tiene un diseño distintivo. Los mensajes de los emisores se alinean a la derecha para mejorar la legibilidad.

10. **Modo Oscuro:** Los usuarios pueden activar el modo oscuro para una experiencia visual más cómoda.

11. **Barra de Búsqueda de Salas:** Se ha agregado una barra de búsqueda de salas para facilitar la ubicación de salas específicas.

12. **Funcionalidad de Cambio de Nombre:** Los usuarios pueden cambiar el nombre de sus salas, proporcionando flexibilidad en la personalización.

13. **Funcionalidades de Markdown:** Los usuarios pueden utilizar una nueva sintaxis de Markdown (HTML) basada en expresiones regulares al enviar mensajes.

## Video Tutorial

**Youtube**: [Ver Tutorial en Youtube](https://youtu.be/zzR3nQZ8sV4?si=DQQJW_XjFUNmFG9D)

## Estructura de Archivos de la Aplicación

- **commerce/:** Esta carpeta alberga el proyecto principal de Django, configurado como un módulo. La ejecución se realiza desde la ruta raíz a través del archivo `manage.py`.

- **commerce/:** Aquí se encuentra la aplicación principal llamada "commerce".

- **templates/:** Contiene las plantillas HTML que posibilitan la visualización del contenido de la aplicación.

- **static/:** Incluye el archivo CSS y un ícono para la aplicación, estos son utilizados en las plantillas HTML.

- **migrations/:** Registro de todas las migraciones realizadas hacia la base de datos.

## Archivos del Proyecto

- **manage.py:** Archivo principal para gestionar la aplicación Django.

- **db.sqlite3:** Base de datos precreada en SQLite 3 para gestionar toda la información.

## Ejecución de la Aplicación

Para poner en marcha la aplicación, sigue estos pasos:

1. Asegúrate de contar con Python 3.11 instalado en tu sistema.

2. Instala las dependencias de Python utilizando el siguiente comando:

   ```bash
   pip install -r requirements.txt
   ```

3. Crea un archivo de variables de entorno llamado `.env` y asigna valores a las siguientes variables:

   ```env
   OPENAI_KEY=Tú clave de OpenAI  # Puedes obtenerla en [OpenAI](https://openai.com/)
   OPENAI_ENGINE=gpt-3.5-turbo
   OPENAI_ACTIVE=True  # Enciende el modelo de GPT si se establece como 'True'.
   ```

4. Desde la ruta raíz, ejecuta el siguiente comando para aplicar las migraciones a la base de datos:

   ```bash
   python manage.py migrate
   ```

5. Inicia el servidor web de Django:

   ```bash
   python manage.py runserver
   ```

6. Abre tu navegador web y accede a `http://localhost:8000` para empezar a utilizar la aplicación.

## Notas adicionales

- Para explorar la aplicación, puedes utilizar una cuenta de prueba que ya está creada en la base de datos por defecto. Encuentra detalles sobre cómo acceder a esta cuenta en la sección "Acerca de".

- Para familiarizarte con la nomenclatura de RDM (Regular MarkDown), te invitamos a consultar la sección "Acerca de".


¡Espero que disfrutes usando la aplicación Echo! Si tienes alguna pregunta o necesitas más información, no dudes en contactarme.

**Hecho por: Carlos Adrián Espinosa Luna**
