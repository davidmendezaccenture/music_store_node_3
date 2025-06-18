// Este archivo maneja la lógica de la cesta de la compra

// Declaramos un array vacío para almacenar los productos del carrito
let carrito = [];

let productosDisponibles = []; // Aquí guardaremos todos los productos del catálogo

// Al cargar la página, primero cargamos los productos y luego el carrito
$(document).ready(function () {
  const usuario = localStorage.getItem('usuario') || 'guest'; // Obtenemos el usuario (o guest por defecto)

  // Paso 1: Cargar productos disponibles
  $.get('/api/products', function (data) {
    productosDisponibles = data; // Guardamos productos

    // Paso 2: Una vez que tenemos los productos, cargamos el carrito del usuario
    $.ajax({
      url: `/api/cart/${usuario}`,   // Ruta para obtener el carrito del usuario
      method: 'GET',
      success: function (respuesta) {
        if (respuesta && respuesta.cart) {
          carrito = respuesta.cart;     // Guardamos el carrito recuperado en la variable local
          mostrarCarrito();             // Mostramos el carrito en pantalla
        }
      },
      error: function () {
        console.warn('No se pudo cargar el carrito del servidor.');
      }
    });
  });
});

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
  const $contenedor = $('#contenedor-carrito'); // Contenedor del carrito
  $contenedor.empty(); // Limpiamos antes de pintar de nuevo

  carrito.forEach(item => {
    // Buscamos el producto por ID en la lista de productos disponibles
    const productoInfo = productosDisponibles.find(p => p.id === item.id);
    const nombreProducto = productoInfo ? productoInfo.nombre : `Producto ${item.id}`;

    const itemHTML = `
      <li data-id="${item.id}">
        <strong>${nombreProducto}</strong> - Cantidad: ${item.cantidad}
        <button class="btn-sumar">+</button>
        <button class="btn-restar">−</button>
        <button class="btn-eliminar">Eliminar</button>
      </li>
    `;
    $contenedor.append(itemHTML);
  });
}

// Evento para sumar cantidad
$(document).on('click', '.btn-sumar', function () {
  const id = $(this).closest('li').data('id');
  const producto = carrito.find(p => p.id === id);
  if (producto) {
    producto.cantidad += 1;
    guardarCarrito();
    mostrarCarrito();
  }
});

// Evento para restar cantidad
$(document).on('click', '.btn-restar', function () {
  const id = $(this).closest('li').data('id');
  const producto = carrito.find(p => p.id === id);
  if (producto) {
    producto.cantidad -= 1;
    if (producto.cantidad <= 0) {
      // Eliminamos si la cantidad es 0
      carrito = carrito.filter(p => p.id !== id);
    }
    guardarCarrito();
    mostrarCarrito();
  }
});

// Evento para eliminar producto directamente
$(document).on('click', '.btn-eliminar', function () {
  const id = $(this).closest('li').data('id');
  carrito = carrito.filter(p => p.id !== id); // Quitamos el producto del array
  guardarCarrito();
  mostrarCarrito();
});

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

