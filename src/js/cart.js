// Este archivo maneja la lógica de la cesta de la compra
// Declaramos un array vacío para almacenar los productos del carrito
let carrito = [];

// Evento: al hacer clic en cualquier botón con clase .agregar-carrito
// (usamos .on() porque los productos se cargan dinámicamente)
$(document).on('click', '.agregar-carrito', function () {
  const id = $(this).data('id');  // Obtenemos el ID del producto desde el atributo data-id

  // Buscamos si el producto ya está en el carrito
  const productoExistente = carrito.find(p => p.id === id);

  if (productoExistente) {
    productoExistente.cantidad += 1; // Si ya está, sumamos uno a la cantidad
  } else {
    carrito.push({ id, cantidad: 1 }); // Si no está, lo agregamos con cantidad 1
  }

  guardarCarrito();   // Guardamos el carrito en el backend
  mostrarCarrito();   // Mostramos el carrito en pantalla
});


// Función para mostrar los productos del carrito en un contenedor HTML
function mostrarCarrito() {
  const $contenedor = $('#contenedor-carrito'); // Seleccionamos el contenedor
  $contenedor.empty(); // Lo vaciamos antes de volver a pintar

  carrito.forEach(item => {
    // Creamos un elemento <li> por cada producto
    const itemHTML = `<li>Producto ${item.id} - Cantidad: ${item.cantidad}</li>`;
    $contenedor.append(itemHTML); // Lo insertamos al final del contenedor
  });
}


// Función para guardar el carrito en el backend
function guardarCarrito() {
  const usuario = localStorage.getItem('usuario') || 'guest'; // Si no hay usuario logueado, usamos 'guest'

  $.ajax({
    url: '/api/cart',                       // Ruta del servidor que guarda el carrito
    method: 'POST',
    contentType: 'application/json',
    data: JSON.stringify({
      user: usuario,                        // Enviamos el usuario actual
      cart: carrito                         // Y el array del carrito completo
    }),

    success: function () {
      console.log('Carrito guardado');     // Mensaje en consola (puedes poner una notificación)
    },

    error: function () {
      alert('Error al guardar el carrito'); // Error si la llamada falla
    }
  });
}
