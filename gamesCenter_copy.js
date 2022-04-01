const mapaProductos = new Map();

$(document).ready(function() {

    $.getJSON("http://localhost:80/json/productos.json", function(json) {
        console.log(json); // this will show the info it in firebug console
    });

    var accordionPlayStation5 = $('#accordionPlayStation5');

    var arrayGeneros = ["Aventura", "Shooter", "Deporte"];
    var arrayAccordionItems = [];

    var producto1JSON = '{"imagen":"eldenring.png", "codigo":"ELRI", "descripcion":"Elden Ring", "precio":59.99, "unidades":3}';
    var producto2JSON = '{"imagen":"gtav.png", "codigo":"GTAV", "descripcion":"Mario Strikers Battle League Football", "precio":49.99, "unidades":2}';
    var producto3JSON = '{"imagen":"valhalla.png", "codigo":"ACVA", "descripcion":"Assassin\'s Creed Valhalla", "precio":39.99, "unidades":1}';
    var producto4JSON = '{"imagen":"bo2.png", "codigo":"DBO2", "descripcion":"Call of Duty: Black Ops 2", "precio":39.99, "unidades":0}';
    var producto1 = JSON.parse(producto1JSON);
    var producto2 = JSON.parse(producto2JSON);
    var producto3 = JSON.parse(producto3JSON);
    var producto4 = JSON.parse(producto4JSON);

    mapaProductos.set(producto1['codigo'], producto1);
    mapaProductos.set(producto2['codigo'], producto2);
    mapaProductos.set(producto3['codigo'], producto3);
    mapaProductos.set(producto4['codigo'], producto4);

    var productosAventura = [producto1, producto2, producto3, producto4];
    var productosShooter = [producto1, producto2, producto3, producto4];
    var productosDeporte = [producto1, producto2, producto3, producto4];

    productosAventura.forEach(producto => {
        producto['descripcion'] = producto['descripcion'].replace("\'", "&#39;"); // TODO hacer esto con todos los productos cuando los coja de un FileReader
    });

    var productos = [productosAventura, productosShooter, productosDeporte];

    arrayGeneros.forEach(function (genero, i){
        var accordionItem = $(  "<div class='accordion-item'>" +
                                    "<h2 class='accordion-header' id='heading" + genero + "'>" +
                                        "<button class='accordion-button' type='button' data-bs-toggle='collapse' data-bs-target='#collapse" + genero + "' aria-expanded='true' aria-controls='collapse" + genero + "'>" +
                                            genero +
                                        "</button>" +
                                    "</h2>" +
                                    "<div id='collapse" + genero + "' class='accordion-collapse collapse' aria-labelledby='heading" + genero + "' data-bs-parent='#accordionPlayStation5'>" + // TODO hacer este id del acordeón dinámico
                                        "<div class='accordion-body'>" +
                                            crearContenidoCategoria(productos[i]) +
                                        "</div>" +
                                    "</div>" +
                                "</div>");


        arrayAccordionItems.push(accordionItem);
    });

    arrayAccordionItems.forEach(item => {
        accordionPlayStation5.append(item);
    });

    $('.accordion-collapse:first').addClass('show'); // Mostramos los productos de la primera categoría

    $('#total-precio-cesta').hide(); // Ocultamos el total de la cesta al principio, ya que está vacía

    eventHandlers();
});

function actualizarPrecioTotal() {
    var precioTotal = 0;
    $('#containerCesta .card').each(function() {
        var codigo = $(this).attr("data-codigo");
        precioTotal += mapaProductos.get(codigo)['precio'] * $('.span-' + codigo).html();
    });
    $('#total-precio-cesta h4').attr("data-valor", precioTotal);
    $('#total-precio-cesta h4').html("Total: " + String(precioTotal).replace(".", ",") + "€");
}

function eventHandlers() {
    $('body').on("click", '#realizar-pedido', function ( event ) {
        event.preventDefault();
        
        alert("Pedido realizado por un importe total de " + $(this).prev().attr("data-valor").replace(".", ",") + "€");
    });

    $('body').on("click", '.add-to-basket', function ( event ) {
        event.preventDefault();
        
        var producto = mapaProductos.get($(this).closest('.card').attr('data-codigo'));
        
        // Actualizar unidades en el produto
        producto['unidades'] -= 1;

        // Añadir tarjeta a la cesta
        $('#containerCesta').prepend(addItemToBasket(producto));

        // Ocultamos el mensaje de que la cesta está vacía si se estaba mostrando y enseñamos el precio total
        if ($('#empty-basket:visible').length === 1) {
            $('#empty-basket').hide();
            $('#total-precio-cesta').show();
        }

        // Actualizar texto con el número de unidades en la tarjeta del catálogo
        $(this).parent().prev().html("<h6 class='card-subtitle mb-2 text-muted'>" + producto['unidades'] + " " + unidadesTag(producto['unidades']) + " en stock" + "</h6>");
        
        // Cambiar botón de "Añadir a la cesta" por el editor de unidades
        $(this).parent().removeClass('d-grid');
        $(this).parent().addClass('gap-2 d-flex justify-content-center');
        $(this).parent().html(unitsEditor(producto));

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

        // Actualizar texto con el número de unidades en la tarjeta del catálogo
        $('[data-codigo=' + producto['codigo'] + '] .text-muted').html("<h6 class='card-subtitle mb-2 text-muted'>" + producto['unidades'] + " " + unidadesTag(producto['unidades']) + " en stock" + "</h6>");
        
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

        // Actualizar texto con el número de unidades en la tarjeta del catálogo
        $('[data-codigo=' + producto['codigo'] + '] .text-muted').html("<h6 class='card-subtitle mb-2 text-muted'>" + producto['unidades'] + " " + unidadesTag(producto['unidades']) + " en stock" + "</h6>");

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

        // Actualizar texto con el número de unidades en la tarjeta del catálogo
        $('[data-codigo=' + producto['codigo'] + '] .text-muted').html("<h6 class='card-subtitle mb-2 text-muted'>" + producto['unidades'] + " " + unidadesTag(producto['unidades']) + " en stock" + "</h6>");

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

function crearContenidoCategoria(productos) {
    var text = "";
    productos.forEach(function (producto){
        text += "   <div class='col-12 col-lg-6 col-xl-4 d-flex align-items-stretch'>" + // d-flex y align-items-stretch hacen que todas las tarjetas tengan la misma altura
                        "<div class='card' data-codigo='" + producto['codigo'] + "' style='margin-bottom: 20px;'>" +
                            "<img src='img/" + producto['imagen'] + "' alt='" + producto['descripcion'] + "' class='card-img-top img-thumbnail zoom'/>" +
                            "<div class='card-body d-flex flex-column'>" + // d-flex y flex-column junto al uso de mt-auto más abajo hace que el botón se quede abajo de la tarjeta y el precio en el medio
                                "<h4 title='" + producto['descripcion'] + "' class='card-title text-center truncate'>" + producto['descripcion'] + "</h4>" +
                                "<div class='d-flex flex-row-reverse'>" +
                                    "<span class='badge bg-secondary'>Ref.: " + producto['codigo'] + "</span>" +
                                "</div>" +
                                "<br><h2 class='card-text mb-4 mt-auto'>" + String(producto['precio']).replace(".", ",") + "€</h2>" +
                                "<div class='mt-auto'>" +
                                    "<h6 class='card-subtitle mb-2 text-muted'>" + producto['unidades'] + " " + unidadesTag(producto['unidades']) + " en stock" + "</h6>" +
                                    "<div class='d-grid' id='add-to-basket-div-" + producto['codigo'] + "'>" +
                                        "<button type='button' class='btn btn-primary add-to-basket " + stockAvailable(producto['unidades']) + "'>Añadir a la cesta</button>" +
                                    "</div>" +
                                "</div>" +
                            "</div>" +
                        "</div>" +
                    "</div>";
    });
    
    return "<div class='row'>" +
                text +
            "</div>";
}

function addItemToBasket(producto, i, j) {
    return "<div class='row' id='row-cesta-" + producto['codigo'] + "'>" +
                "<div class='col-12'>" +
                    "<div class='card mb-3' data-units='1' data-codigo='" + producto['codigo'] + "'>" +
                        "<div class='row g-0'>" +
                            "<div class='col-md-4'>" +
                                "<img src='img/" + producto['imagen'] + "' alt='" + producto['descripcion'] + "' class='img-fluid rounded-start' >" +
                            "</div>" +
                            "<div class='col-md-8'>" +
                                "<div class='card-body'>" +
                                    "<h5 title='" + producto['descripcion'] + "' class='card-title truncate'>" + producto['descripcion'] + "</h5>" +
                                    "<div class='d-flex flex-row'>" +
                                        "<span class='badge bg-secondary'>Ref.: " + producto['codigo'] + "</span>" +
                                    "</div>" +
                                    /*"<div class='d-flex justify-content-between'>" +
                                        "<span class='badge bg-secondary'>Ref.: " + producto['codigo'] + "</span>" +
                                        "<h6 class='card-text mb-4 mt-auto' style='height:1px;padding: 1px 0px 0px 0px;'>" + producto['precio'] + "€</h6>" +
                                    "</div>" +*/
                                    "<div class='d-flex justify-content-between' style='padding: 12px 0 0 0;'>" +
                                        "<div class='gap-2 d-flex justify-content-center'>" +
                                            unitsEditor(producto) +
                                        "</div>" +
                                        "<h5 class='card-text mb-4 mt-auto' id='precio-total-" + producto['codigo'] + "' style='height:1px;padding: 0 0 8px;'>" + String(producto['precio']).replace(".", ",") + "€</h5>" + // TODO quizás poner esto y otros style en .css
                                    "</div>" +
                                "</div>" +
                            "</div>" +
                        "</div>" +
                    "</div>" +
                "</div>"+
            "</div>";
}

function unitsEditor(producto) {
    return "<button type='button' class='btn btn-primary trash trash-" + producto['codigo'] + "'>" +
                "<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='currentColor' class='bi bi-trash' viewBox='0 0 16 16'>" +
                    "<path d='M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z'/>" +
                    "<path fill-rule='evenodd' d='M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z'/>" +
                "</svg>" +
            "</button>" + 
            "<span class='input-group-text span-" + producto['codigo'] + "'>1</span>" +
            "<button type='button' class='btn btn-primary plus plus-" + producto['codigo'] + stockAvailable(producto['unidades']) + "'>" +
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