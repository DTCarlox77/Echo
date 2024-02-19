document.addEventListener('DOMContentLoaded', () => {

    // Obtención del ID de grupo para establecer conexión ws.
    let ruta = window.location.pathname;
    let ruta_seccionada = ruta.split('/');
    let room_id = ruta_seccionada[2]; 
    let protocolo = window.location.protocol === "https:" ? "wss" : "ws";
    
    // Establecimiento de conexión con el websocket.
    const websocket = new WebSocket(`${protocolo}://${window.location.host}/ws/room/${room_id}/`);

    // Validaciones de conexión del websocket.
    websocket.onopen = (e) => {
        console.log('Conexión con el websocket establecida.');
    };

    websocket.onclose = (e) => {
        console.error('La conexión con el websocket ha sido cerrada.');
    };

    websocket.onerror = (e) => {
        console.error('Error en la conexión websocket.');
    };


    // Establecimiento del espacio para cargar mensajes.
    const ventana = document.querySelector('#ventana');
    const username_dom = document.querySelector('#nombre_usuario');
    
    // Evento de recepción de mensajes del servidor.
    websocket.onmessage = (e) => {

        // Serialización de la información.
        const data = JSON.parse(e.data);

        // Sí entra un objeto de tipo mensaje.
        if (data.message) {

            // Si entra un mensaje normal.
            if (data.message.message && !data.message.expelled) {

                const mensajeTipo = data.message.username === username_dom.textContent ? 'alert-info' : 'alert-light';
                ventana.innerHTML += `
                <div class="container-fluid d-flex">
                    <img src="${data.message.userimage}" class="userimagechat">
                    <div><h6>${data.message.username}</h6> <p>${data.message.fecha}</p></div>
                </div>
                <div class="alert ${mensajeTipo} p-2 pb-0">
                    <p>${data.message.message}</p>                    
                </div>
                `;
                scrollDown();
            }

            // Sí entra un mensaje de un usuario que ha sido expulsado.
            else if (data.message.expelled) {
                ventana.innerHTML += `
                <div class="container-fluid d-flex">
                    <img src="${data.message.userimage}" class="userimagechat">
                    <div><h6>${data.message.username}</h6> <p>${data.message.fecha}</p></div>
                </div>
                <div class="alert alert-danger p-2 pb-0">
                    <p>${data.message.message}</p>                    
                </div>
                `;

                mensaje.disabled = true;
                enviar_mensaje.disabled = true;
                archivo.disabled = true;
                scrollDown();
            }
        }

        // if (data.alert) {
        //     alert(data.alert.message);
        // }
    };
    
    const mensaje = document.querySelector('#mensaje');
    const enviar_mensaje = document.querySelector('#enviarmensaje');

    function nuevo_mensaje () {
        if (websocket.readyState === WebSocket.OPEN) {
            websocket.send(JSON.stringify({
                'message' : mensaje.value
            }));

            reiniciar_multimedia();
            scrollDown();
        } else {
            console.error('Conexión websocket no disponible.');
        }
    }

    // Opciones para el envío de mensajes al servidor a través del socket.
    enviar_mensaje.addEventListener('click', nuevo_mensaje);
    mensaje.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            nuevo_mensaje();
        }
    });

    // Configuraciones del envío de multimedia.
    const compartir = document.querySelector('#multimedia');
    const archivo = document.querySelector('#file');
    let multimedia = '';

    // Cambia el diseño del botón de envío de archivos, habilita o desabilita según lo establecido.
    function reiniciar_multimedia() {
        mensaje.value = '';
        compartir.innerHTML = '<i class="bi bi-folder-fill"></i> Archivo';
        mensaje.disabled = false;
        multimedia = '';
    }

    compartir.addEventListener('click', () => {
        if (multimedia !== '') {
            reiniciar_multimedia();
        } else {
            archivo.click();
        }
    });

    archivo.addEventListener('change', (e) => {
        multimedia = e.target.files[0];
        if (!multimedia) {
            console.log('No se seleccionaron archivos');
            return;
        }
        mensaje.value = `Archivo a enviar: ${multimedia.name}`;
        compartir.innerHTML = '<i class="bi bi-x-circle-fill"></i> Cancelar';
        mensaje.disabled = true;
    });

    // Permite a la pantalla de mensajes estar siempre al final.
    function scrollDown() {
        ventana.scrollTop = ventana.scrollHeight;
        requestAnimationFrame(() => {
            ventana.scrollTop = ventana.scrollHeight;
        });
    }  
});
