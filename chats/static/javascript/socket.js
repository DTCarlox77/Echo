document.addEventListener('DOMContentLoaded', () => {

    let rutaCompleta = window.location.pathname;

    // Divide la ruta en partes usando '/' como separador.
    let partesDeLaRuta = rutaCompleta.split('/');
    
    // Asume que la URL sigue el patrón /room/{id}/, y extrae el ID.
    let roomId = partesDeLaRuta[2]; 
    
    const websocket = new WebSocket(`ws://${window.location.host}/ws/room/${roomId}/`);
    const ventana = document.querySelector('#ventana');
    const username_dom = document.querySelector('#nombre_usuario');
    
    websocket.onmessage = (e) => {
        const data = JSON.parse(e.data)
        
        if (data.message) {

            if (data.username === username_dom.textContent) {
                ventana.innerHTML += `
                <div class="alert alert-primary mt-2">
                    <h3>${data.username}</h3>
                    <p>${data.message}</p>
                </div>
                `;
            } else {
                ventana.innerHTML += `
                <div class="alert alert-success mt-2">
                    <h3>${data.username}</h3>
                    <p>${data.message}</p>
                </div>
                `;
            }
    
            scrollDown();
        }
    };
    
    websocket.onclose = (e) => {
        console.error('La conexión con el websocket ha fallado.');
    };

    const mensaje = document.querySelector('#mensaje');
    const enviar_mensaje = document.querySelector('#enviarmensaje');
    let tipo_mensaje = '';
    
    enviar_mensaje.addEventListener('click', () => {
        
        websocket.send(
            JSON.stringify({
                'message' : mensaje.value
            })
        );

        reiniciar_multimedia();
        scrollDown();
    });


    const compartir = document.querySelector('#multimedia');
    const archivo = document.querySelector('#file');
    let multimedia = '';

    function reiniciar_multimedia() {
        mensaje.value = '';
        compartir.innerHTML = '<h4>Multimedia</h4>';
        mensaje.disabled = false;
        multimedia = '';
    }

    compartir.addEventListener('click', () => {

        console.log(multimedia);
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
        compartir.innerHTML = '<h4>Cancelar</h4>';
        mensaje.disabled = true;
        
    });

    scrollDown();

    function scrollDown() {
        ventana.scrollTop = ventana.scrollHeight;
    
        requestAnimationFrame(() => {
            ventana.scrollTop = ventana.scrollHeight;
        });
    }  
});

