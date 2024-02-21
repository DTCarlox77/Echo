$(document).ready(function() {
    const cargar_salas = $('#cargar-mas-btn');
    const contenedor_salas = $('#contenedor_salas');
    const search = $('#btn-search');
    const busqueda = $('#busqueda');
    const carga = $('#load-rooms');
    const notfound = $('#not-found');
    const cancel = $('#btn-cancel');
    
    // Cantidad de salas por defecto.
    let offset = 3; 

    cancel.on('click', function() {
        contenedor_salas.html('');
        cargar_salas.css('display', 'block');
        cancel.css('display', 'none');
        notfound.css('display', 'none');

        cargar_salas.prop('disabled', false);
        cargar_salas.text('Cargar más');
        offset = 3; 

        $.ajax({
            url: 'cancel',
            method: 'GET',
            success: function(data) {
                if (data.salas_html) {
                    if (data.salas_html.trim() !== '') {
                        contenedor_salas.css('display', 'block');
                        contenedor_salas.append(data.salas_html);
                        offset = data.total_salas;
                    }
                }
            }
        });
    });

    search.on('click', function() {
        // Verifica si el campo de búsqueda tiene un valor.
        offset = 3; 
        
        if (busqueda.val().trim() !== '') {
            contenedor_salas.html('');
            notfound.css('display', 'none');
            cancel.css('display', 'block');
            
            // Realizar la búsqueda con AJAX.
            $.ajax({
                url: 'search',
                method: 'GET',
                data: {
                    'busqueda': busqueda.val()
                },
                success: function(data) {
                    cargar_salas.css('display', 'none');
    
                    if (data.salas_html) {
                        if (data.salas_html.trim() !== '') {
                            contenedor_salas.css('display', 'block');
                            contenedor_salas.append(data.salas_html);
                            offset = data.total_salas; 
                        }
                    } else {
                        notfound.css('display', 'block');
                        contenedor_salas.css('display', 'none');
                    }
                }
            });
        } else {
            console.log('El campo de búsqueda está vacío. Ingresa un término de búsqueda válido.');
        }
    });    

    cargar_salas.on('click', function() {
        carga.fadeIn();

        // Solicitud AJAX para la carga de salas.
        $.ajax({
            url: 'load',
            method: 'GET',
            data: {
                offset: offset,
            },
            success: function(data) {

                if (data.salas_html) {
                    if (data.salas_html.trim() !== '') {
                        // Se agregan las nuevas salas al contenedor.
                        carga.fadeOut(); 
                        contenedor_salas.append(data.salas_html);
                        offset += 3;  // Incremento de la cantidad total de las salas.
                    }
                }
                else {
                    // Si no hay más salas se deshabilita el botón y se cambia el texto.
                    cargar_salas.prop('disabled', true);
                    cargar_salas.text('No hay más salas');
                    carga.fadeOut(); 
                }
            }
        });
    });
});
