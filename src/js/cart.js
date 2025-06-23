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
          let cantidadProductos = calcularTotalItems(carrito); //Cargamos el total de productos
          $('#cartCounter').text(cantidadProductos);
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
  //Sumamos 1 al contador
  let cantidadProductos = parseInt($('#cartCounter').text());
  cantidadProductos+=1;
  $('#cartCounter').text(cantidadProductos);

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
  const $contenedor = $('#contenedor-carrito');
  $contenedor.empty();

  let totalCarrito = 0;

  carrito.forEach(item => {
    // Buscamos el producto correspondiente
    const productoInfo = productosDisponibles.find(p => p.id === item.id);

    if (productoInfo) {
      const { name, offerPrice, image } = productoInfo;
      const cantidad = item.cantidad;
      const subtotal = offerPrice * cantidad;
      totalCarrito += subtotal;

const itemHTML = `
  <li class="item-carrito list-group-item border rounded-3 shadow-sm p-3 mb-3 w-100 d-flex align-items-center gap-5" data-id="${item.id}">
    
    <!-- Imagen -->
    <div class="d-flex align-items-center justify-content-center mx-5" style="width: 80px;">
      <img src="${productoInfo.image}" alt="${name}" style="max-width: 100%; height: auto;">
    </div>
    
    <!-- Info y controles -->
    <div class="flex-grow-1">
      <strong>${name}</strong><br>
      <small class="text-muted">Precio: $${offerPrice.toFixed(2)}</small>

      <div class="d-flex align-items-center mt-2">
        <button class="btn btn-outline-secondary btn-sm btn-restar me-2">−</button>
        <span>${cantidad}</span>
        <button class="btn btn-outline-secondary btn-sm btn-sumar ms-2">+</button>
      </div>

      <div class="mt-2">
        <button class="btn btn-danger btn-sm btn-eliminar">Eliminar</button>
      </div>
    </div>

    <!-- Subtotal -->
    <div class="text-end" style="min-width: 120px;">
      <strong>Subtotal: </strong>
      <span>$${subtotal.toFixed(2)}</span>
    </div>

  </li>
`;

      $contenedor.append(itemHTML);
    } else {
      $contenedor.append(`<li><em>Producto con ID ${item.id} no encontrado</em></li>`);
    }
  });

  // Mostrar el total general del carrito
  $('#total-carrito').text(totalCarrito.toFixed(2));
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

//Función para contar el total de productos en el carrito y mantenerlo entre vistas
function calcularTotalItems(carrito) {
  if (!carrito || carrito.length === 0) return 0;
  return carrito.reduce((total, producto) => total + producto.cantidad, 0);
}

