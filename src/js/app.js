// app.js - Punto de entrada de la aplicación
// Espera a que el documento HTML esté completamente cargado antes de ejecutar el código
$(document).ready(function () {

  // Llamada AJAX para obtener la lista de productos desde el servidor
  $.ajax({
    url: '/api/products',       // Endpoint del backend que devuelve los productos en formato JSON
    method: 'GET',              // Método HTTP GET para obtener datos
    dataType: 'json',           // Esperamos una respuesta en formato JSON

    // Si la llamada es exitosa, ejecutamos esta función
    success: function (productos) {
      const $contenedor = $('#contenedor-productos');  // Seleccionamos el contenedor donde irán los productos

      // Recorremos cada producto recibido
      productos.forEach(producto => {
        // Generamos dinámicamente el HTML para cada producto
        const productoHTML = `
          <div class="producto card m-2 p-2">
            <img src="${producto.imagen}" class="card-img-top" alt="${producto.nombre}">
            <div class="card-body">
              <h5 class="card-title">${producto.nombre}</h5>
              <p class="card-text">$${producto.precio}</p>
              <button class="btn btn-primary agregar-carrito" data-id="${producto.id}">
                Añadir al carrito
              </button>
            </div>
          </div>
        `;
        // Insertamos el producto en el contenedor
        $contenedor.append(productoHTML);
      });
    },

    // Si hay error en la llamada AJAX, mostramos un mensaje
    error: function () {
      alert('Error al cargar productos');
    }
  });
});

