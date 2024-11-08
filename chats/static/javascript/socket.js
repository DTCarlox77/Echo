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

        // Sí entra un objeto de tipo sistema.
        if (data.typing) {

            function mostrar_escribiendo() {
                const contenedor_notificacion = document.querySelector('#typing_user_notification_container');
                const mensaje_escribiendo = document.querySelector('#typing_user_notification');
                mensaje_escribiendo.textContent = data.message;

                contenedor_notificacion.style.opacity = 1;
                contenedor_notificacion.style.transition = 'all 0.5s ease-in-out';

                setTimeout(() => {
                    contenedor_notificacion.style.opacity = 0;

                    setTimeout(() => {
                        contenedor_notificacion.remove();
                    }, 500);
                    
                }, 500);
            }

            try {
                if (username_dom.textContent !== data.username) {
                    mostrar_escribiendo();
                }

            } catch (error) {                
                ventana.innerHTML += `
                <div id="typing_user_notification_container">
                    <div class="alert alert-light center" style="display: flex; justify-content:center;">
                        <p class="m-0" id="typing_user_notification">${data.message}</p>
                    </div>
                </div>
                `;

                mostrar_escribiendo();
            }
        }

        if (data.sistema) {
            
            const color = (parseInt(data.evento) === 0) ? 'alert-success' : 'alert-danger';

            ventana.innerHTML += `
            <div id="active_user_notification">
                <div class="alert ${color} center" style="display: flex; justify-content:center;">
                    <p class="m-0">${data.sistema}</p>
                </div>
            </div>
            `;

            setTimeout(() => {
                const alert_send = document.querySelector('#active_user_notification');
                alert_send.style.transition = 'opacity 1s ease-in-out';
                alert_send.style.opacity = '0';

                setTimeout(() => {
                    alert_send.style.display = 'none';
                }, 1000);
            }, 2000);
        }

        // El contenido será el objeto a renderizar, data es la información enviada por el servidor.
        function generar_mensaje(contenido, data) {
            const propio = (data.message.username === username_dom.textContent);
            const id = (data.message.id !== '') ? data.message.id : '';

            if (propio) {                
                ventana.innerHTML += `
                <div class="mensaje-sala">
                    <div class="container-fluid d-flex" style="flex-direction: row-reverse;">
                        <img src="${data.message.userimage}" class="userimagechat" >
                        <div style="margin-right: 10px;"><a href="/profile/${id}" style="color: black;"><h6>${data.message.username}</h6></a> <p>${data.message.fecha}</p></div>
                    </div>
                    ${contenido}
                </div>
                `;
            }

            else {
                ventana.innerHTML += `
                <div class="mensaje-sala">
                    <div class="container-fluid d-flex">
                        <img src="${data.message.userimage}" class="userimagechat">
                        <div><a href="/profile/${id}" style="color: black;"><h6>${data.message.username}</h6></a> <p>${data.message.fecha}</p></div>
                    </div>
                    ${contenido}
                </div>
                `;
            }
        }

        // Sí entra un objeto de tipo mensaje.
        if (data.message) {

            let contenido;

            const mensaje_tipo = data.message.username === username_dom.textContent ? 'alert-info' : 'alert-light';

            // Si entra un mensaje normal.
            if (data.message.message && !data.message.expelled && !data.message.markdown) {

                // Creación de los contenedores de mensaje de forma manual (para evitar inyección HTML).
                const contenedor_general = document.createElement('div');
                contenedor_general.classList.add('mensaje-sala');

                const subcontenedor_informacion = document.createElement('div');
                const subcontenedor_mensaje = document.createElement('div');

                subcontenedor_informacion.classList.add('container-fluid', 'd-flex');
                subcontenedor_mensaje.classList.add('alert', mensaje_tipo, 'p-2', 'pb-0');

                const imagen_usuario = document.createElement('img');
                imagen_usuario.src = data.message.userimage;
                imagen_usuario.classList.add('userimagechat');

                subcontenedor_informacion.appendChild(imagen_usuario);

                const contenedor_usuario = document.createElement('div');
                const url_usuario = document.createElement('a');
                url_usuario.href = `/profile/${data.message.id}`;
                url_usuario.style.color = 'black';

                const nombre_usuario = document.createElement('h6');
                nombre_usuario.textContent = data.message.username;

                url_usuario.appendChild(nombre_usuario);
                contenedor_usuario.appendChild(url_usuario);

                const fecha_mensaje = document.createElement('p');
                fecha_mensaje.textContent = data.message.fecha;

                contenedor_usuario.appendChild(fecha_mensaje);

                subcontenedor_informacion.appendChild(contenedor_usuario);

                const contenido_mensaje = document.createElement('p');
                contenido_mensaje.textContent = data.message.message;
                contenido_mensaje.style.overflowWrap = 'break-word';

                subcontenedor_mensaje.appendChild(contenido_mensaje);

                // const del_button = document.createElement('button');
                // del_button.textContent = 'Eliminar';
                // del_button.classList.add('btn', 'btn-outline-danger', 'del_button_sk', 'mb-2');
                // del_button.setAttribute('message_id', data.message.id_mensaje);

                const contenedor_acciones = document.createElement('div');
                contenedor_acciones.classList.add('d-flex');
                // contenedor_acciones.appendChild(del_button);
                
                contenedor_general.appendChild(subcontenedor_informacion);
                contenedor_general.appendChild(subcontenedor_mensaje);
                contenedor_general.appendChild(contenedor_acciones);
                // contenedor_general.id = data.message.id;

                if (data.message.username === username_dom.textContent) {
                    contenido_mensaje.style.textAlign = 'right';
                    subcontenedor_informacion.style.flexDirection = 'row-reverse';
                    contenedor_acciones.style.flexDirection = 'row-reverse';
                    contenedor_usuario.style.marginRight = '10px';
                //    del_button.style.textAlign = 'right';
                }

                ventana.appendChild(contenedor_general);

                const mensajes = ventana.querySelectorAll('.mensaje-sala');
                if (mensajes.length > 30) {
                    mensajes[0].remove();
                }
            }

            else if (data.message.markdown) {

                if (window.DOMPurify) {
                    const contenido_limpio = DOMPurify.sanitize(data.message.message);

                    contenido = `
                        <div class="alert alert-light p-2 pb-0">
                            <div class="d-flex">
                                <span class="bi bi-markdown"></span>
                                <h6 class="m-1">Markdown</h6>
                            </div>
                            <hr>
                            <div class="container markdown">
                                ${contenido_limpio} 
                            </div>
                        </div>
                    `;

                    generar_mensaje(contenido, data);
                    
                } else {
                    contenido = `
                        <div class="alert alert-light p-2 pb-0">
                            <div class="d-flex">
                                <span class="bi bi-markdown"></span>
                                <h6 class="m-1">Markdown</h6>
                            </div>
                            <hr>
                            <div class="container markdown">
                                <code>No se ha podido renderizar el contenido Markdown.<code>
                            </div>
                        </div>
                    `;

                    generar_mensaje(contenido, data);
                }
            }

            // Sí entra un mensaje de un usuario que ha sido expulsado.
            else if (data.message.expelled) {
                ventana.innerHTML += `
                    <div class="mensaje-sala">
                        <div class="container-fluid d-flex">
                            <img src="${data.message.userimage}" class="userimagechat">
                            <div><h6>${data.message.username}</h6> <p>${data.message.fecha}</p></div>
                        </div>
                        <div class="alert alert-danger p-2 pb-0">
                            <p>${data.message.message}</p>                    
                        </div>
                    </div>
                `;

                mensaje.disabled = true;
                enviar_mensaje.disabled = true;
                archivo.disabled = true;
            }

            else if (data.message.file_content) {
            
                const file_content_64 = data.message.file_content;
                const file_type = data.message.file_type;
                const file_name = data.message.file_name;

                // Decodificación del formato base 64.
                const file_content = atob(file_content_64);

                // Creación de un Blob (objeto de datos binarios) a partir del contenido del archivo.
                const blob = new Blob([Uint8Array.from(file_content, c => c.charCodeAt(0))], { type: file_type });

                try {
                    if (file_type.startsWith('audio/')) {

                        contenido = `
                            <div class="audio-container alert alert-light p-2 pb-0">
                                <div class="d-flex">
                                    <span class="bi bi-file-earmark-music"></span>
                                    <h6 class="m-1">Audio</h6>
                                </div>
                                <p class="file_name">${file_name}</p>
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

                        contenido = `     
                            <div class="file-container alert alert-light p-2 pb-0">
                                <div class="d-flex">
                                    <span class="bi bi-filetype-pdf"></span>
                                    <h6 class="m-1">Documento PDF</h6>
                                </div>
                                <p class="file_name">${file_name}</p>
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
    
                    else if (file_type.startsWith('video/')) {
                        contenido = `      
                            <div class="audio-container alert alert-light p-2 pb-0">
                                <div class="d-flex">
                                    <span class="bi bi-play-btn"></span>
                                    <h6 class="m-1">Video</h6>
                                </div>
                                <p class="file_name">${file_name}</p>
                                <div class="alert alert-light p-2 pb-0">
                                    <video class="videos" controls>
                                        <source src="${URL.createObjectURL(blob)}">
                                    </video>                  
                                </div>
                            </div>
                        `;
                    }
    
                    else if (file_type.startsWith('image/')) {
                        contenido = `
                            <div class="audio-container alert alert-light p-2 pb-0">
                                <div class="d-flex">
                                    <span class="bi bi-image"></span>
                                    <h6 class="m-1">Imagen</h6>
                                </div>
                                <p class="file_name">${file_name}</p>
                                <hr>
                                <img class="chat-image mb-2" src="${URL.createObjectURL(blob)}" alt="">   
                            </div>
                        `;
                    }
    
                    else {

                        contenido = `
                            <div class="file-container alert alert-light p-2 pb-0">
                                <div class="d-flex">
                                    <span class="bi bi-file-earmark-text"></span>
                                    <h6 class="m-1">Archivo</h6>
                                </div>
                                <p class="file_name">${file_name}</p>
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
                    generar_mensaje(contenido, data);

                } catch (error) {

                    contenido = `
                        <div class="file-container alert alert-light p-2 pb-0">
                            <div class="d-flex">
                                <span class="bi bi-file-binary"></span>
                                <h6 class="m-1">Fichero</h6>
                            </div>
                            <p class="file_name">${file_name}</p>
                            <hr>
                            <div class="container">
                                <a href="${URL.createObjectURL(blob)}" download="${file_name}">
                                <button class="btn btn-outline-dark">Descargar</button>
                                </a>
                            </div>
                            <br>
                        </div>
                    `;
                    generar_mensaje(contenido, data);
                }
            }

            // const botones_eliminar = document.querySelectorAll('.del_button_sk');
            // botones_eliminar.forEach(boton => {
            //     boton.addEventListener('click', () => {
            //         const button_id = boton.getAttribute('message_id');
            //         websocket.send(JSON.stringify({
            //             'del_message' : 'value'
            //         }));
            //     });
            // });
        }

        bajar_sroll();
    };
    
    const mensaje = document.querySelector('#mensaje');
    const enviar_mensaje = document.querySelector('#enviarmensaje');
    let posicion = 0;

    function regular_comandos() {
        const comandos = [
            '',
            '/md ',
            '/eb ',
            '/rmd (h1(Mensaje))[Propiedades]'
        ];

        if (posicion > 3) {
            posicion = 0;
        }

        if (posicion < 0) {
            posicion = 3;
        }

        if (posicion !== 0) {
            mensaje.value = comandos[posicion];
        }
    }

    mensaje.addEventListener('keyup', (e) => {
        websocket.send(JSON.stringify({
            'typing' : true,
            'username' : username_dom.textContent
        }));
    
        if (e.key === 'ArrowUp') {
            mensaje.value = '';
            posicion++;

            regular_comandos();
        }
        if (e.key == 'ArrowDown') {
            mensaje.value = '';
            posicion--;

            regular_comandos();
        }
    });
    

    function nuevo_mensaje () {

        if (websocket.readyState === WebSocket.OPEN) {
            if (mensaje.value !== '' && !multimedia) {                
                websocket.send(JSON.stringify({
                    'message' : mensaje.value
                }));
                mensaje.value = '';
                posicion = 0;

            } else if (multimedia) {
                reiniciar_multimedia();
                archivo.disabled = true;

                const media_data = new FormData();
                media_data.append('multimedia', document.querySelector('#file').files[0]);

                fetch(`/mediaroom/${room_id}/`, {
                    method: 'POST',
                    body: media_data
                })
                .then(response => response.json())
                .then(data => {

                    function mostrar_multimedia() {
                        const alert_send = document.querySelector('#send_notification');
                        alert_send.style.opacity = 1;
                        alert_send.style.transition = 'opacity 1s ease-in-out';
            
                        setTimeout(() => {
                            alert_send.style.opacity = 0;
            
                            setTimeout(() => {
                                alert_send.style.display = 'none';
                                alert_send.remove();
            
                                websocket.send(JSON.stringify({
                                    'message' : mensaje.value,
                                    'id_archivo' : data.id
                                }));
            
                                archivo.value = '';
                                archivo.disabled = false;
                                bajar_sroll();
                            }, 1000);
                            
                        }, 2000);
                    }

                    try {
                        mostrar_multimedia();

                    } catch (error) {
                        ventana.innerHTML += `
                        <div id="send_notification">
                            <div class="alert alert-warning center" style="display: flex; justify-content:center;">
                                <p class="m-0">Tu archivo se está enviando</p>
                            </div>
                        </div>
                        `;
                        mostrar_multimedia();
                    }
                })
                .catch(error => {
                    alert_send.remove();
                    console.error("Error con la solicitud:", error);
                });
                bajar_sroll();
            }
        } else {
            console.error('Conexión websocket no disponible.');
        }
    }

    // Opciones para el envío de mensajes al servidor a través del socket.
    enviar_mensaje.addEventListener('click', nuevo_mensaje);

    // Envío por enter deshabilitado.
    // mensaje.addEventListener('keydown', (e) => {
    //     if (e.key === 'Enter' && !e.shiftKey) {
    //         e.preventDefault();
    //         nuevo_mensaje();
    //     }
    // });

    // Configuraciones del envío de multimedia.
    const compartir = document.querySelector('#multimedia');
    const archivo = document.querySelector('#file');
    let multimedia = '';

    // Cambia el diseño del botón de envío de archivos, habilita o desabilita según lo establecido.
    function reiniciar_multimedia() {
        mensaje.value = '';
        posicion = 0;
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
    function bajar_sroll() {
        ventana.scrollTop = ventana.scrollHeight;
        requestAnimationFrame(() => {
            ventana.scrollTop = ventana.scrollHeight;
        });
    }  
});

// Por Adrián (Perdón por el código espaguetti xd).