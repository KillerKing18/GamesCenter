const mapaProductos = new Map();

$(document).ready(function() {
    
    /*$.getJSON("json/productos.json", function(jsonResponse) {
        localStorage.clear();
        localStorage.setItem('datos', JSON.stringify(jsonResponse));
    });*/

    if (localStorage.getItem('datos') == null) {
        localStorage.setItem('datos', '[]');
    }
    
    let plataformas = JSON.parse( localStorage.getItem('datos') );

    // Por cada plataforma en el archivo json, añadimos una pestaña y en cada pestaña añadimos las categorías y sus productos
    for (var i in plataformas) {

        $('#pills-tab').append(addNavItem(plataformas[i]['id'], plataformas[i]['name']));

        $('#pills-tab-content').append(addTabPane(plataformas[i]['id'], addGeneros(plataformas[i]['arrayGeneros'], plataformas[i]['id'])));

        // Ocultamos el mensaje de que no hay géneros si hay algún género
        if (Object.keys(plataformas[i]['arrayGeneros']).length !== 0) {
            $('#empty-genres-' + plataformas[i]['id']).hide();
        }
    }

    // Ocultamos el mensaje de que no hay plataformas si hay alguna plataforma
    if (Object.keys(plataformas).length !== 0) {
        $('#empty-platforms').hide();
    }

    // Seleccionamos el botón de la primera plataforma
    $('#pills-tab button:first').addClass("active");
    
    // Mostramos el contenido de la primera plataforma
    $('#pills-tab-content div:first').addClass("show active");

    // Mostramos los productos del primer género de cada plataforma
    $('.accordion-item:first-child .accordion-collapse').addClass('show');

    $('#total-precio-cesta').hide(); // Ocultamos el total de la cesta al principio, ya que está vacía

    eventHandlers();
});

function addNavItem(id, name) {
    return  "<li class='nav-item' role='presentation'>" +
                "<button class='nav-link' id='pills-" + id + "-tab' data-bs-toggle='pill' data-bs-target='#pills-" + id + "' type='button' role='tab' aria-controls='pills-" + id + "' aria-selected='true'>" + name + "</button>" +
            "</li>";
}

function addTabPane(id, generosText) {
    return "<div class='tab-pane fade' id='pills-" + id + "' role='tabpanel' aria-labelledby='pills-" + id + "-tab'>" +
                "<div class='mt-5' id='empty-genres-" + id + "'>" +
                    "<p class='text-center'>Aún no hay ningún género</p>" +
                "</div>" +
                "<div class='accordion' id='accordion" + id + "'>" +
                    generosText + 
                "</div>" +
            "</div>";
}

function addGeneros(generos, id) {
    var text = "";
    for (var i in generos) {

        // Mostramos un mensaje diciendo que no hay productos para este género si no los hay
        var emptyProductsDiv = "";
        if (Object.keys(generos[i]['productos']).length === 0) {
            emptyProductsDiv = "    <div class='mt-5' id='empty-products-" + generos[i]['id'] + "-" + id + "'>" +
                                        "<p class='text-center'>Aún no hay ningún producto para este género</p>" +
                                    "</div>";
        }

        text += "<div class='accordion-item'>" +
                    "<h2 class='accordion-header' id='heading-" + generos[i]['id'] + "-" + id + "'>" +
                        "<button class='accordion-button' type='button' data-bs-toggle='collapse' data-bs-target='#collapse-" + generos[i]['id'] + "-" + id + "' aria-expanded='true' aria-controls='collapse-" + generos[i]['id'] + "-" + id + "'>" +
                        generos[i]['name'] +
                        "</button>" +
                    "</h2>" +
                    "<div id='collapse-" + generos[i]['id'] + "-" + id + "' class='accordion-collapse collapse' aria-labelledby='heading-" + generos[i]['id'] + "-" + id + "' data-bs-parent='#accordion" + id + "'>" +
                        emptyProductsDiv +
                        "<div class='accordion-body'>" +
                            "<div class='row'>" +
                                addProductos(generos[i]['productos']) +
                            "</div>" +    
                        "</div>" +
                    "</div>" +
                "</div>";
    }
    return text;
}

function addProductos(productos) {
    var text = "";
    for (var i in productos) {
        productos[i]['descripcion'] = productos[i]['descripcion'].replace("\'", "&#39;");
        mapaProductos.set(productos[i]['codigo'], productos[i]);
        text += "   <div class='col-12 col-lg-6 col-xl-4 d-lg-flex'>" + // d-flex hace que todas las tarjetas tengan la misma altura
                        "<div class='card' data-codigo='" + productos[i]['codigo'] + "' style='margin-bottom: 20px;'>" +
                            "<img src='" + productos[i]['imagen'] + "' alt='" + productos[i]['descripcion'] + "' class='card-img-top img-thumbnail zoom'/>" +
                            "<div class='card-body d-flex flex-column'>" + // d-flex y flex-column junto al uso de mt-auto más abajo hace que el botón se quede abajo de la tarjeta y el precio en el medio
                                "<h4 title='" + productos[i]['descripcion'] + "' class='card-title text-center truncate'>" + productos[i]['descripcion'] + "</h4>" +
                                "<div class='d-flex flex-row-reverse'>" +
                                    "<span class='badge bg-secondary'>Ref.: " + productos[i]['codigo'] + "</span>" +
                                "</div>" +
                                "<br><h2 class='card-text mb-4 mt-auto'>" + String(productos[i]['precio']).replace(".", ",") + "€</h2>" +
                                "<div class='mt-auto'>" +
                                    "<h6 class='card-subtitle mb-2 text-muted'>" + productos[i]['unidades'] + " " + unidadesTag(productos[i]['unidades']) + " en stock" + "</h6>" +
                                    "<div class='d-grid' id='add-to-basket-div-" + productos[i]['codigo'] + "'>" +
                                        "<button type='button' class='btn btn-primary add-to-basket " + stockAvailable(productos[i]['unidades']) + "'>Añadir a la cesta</button>" +
                                    "</div>" +
                                "</div>" +
                            "</div>" +
                        "</div>" +
                    "</div>";
    }
    
    return text;
}

function generarOptionsPlataformas() {
    var text = "<option value='0' selected>Selecciona la plataforma</option>";
    let plataformas = JSON.parse( localStorage.getItem('datos') );

    for (var i in plataformas) {
        text += "<option value='" + plataformas[i]['id'] + "'>" + plataformas[i]['name'] + "</option>";
    }

    return text;
}

function generarOptionsGeneros(platformSelected) {
    var text = "<option value='0' selected>Selecciona el género</option>";
    
    if (platformSelected) {
        let platformId = $('#recipient-platform').children("option:selected").val();
        
        let plataformas = JSON.parse( localStorage.getItem('datos') );

        var found = plataformas.filter(function(item) { return item.id === platformId; });

        var generos = found[0]['arrayGeneros'];

        for (var i in generos) {
            text += "<option value='" + generos[i]['id'] + "'>" + generos[i]['name'] + "</option>";
        }
    }

    return text;
}

function eventHandlers() {

    // No permitimos caracteres especiales al escribir
    $('input').on('keypress', function (event) {
        var regex = new RegExp("^[a-zA-Z0-9 ]+$");
        var key = String.fromCharCode(!event.charCode ? event.which : event.charCode);
        if (!regex.test(key)) {
           event.preventDefault();
           return false;
        }
    });

    // Hacemos focus en el primer input del form al abrir el modal
    $( "#modal-admin, #modal-login" ).on('shown.bs.modal', function(){
        $('#' + $(this).attr('id') + ' [id^=recipient-]:first').focus();
    });

    // Borramos el texto introducido en el input principal al cerrar el modal
    $( "#modal-admin, #modal-login" ).on('hidden.bs.modal', function(){
        $('#' + $(this).attr('id') + ' [id^=recipient-]:first').val("");
    });

    $('body').on("change", "#recipient-platform", function( event ) {
        var selectGeneros = $('#recipient-genre');
        if (selectGeneros.length === 1) {
            selectGeneros.html(generarOptionsGeneros(true));
        }
    });

    $('body').on("click", '#open-platform-modal, #open-genre-modal, #open-product-modal', function ( event ) {
        var tipo = $(this).attr('id').split("-")[1];
        $('#add-entity').attr('data-bs-tipo', tipo);

        $('#div-select-platform').remove();
        $('#div-select-genre').remove();
        $('#div-input-codigo').remove();
        $('#div-input-precio').remove();
        $('#div-input-unidades').remove();
        $('#div-input-imagen').remove();
        
        switch (tipo) {
            case 'platform':
                $('#modal-admin-label').html("Nueva Plataforma");
                $('#label-form-nombre').html("Plataforma:");
            break;

            case 'genre':
                $('#admin-form').prepend("<div class='mb-3' id='div-select-platform'>" +
                                                "<label for='recipient-platform' class='col-form-label'>Plataforma:</label>" +
                                                "<select class='form-select' aria-label='Default select example' id='recipient-platform'>" +
                                                    generarOptionsPlataformas() +
                                                "</select>" +
                                            "</div>");
                $('#modal-admin-label').html("Nuevo Género");
                $('#label-form-nombre').html("Género:");
            break;

            case 'product':
                $('#admin-form').prepend("<div class='mb-3' id='div-input-codigo'>" +
                                                "<label for='recipient-codigo' class='col-form-label'>Código:</label>" +
                                                "<input type='text' class='form-control' id='recipient-codigo'>" +
                                            "</div>");
                $('#admin-form').prepend("<div class='mb-3' id='div-select-genre'>" +
                                                "<label for='recipient-genre' class='col-form-label'>Género:</label>" +
                                                "<select class='form-select' aria-label='Default select example' id='recipient-genre'>" +
                                                    generarOptionsGeneros(false) +
                                                "</select>" +
                                            "</div>");
                $('#admin-form').prepend("<div class='mb-3' id='div-select-platform'>" +
                                                "<label for='recipient-platform' class='col-form-label'>Plataforma:</label>" +
                                                "<select class='form-select' aria-label='Default select example' id='recipient-platform'>" +
                                                    generarOptionsPlataformas() +
                                                "</select>" +
                                            "</div>");
                $('#admin-form').prepend("<div class='mb-3' id='div-input-imagen'>" +
                                                "<label for='recipient-imagen' class='col-form-label'>Imagen:</label>" +
                                                "<input type='file' accept='image/png' class='form-control' id='recipient-imagen'>" +
                                            "</div>");
                $('#admin-form').append("<div class='mb-3' id='div-input-precio'>" +
                                                "<label for='recipient-precio' class='col-form-label'>Precio:</label>" +
                                                "<input type='number' step='.01' class='form-control' id='recipient-precio'>" +
                                            "</div>");
                $('#admin-form').append("<div class='mb-3' id='div-input-unidades'>" +
                                                "<label for='recipient-unidades' class='col-form-label'>Unidades:</label>" +
                                                "<input type='number' class='form-control' id='recipient-unidades'>" +
                                            "</div>");
                $('#modal-admin-label').html("Nuevo Producto");
                $('#label-form-nombre').html("Descripción:");
            break;
        }

        
    });

    $('body').on("click", '#clear-data', function ( event ) {
        event.preventDefault();

        localStorage.clear();

        localStorage.setItem('datos', '[]');

        $('#pills-tab').empty();
        $('#pills-tab-content').empty();

        $('#containerCesta  [id^=row-cesta-]').remove();
        $('#total-precio-cesta').hide();
        

        $('#empty-basket').show();
        $('#empty-platforms').show();
    });

    $('body').on("click", '#login', function ( event ) {
        event.preventDefault();

        var password = $('#recipient-login').val();

        if (password === "admin") {
            $('#top-right-button').parent().html("<div class='btn-group'>" +
                                                    "<button type='button' style='height: 40px;' class='mt-2 btn btn-primary dropdown-toggle' data-bs-toggle='dropdown' aria-expanded='false'>" +
                                                        "Add" +
                                                    "</button>" +
                                                    "<ul class='dropdown-menu'>" +
                                                        "<li><a id='open-platform-modal' data-bs-toggle='modal' data-bs-target='#modal-admin' class='dropdown-item' href='#'>Añadir Plataforma</a></li>" +
                                                        "<li><a id='open-genre-modal' data-bs-toggle='modal' data-bs-target='#modal-admin' class='dropdown-item' href='#'>Añadir Género</a></li>" +
                                                        "<li><a id='open-product-modal' data-bs-toggle='modal' data-bs-target='#modal-admin' class='dropdown-item' href='#'>Añadir Producto</a></li>" +
                                                        "<li><hr class='dropdown-divider'></li>" +
                                                        "<li><a id='clear-data' class='dropdown-item' href='#'>Borrar datos</a></li>" +
                                                    "</ul>" +
                                                "</div>");
            $('#modal-login').modal('hide');
        }
        else {
            alert("Contraseña incorrecta");
            $('#recipient-login').val("");
            $("#recipient-login").focus();
            return false;
        }
    });

    // Añadimos entidad
    $('body').on("click", '#add-entity', function ( event ) {
        event.preventDefault();

        var valorNombre = $('#recipient-name').val();
        var valorNombreId = valorNombre.replace(" ", "_");
        var platformId = valorNombreId;

        let plataformas = JSON.parse( localStorage.getItem('datos') );

        var tipo = $(this).attr('data-bs-tipo');

        if (valorNombre.trim() == "") {
            switch (tipo) {
                case 'platform':
                    alert("El nombre de la plataforma no puede estar vacío");
                break;
                case 'genre':
                    alert("El nombre del género no puede estar vacío");
                break;
                case 'product':
                    alert("La descripción del producto no puede estar vacía");
                break;
            }
            $('#recipient-name').val("");
            $("#recipient-name").focus();
            return false;
        }

        switch (tipo) {
            case 'platform':
                // Comprobamos que no exista ya una plataforma con ese mismo nombre/id
                var found = plataformas.filter(function(item) { return item.name.trim().toUpperCase() === valorNombre.trim().toUpperCase(); });
                if (found[0] !== undefined) {
                    alert("Ya existe una plataforma con ese nombre");
                    $('#recipient-name').val("");
                    $("#recipient-name").focus();
                    return false;
                }

                // Creamos el botón y el contenido de la nueva plataforma
                $('#pills-tab').append(addNavItem(valorNombreId, valorNombre));
                $('#pills-tab-content').append(addTabPane(valorNombreId, ""));

                // Guardamos en localStorage
                var nuevaPlataforma = JSON.parse('{"name": "' + valorNombre + '", "id": "' + valorNombreId + '", "arrayGeneros": []}');
                plataformas.push(nuevaPlataforma);
                localStorage.setItem('datos', JSON.stringify(plataformas));

                // Ocultamos el mensaje de que no hay plataformas si estaba activo
                if (Object.keys(plataformas).length === 1) {
                    $('#empty-platforms').hide();
                }
            break;

            case 'genre':
                platformId = $('#recipient-platform').children("option:selected").val();
                if (platformId == 0) {
                    alert("Tienes que seleccionar una plataforma");
                    $("#recipient-platform").focus();
                    return false;
                }

                // Sirve tanto para guardar luego en localStorage como para buscar si hay otros géneros con el mismo nombre/id en la misma plataforma
                var foundPlatform = plataformas.filter(function(item) { return item.id === platformId; });
                var generos = foundPlatform[0]['arrayGeneros'];

                // Comprobamos que no exista ya un género con ese mismo nombre/id en la misma plataforma
                var foundGenero = generos.filter(function(item) { return item.name.trim().toUpperCase() === valorNombre.trim().toUpperCase(); });
                if (foundGenero[0] !== undefined) {
                    alert("Ya existe un género con ese nombre para esa plataforma");
                    $('#recipient-name').val("");
                    $("#recipient-name").focus();
                    return false;
                }

                var nuevoGeneroString = '{"name": "' + valorNombre + '", "id": "' + valorNombreId + '", "productos": []}';
                
                // Creamos el collapse del nuevo género
                var nuevosGeneros = JSON.parse('[' + nuevoGeneroString + ']');
                $('#accordion' + platformId).append(addGeneros(nuevosGeneros, platformId));

                // Guardamos en localStorage
                var nuevoGenero = JSON.parse(nuevoGeneroString);
                generos.push(nuevoGenero);
                localStorage.setItem('datos', JSON.stringify(plataformas));

                mostrarNuevoGeneroSeleccionado(platformId, valorNombreId, foundPlatform, 'arrayGeneros', '#empty-genres-' + platformId);
                
            break;

            case 'product':
                platformId = $('#recipient-platform').children("option:selected").val();
                let genreId = $('#recipient-genre').children("option:selected").val();
                let codigo = $('#recipient-codigo').val().toUpperCase();
                let precioString = $('#recipient-precio').val().replace(",", ".");
                let unidadesString = $('#recipient-unidades').val().replace(",", ".");
                let imagen = $('#recipient-imagen').prop("files")[0];

                if (!comprobarFormularioProducto(platformId, genreId, codigo, precioString, unidadesString, imagen)) {
                    return false;
                }

                if (mapaProductos.has(codigo)) {
                    alert("Ya existe un producto con ese código");
                    $('#recipient-codigo').val("");
                    $("#recipient-codigo").focus();
                    return false;
                }

                var reader = new FileReader();
                reader.readAsDataURL(imagen);

                reader.addEventListener("load", function () {
                    // convierte la imagen a una cadena en base64
                    let imagenData = reader.result;

                    let precio = parseFloat(precioString).toFixed(2);
                    let unidades = Math.trunc(unidadesString);

                    var nuevoProductoString = '{"imagen": "' + imagenData + '", "codigo": "' + codigo + '", "descripcion": "' + valorNombre + '", "precio": ' + precio + ', "unidades": ' + unidades + '}';
                
                    // Creamos la tarjeta del nuevo producto
                    var productos = JSON.parse('[' + nuevoProductoString + ']');
                    $('#collapse-' + genreId + '-' + platformId + ' .accordion-body').children().first().append(addProductos(productos));
                    
                    // Guardamos en localStorage
                    var nuevoProducto = JSON.parse(nuevoProductoString);
                    var foundPlatform = plataformas.filter(function(item) { return item.id === platformId; });
                    var generos = foundPlatform[0]['arrayGeneros'];
                    var foundGenero = generos.filter(function(item) { return item.id === genreId; });
                    foundGenero[0]['productos'].push(nuevoProducto);
                    localStorage.setItem('datos', JSON.stringify(plataformas));

                    mostrarNuevoGeneroSeleccionado(platformId, genreId, foundGenero, 'productos', '#empty-products-' + genreId + '-' + platformId);

                }, false);

            break;

        }

        $('#recipient-name').val("");

        $('#modal-admin').modal('hide');
    
        // Deseleccionamos el botón de la plataforma antes seleccionada
        $('#pills-tab button').removeClass("active");

        // Ocultamos el contenido de la plataforma antes seleccionada
        $('#pills-tab-content .tab-pane').removeClass("show active");

        // Seleccionamos el botón de la nueva plataforma
        $('#pills-' + platformId + '-tab').addClass("active");

        // Mostramos el contenido de la nueva plataforma
        $('#pills-' + platformId).addClass("show active");
    });

    $('body').on("click", '#realizar-pedido', function ( event ) {
        event.preventDefault();
        
        alert("Pedido realizado por un importe total de " + $('#titulo-precio-total').attr("data-valor").replace(".", ",") + "€");
        
        // Mostramos el mensaje de que la cesta está vacía y ocultamos el precio total
        $('#empty-basket').show();
        $('#total-precio-cesta').hide();

        // Para cada producto de la cesta, cambiamos su editor de unidades por el botón de "Añadir a la cesta" en el catálogo y borramos la tarjeta de la cesta
        $('[id^=row-cesta]').each(function() {
            var codigo = $(this).attr('id').split("-")[2];

            // Actualizar texto con el número de unidades en la tarjeta del catálogo
            $('[data-codigo=' + codigo + '] .text-muted').html("<h6 class='card-subtitle mb-2 text-muted'>" + mapaProductos.get(codigo)['unidades'] + " " + unidadesTag(mapaProductos.get(codigo)['unidades']) + " en stock" + "</h6>");

            $('#add-to-basket-div-' + codigo).addClass('d-grid');
            $('#add-to-basket-div-' + codigo).removeClass('d-flex justify-content-center');
            $('#add-to-basket-div-' + codigo).empty();
            $('#add-to-basket-div-' + codigo).append("<button type='button' class='btn btn-primary add-to-basket " + stockAvailable(mapaProductos.get(codigo)['unidades']) + "'>Añadir a la cesta</button>");
            $(this).remove();

            let genreId = $(this).attr('data-bs-genero');
            let platformId = $(this).attr('data-bs-plataforma');
            
            let plataformas = JSON.parse( localStorage.getItem('datos') );

            var foundPlatform = plataformas.filter(function(item) { return item.id === platformId; });

            var generos = foundPlatform[0]['arrayGeneros'];
            
            var foundGenero = generos.filter(function(item) { return item.id === genreId; });
            
            var productos = foundGenero[0]['productos'];
            
            var foundProducto = productos.filter(function(item) { return item.codigo === codigo; });

            foundProducto[0]['unidades'] = mapaProductos.get(codigo)['unidades'];
            
            localStorage.setItem('datos', JSON.stringify(plataformas));
            

        });
    });

    $('body').on("click", '.add-to-basket', function ( event ) {
        event.preventDefault();

        var producto = mapaProductos.get($(this).closest('.card').attr('data-codigo'));
        
        // Actualizar unidades en el produto
        producto['unidades'] -= 1;

        var parentsData = $(this).closest('.accordion-collapse').attr('id');
        var genero = parentsData.split("-")[1];
        var plataforma = parentsData.split("-")[2];

        // Añadir tarjeta a la cesta
        $('#containerCesta').prepend(addItemToBasket(producto, genero, plataforma));

        // Ocultamos el mensaje de que la cesta está vacía si se estaba mostrando y enseñamos el precio total
        if ($('#empty-basket:visible').length === 1) {
            $('#empty-basket').hide();
            $('#total-precio-cesta').show();
        }
        
        // Cambiar botón de "Añadir a la cesta" por el editor de unidades
        $(this).parent().removeClass('d-grid');
        $(this).parent().addClass('gap-2 d-flex justify-content-center');
        $(this).parent().html(unitsEditor(producto, false));

        actualizarPrecioTotal();
    });

    $('body').on("click", '.trash', function ( event ) {
        event.preventDefault();
        
        var producto = mapaProductos.get($(this).closest('.card').attr('data-codigo'));

        // Actualizar unidades en el produto
        producto['unidades'] += 1;

        // Quitar tarjeta de la cesta
        $('#row-cesta-' + producto['codigo']).remove();

        // Mostramos el mensaje de que la cesta está vacía si ya no quedan productos en la cesta y ocultamos el precio total
        if ($('#containerCesta > .row:visible').length === 0) { // hijos directos de #containerCesta que tengan la clase row y que sean visibles
            $('#empty-basket').show();
            $('#total-precio-cesta').hide();
        }
        
        // Cambiar el editor de unidades por el botón de "Añadir a la cesta"
        $('#add-to-basket-div-' + producto['codigo']).addClass('d-grid');
        $('#add-to-basket-div-' + producto['codigo']).removeClass('d-flex justify-content-center');
        $('#add-to-basket-div-' + producto['codigo']).empty();
        $('#add-to-basket-div-' + producto['codigo']).append("<button type='button' class='btn btn-primary add-to-basket " + stockAvailable(producto['unidades']) + "'>Añadir a la cesta</button>");

        actualizarPrecioTotal();
    });
 
    $('body').on("click", '.minus', function ( event ) {
        event.preventDefault();
        
        var producto = mapaProductos.get($(this).closest('.card').attr('data-codigo'));
        var unidades = parseInt($(this).next().html());

        // Actualizar unidades en el producto
        producto['unidades'] += 1;

        // Volver a habilitar el botón de añadir una unidad si ya hay stock disponible
        if (producto['unidades'] === 1) {
            $('.plus-' + producto['codigo']).removeClass("disabled");
        }

        // Actualizar unidades en los editores de unidades
        unidades -= 1;
        $('.span-' + producto['codigo']).html(unidades);
        
        // Actualizar precio en la cesta con las nuevas unidades
        $('#precio-total-' + producto['codigo']).html(String(unidades * producto['precio']).replace(".", ",") + '€');

        // Si ahora solo hay un elemento en la cesta, cambiamos el "menos" por la papelera
        if (unidades === 1) {
            $('.minus-' + producto['codigo']).empty();
            $('.minus-' + producto['codigo']).append(   "<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='currentColor' class='bi bi-trash' viewBox='0 0 16 16'>" +
                                                            "<path d='M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z'/>" +
                                                            "<path fill-rule='evenodd' d='M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z'/>" +
                                                        "</svg>");
            $('.minus-' + producto['codigo']).addClass('trash trash-' + producto['codigo']);
            $('.minus-' + producto['codigo']).removeClass('minus minus-' + producto['codigo']);
        }

        actualizarPrecioTotal();
    });

    $('body').on("click", '.plus', function ( event ) {
        event.preventDefault();
        
        var producto = mapaProductos.get($(this).closest('.card').attr('data-codigo'));
        var unidades = parseInt($(this).prev().html());

        // Actualizar unidades en el producto
        producto['unidades'] -= 1;

        // Deshabilitar el botón de añadir una unidad si ya hemos añadido todas
        if (producto['unidades'] === 0) {
            $('.plus-' + producto['codigo']).addClass("disabled");
        }

        // Actualizar unidades en los editores de unidades
        unidades += 1;
        $('.span-' + producto['codigo']).html(unidades);

        // Actualizar precio en la cesta con las nuevas unidades
        $('#precio-total-' + producto['codigo']).html(String(unidades * producto['precio']).replace(".", ",") + '€');

        // Si ahora hay 2 unidades en la cesta, cambiamos la papelera por un "menos"
        if (unidades === 2) {
            $('.trash-' + producto['codigo']).empty();
            $('.trash-' + producto['codigo']).append(   "<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='currentColor' class='bi bi-dash' viewBox='0 0 16 16'> " +
                                                            "<path d='M4 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 4 8z'/>" +
                                                        "</svg>");
            $('.trash-' + producto['codigo']).addClass('minus minus-' + producto['codigo']);
            $('.trash-' + producto['codigo']).removeClass('trash trash-' + producto['codigo']);
        }

        actualizarPrecioTotal();
    });
}

function addItemToBasket(producto, genero, plataforma) {
    return "<div id='row-cesta-" + producto['codigo'] + "' data-bs-genero='" + genero + "' data-bs-plataforma='" + plataforma + "'>" +
                "<div class='card mb-3' data-units='1' data-codigo='" + producto['codigo'] + "'>" +
                    "<div class='row g-0'>" +
                        "<div class='col-12 col-lg-4 d-flex align-items-center'>" +
                            "<img src='" + producto['imagen'] + "' alt='" + producto['descripcion'] + "' class='img-fluid rounded-start' >" +
                        "</div>" +
                        "<div class='col-12 col-lg-8'>" +
                            "<div class='card-body'>" +
                                "<h5 title='" + producto['descripcion'] + "' class='text-lg-start text-center card-title truncate'>" + producto['descripcion'] + "</h5>" +
                                "<div class='d-flex flex-row'>" +
                                    "<span class='badge bg-secondary'>Ref.: " + producto['codigo'] + "</span>" +
                                "</div>" +
                                "<div class='row d-flex justify-content-between' style='padding: 12px 0 0 0;'>" +
                                    "<div class='col-12 col-xxl-8 gap-2 d-md-flex'>" +
                                            unitsEditor(producto, true) +
                                    "</div>" +
                                    "<h5 class='justify-content-xl-start justify-content-xxl-center col-12 col-xxl-4 pb-xxl-2 pb-xl-1 pt-3 pt-xxl-0 d-flex card-text mb-4 mt-auto' id='precio-total-" + producto['codigo'] + "' style='height:1px;'>" + String(producto['precio']).replace(".", ",") + "€</h5>" + // TODO quizás poner esto y otros style en .css
                                "</div>" +
                            "</div>" +
                        "</div>" +
                    "</div>" +
                "</div>" +
            "</div>";
}

function unitsEditor(producto, basket) {
    var margin_bottom = basket ? 'mb-2 mb-md-0' : '';
    var margin_left = basket ? 'ms-3 ms-md-0' : '';
    var margin_left_span = basket ? 'ms-3 ms-md-0' : '';
    return "<button type='button' class='" + margin_bottom + " " + margin_left + " btn btn-primary trash trash-" + producto['codigo'] + "'>" +
                "<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='currentColor' class='bi bi-trash' viewBox='0 0 16 16'>" +
                    "<path d='M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z'/>" +
                    "<path fill-rule='evenodd' d='M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z'/>" +
                "</svg>" +
            "</button>" + 
            "<span class='" + margin_bottom + " " + margin_left_span + " d-inline-block input-group-text span-" + producto['codigo'] + "'>1</span>" +
            "<button type='button' class='" + margin_left + " btn btn-primary plus plus-" + producto['codigo'] + stockAvailable(producto['unidades']) + "'>" +
                "<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='currentColor' class='bi bi-plus' viewBox='0 0 16 16'>" +
                    "<path d='M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z'/>" +
                "</svg>" +
            "</button>";
}

function unidadesTag(unidades) {
    return unidades === 1 ? "unidad" : "unidades";
 }
 
 function stockAvailable(unidades) {
     return unidades === 0 ? " disabled" : "";
 }

 function actualizarPrecioTotal() {
    var precioTotal = 0;
    
    $('#containerCesta .card[data-codigo]').each(function() {
        var codigo = $(this).attr("data-codigo");

        // Obtenemos el precio total añadiendo por cada tarjeta en la cesta, el resultado de la multiplicación del precio de cada producto por las unidades que están en el carrito
        precioTotal += mapaProductos.get(codigo)['precio'] * $('.span-' + codigo).html();
    });

    $('#titulo-precio-total').attr("data-valor", precioTotal);
    $('#titulo-precio-total').html(String(precioTotal).replace(".", ",") + "€");
}

function comprobarFormularioProducto(platformId, genreId, codigo, precioString, unidadesString, imagen) {
    if (platformId == 0) {
        alert("Tienes que seleccionar una plataforma");
        $("#recipient-platform").focus();
        return false;
    }

    if (genreId == 0) {
        alert("Tienes que seleccionar un género");
        $("#recipient-genre").focus();
        return false;
    }
    
    if (codigo.length !== 4 || !/^[a-zA-Z]+$/.test(codigo)) {
        alert("El código tiene que tener una longitud de 4 caracteres y estar formado solo por letras sin incluir la 'ñ'");
        $("#recipient-codigo").focus();
        return false;
    }

    if (precioString == "" || (precioString.includes(".") && precioString.split(".")[1].length > 2) || parseFloat(precioString) < 0.0) {
        alert("El precio no puede estar vacío, contener más de dos decimales o ser negativo");
        $("#recipient-precio").focus();
        return false;
    }

    if (unidadesString == "" || unidadesString.includes(".") || parseInt(unidadesString) < 0) {
        alert("Las unidades no pueden estar vacías, contener decimales o ser menores a 0");
        $("#recipient-unidades").focus();
        return false;
    }

    if (!imagen || imagen.size > 5242880) {
        alert("Debes seleccionar una imagen con un tamaño inferior a 5MB");
        $("#recipient-imagen").focus();
        return false;    
    }

    return true;
}

function mostrarNuevoGeneroSeleccionado(platformId, genreId, found, nombreArray, idDivEmpty) {
    // Ocultamos los productos de los géneros anteriores
    $('[id^=collapse-][id$=-' + platformId + ']').removeClass('show');

    // Mostramos los productos del nuevo género
    $('#collapse-' + genreId + '-' + platformId).addClass('show');

    // Ocultamos el mensaje de que no hay géneros si estaba activo
    if (Object.keys(found[0][nombreArray]).length === 1) {
        $(idDivEmpty).hide();
    }
}