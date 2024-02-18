document.addEventListener('DOMContentLoaded', function() {
    const busqueda = document.getElementById('busqueda');
    const contenedor_salas = document.querySelector('#contenedor_salas');
    const salas = contenedor_salas.querySelectorAll('.sala');

    busqueda.addEventListener('keyup', () => {
        contenedor_salas.innerHTML = `
        <div class="border rounded m-2 p-4 d-flex">
            <div class="container">
                <h3>No se encontraron salas</h3>
                <br>
                <p>Verifica que el nombre introducido en la búsqueda esté correctamete escrito.</p>
            </div>
        </div>
        <br>
        <br>
        <br>
        `;

        if (busqueda.value === '') {
            contenedor_salas.innerHTML = '';
            salas.forEach(room => {
                const imagen = room.querySelector('img').src;
                const nombre = room.querySelector('h3').textContent;
                const creador = room.querySelector('p').textContent;
                const url = room.querySelector('a').href;
                const public = room.querySelector('h6').textContent;
                const variable = (public !== '') ? 'Sala pública' : ''
                contenedor_salas.innerHTML += `
                <div class="sala border rounded r-4 m-1 p-1 d-flex">
                    <div class="container conimagecon m-2">
                        <img class="room_img" src="${imagen}" alt="">
                    </div>
                    <div class="container contextto">
                        <br>
                        <h3>${nombre}</h3>
                        <h6 style="color: green;">${variable}</h6>
                        <p>${creador}</p>
                        <button style="max-width: 150px; display:flex; justify-content:center;" type="button" class="btn btn-dark"><a style="color: white;" class="m-0 p-1" href="${url}">Ingresar</a></button>
                        <br>
                    </div>
                </div>
                `;
            }); 
        } else {
            salas.forEach(room => {
                const imagen = room.querySelector('img').src;
                const nombre = room.querySelector('h3').textContent;
                const creador = room.querySelector('p').textContent;
                const url = room.querySelector('a').href;
                const public = room.querySelector('h6').textContent;
                const variable = (public !== '') ? 'Sala pública' : ''
                if (room.querySelector('h3').textContent.toLowerCase().includes(busqueda.value.toLowerCase())) {
                    contenedor_salas.innerHTML = '';
                    contenedor_salas.innerHTML += `
                    <div class="sala border rounded r-4 m-1 p-1 d-flex">
                        <div class="container conimagecon m-2">
                            <img class="room_img" src="${imagen}" alt="">
                        </div>
                        <div class="container contextto">
                            <br>
                            <h3>${nombre}</h3>
                            <h6 style="color: green;">${variable}</h6>
                            <p>${creador}</p>
                            <button style="max-width: 150px; display:flex; justify-content:center;" type="button" class="btn btn-dark"><a style="color: white;" class="m-0 p-1" href="${url}">Ingresar</a></button>
                            <br>
                        </div>
                    </div>
                    `;
                }
            });
        }
    });
});