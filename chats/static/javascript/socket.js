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

            else if (data.message.file_content) {

                ventana.innerHTML += `
                <div class="container-fluid d-flex">
                    <img src="${data.message.userimage}" class="userimagechat">
                    <div><h6>${data.message.username}</h6> <p>${data.message.fecha}</p></div>
                </div>
                `;
            
                const file_content_64 = data.message.file_content;
                const file_type = data.message.file_type;
                const file_name = data.message.file_name;

                // Decodificación del formato base 64.
                const file_content = atob(file_content_64);

                // Creación de un Blob (objeto de datos binarios) a partir del contenido del archivo.
                const blob = new Blob([Uint8Array.from(file_content, c => c.charCodeAt(0))], { type: file_type });

                if (file_type.startsWith('audio/')) {
                    ventana.innerHTML += `
                    <div class="audio-container alert alert-light p-2 pb-0">
                        <div class="d-flex">
                            <span class="bi bi-file-earmark-music"></span>
                            <h6 class="m-1">Audio</h6>
                        </div>
                        <p>${file_name}</p>
                        <hr>
                        <div class="container">
                            <audio controls class="w-100">
                                <source src="${URL.createObjectURL(blob)}">
                            </audio>   
                        </div>
                    </div>
                    `;
                }

                else if (file_type === 'application/pdf') {
                    ventana.innerHTML += `                    
                    <div class="file-container alert alert-light p-2 pb-0">
                        <div class="d-flex">
                            <span class="bi bi-filetype-pdf"></span>
                            <h6 class="m-1">Documento PDF</h6>
                        </div>
                        <p>${file_name}</p>
                        <hr>
                        <div class="container">
                            <a href="${URL.createObjectURL(blob)}" download="${file_name}">
                            <button class="btn btn-outline-dark">Descargar</button>
                            </a>
                        </div>
                        <br>
                    </div>
                    `;
                }

                else if (file_type === 'video/') {
                    ventana.innerHTML += `                    
                    <div class="file-container alert alert-light p-2 pb-0">
                        <div class="d-flex">
                            <span class="bi bi-play-btn"></span>
                            <h6 class="m-1">Video</h6>
                        </div>
                        <p>${file_name}</p>
                        <div class="alert alert-info p-2 pb-0">
                            <video class="videos" controls>
                                <source src="${URL.createObjectURL(blob)}">
                            </video>                  
                        </div>
                    </div>
                    `;
                }

                else if (file_type.startsWith('image/')) {
                    ventana.innerHTML += `                    
                    <div class="audio-container alert alert-light p-2 pb-0">
                        <div class="d-flex">
                            <span class="bi bi-image"></span>
                            <h6 class="m-1">Imagen</h6>
                        </div>
                        <p>${file_name}</p>
                        <hr>
                        <img class="chat-image mb-2" src="${URL.createObjectURL(blob)}" alt="">   
                    
                    </div>
                    `;
                }

                else {
                    ventana.innerHTML += `
                    <div class="file-container alert alert-light p-2 pb-0">
                        <div class="d-flex">
                            <span class="bi bi-file-earmark-text"></span>
                            <h6 class="m-1">Archivo</h6>
                        </div>
                        <p>${file_name}</p>
                        <hr>
                        <div class="container">
                            <a href="${URL.createObjectURL(blob)}" download="${file_name}">
                            <button class="btn btn-outline-dark">Descargar</button>
                            </a>
                        </div>
                        <br>
                    </div>
                    `;
                }
            }

            scrollDown();   
        }
    };
    
    const mensaje = document.querySelector('#mensaje');
    const enviar_mensaje = document.querySelector('#enviarmensaje');

    function nuevo_mensaje () {
        if (websocket.readyState === WebSocket.OPEN) {
            if (mensaje.value !== '' && !multimedia) {                
                websocket.send(JSON.stringify({
                    'message' : mensaje.value
                }));
                mensaje.value = '';

            } else if (multimedia) {
                reiniciar_multimedia();
                scrollDown();

                const media_data = new FormData();
                media_data.append('multimedia', document.querySelector('#file').files[0]);

                fetch(`/mediaroom/${room_id}/`, {
                    method: 'POST',
                    body: media_data
                })
                .then(response => response.json())
                .then(data => {
                    // Acciones que se podrían agregar si el envío multimedia es aceptado.
                    websocket.send(JSON.stringify({
                        'message' : mensaje.value,
                        'id_archivo' : data.id
                    }));
                })
                .catch(error => console.error("Error con la solicitud:", error));


            }
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

    archivo.addEventListener('change', (e) => {
        multimedia = e.target.files[0];
        if (!multimedia) {
            return;
        }
        mensaje.value = `Archivo a enviar: ${multimedia.name}`;
        compartir.innerHTML = '<i class="bi bi-x-circle-fill"></i> Cancelar';
        mensaje.disabled = true;
    });

    compartir.addEventListener('click', () => {
        if (multimedia !== '') {
            reiniciar_multimedia();
        } else {
            archivo.click();
        }
    });

    // Permite a la pantalla de mensajes estar siempre al final.
    function scrollDown() {
        ventana.scrollTop = ventana.scrollHeight;
        requestAnimationFrame(() => {
            ventana.scrollTop = ventana.scrollHeight;
        });
    }  
});
