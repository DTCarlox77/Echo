document.addEventListener('DOMContentLoaded', function() {
    const busqueda = document.getElementById('busqueda');
    const contenedor_salas = document.querySelector('#contenedor_salas');
    const salas = contenedor_salas.querySelectorAll('.sala');

    busqueda.addEventListener('keyup', () => {
        contenedor_salas.innerHTML = `
        <div class="border rounded m-2 p-4 d-flex">
            <div class="container d-flex">
                <h3>No hay salas disponibles</h3>
            </div>
        </div>
        `;

        if (busqueda.value === '') {
            contenedor_salas.innerHTML = '';
            salas.forEach(room => {
                const imagen = room.querySelector('img').src;
                const nombre = room.querySelector('h3').textContent;
                const creador = room.querySelector('h4').textContent;
                const url = room.querySelector('a').href;
                const public = room.querySelector('h6').textContent;
                const variable = (public !== '') ? 'Sala pública' : ''
                contenedor_salas.innerHTML += `
                <div class="sala border rounded m-2 p-4 d-flex g-4">
                    <div class="m-2">
                        <img class="room_img" src="${imagen}" alt="">
                    </div>
                    <div class="container">
                        <h3>${nombre}</h3>
                        <h6 style="color: green;">${variable}</h6>
                        <h4>${creador}</h4>
                        <br>
                        <a href="${url}"><button type="button" class="btn btn-dark"><h4>Ingresar</h4></button></a>
                    </div>
                </div>
                `;
            }); 
        } else {
            salas.forEach(room => {
                const imagen = room.querySelector('img').src;
                const nombre = room.querySelector('h3').textContent;
                const creador = room.querySelector('h4').textContent;
                const public = room.querySelector('h6').textContent;
                const variable = (public !== '') ? 'Sala pública' : ''
                const url = room.querySelector('a').href;
                if (room.querySelector('h3').textContent.toLowerCase().includes(busqueda.value.toLowerCase())) {
                    contenedor_salas.innerHTML = '';
                    contenedor_salas.innerHTML += `
                    <div class="sala border rounded m-2 p-4 d-flex g-4">
                        <div class="m-2">
                            <img class="room_img" src="${imagen}" alt="">
                        </div>
                        <div class="container">
                            <h3>${nombre}</h3>
                            <h6 style="color: green;">${variable}</h6>
                            <h4>${creador}</h4>
                            <br>
                            <a href="${url}"><button type="button" class="btn btn-dark"><h4>Ingresar</h4></button></a>
                        </div>
                    </div>
                    `;
                }
            });
        }
    });
});