document.addEventListener('DOMContentLoaded', () => {

    let rutaCompleta = window.location.pathname;
    let partesDeLaRuta = rutaCompleta.split('/');
    let roomId = partesDeLaRuta[2]; 
    let wsProtocol = window.location.protocol === "https:" ? "wss" : "ws";
    
    const websocket = new WebSocket(`${wsProtocol}://${window.location.host}/ws/room/${roomId}/`);
    const ventana = document.querySelector('#ventana');
    const username_dom = document.querySelector('#nombre_usuario');
    
    websocket.onmessage = (e) => {
        const data = JSON.parse(e.data)
        if (data.message) {
            const mensajeTipo = data.username === username_dom.textContent ? 'alert-info' : 'alert-light';
            ventana.innerHTML += `
            <div class=""><h6>${data.username}</h6> <p>${data.fecha}</p></div>
                <div class="alert ${mensajeTipo} p-2 pb-0">
                    <p>${data.message}</p>                    
                </div>

            `;
            scrollDown();
        }
    };
    
    websocket.onopen = (e) => {
        console.log('Conexión con el websocket establecida.');
    };

    websocket.onclose = (e) => {
        console.error('La conexión con el websocket ha sido cerrada.');
    };

    websocket.onerror = (e) => {
        console.error('Error en la conexión websocket.');
    };

    const mensaje = document.querySelector('#mensaje');
    const enviar_mensaje = document.querySelector('#enviarmensaje');

    enviar_mensaje.addEventListener('click', () => {
        if(websocket.readyState === WebSocket.OPEN) {
            websocket.send(JSON.stringify({
                'message' : mensaje.value
            }));
            reiniciar_multimedia();
            scrollDown();
        } else {
            console.error("WebSocket no está abierto.");
        }
    });

    const compartir = document.querySelector('#multimedia');
    const archivo = document.querySelector('#file');
    let multimedia = '';

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

    function scrollDown() {
        ventana.scrollTop = ventana.scrollHeight;
        requestAnimationFrame(() => {
            ventana.scrollTop = ventana.scrollHeight;
        });
    }  
});
