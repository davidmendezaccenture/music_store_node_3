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
  <li class="item-carrito list-group-item border rounded-3 shadow-sm p-3 mb-3 w-100 d-flex flex-wrap align-items-center gap-5" data-id="${item.id}">
    
    <!-- Imagen -->
    <div class="d-flex align-items-center justify-content-center flex-shrink-0 mx-5" style="width: 80px;">
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
    <div class="text-end flex-shrink-0" style="min-width: 120px;">
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

  //Mostramos mensaje si el carrito está vacío
  mostrarMensajeCarritoVacio()

}


// Evento para sumar cantidad
$(document).on('click', '.btn-sumar', function () {
  const id = $(this).closest('li').data('id');
  const producto = carrito.find(p => p.id === id);
if (!estaLogueado()) {
  mostrarModalLogin();
  return;
}
  if (producto) {
    producto.cantidad += 1;
    guardarCarrito();
    mostrarCarrito();
  }
});

// Evento para restar cantidad
$(document).on('click', '.btn-restar', function () {
  const $item = $(this).closest('.item-carrito');
  const id = $item.data('id');
  const producto = carrito.find(p => p.id === id);
  console.log(estaLogueado());
    if (!estaLogueado()) {
    mostrarModalLogin();
    return;
  }
  if (producto) {
    producto.cantidad -= 1;
    if (producto.cantidad <= 0) {
      // Eliminamos si la cantidad es 0, llamando a la función que se dispara al hacer click en el botón eliminar
      $item.find('.btn-eliminar').trigger('click');
    } else {
    guardarCarrito();
    mostrarCarrito();
    }
  }
});

//Función para borrar elementos del carrito
$('#contenedor-carrito').on('click', '.btn-eliminar', function() {
  const $item = $(this).closest('.item-carrito');
  const id = $item.data('id');

  const posicionesAntes = guardarPosiciones();
    if (!estaLogueado()) {
    mostrarModalLogin();
    return;
  }
  //Añadimos la clase que evita que aparezca la barra de navegación horizontal con cada click
  $('body').addClass('body-no-scroll-x');

  // Quitamos del array
  carrito = carrito.filter(p => p.id !== id);

  // Eliminamos el elemento con desvanecimiento
  $item.addClass('removiendo');

  // Esperamos a que termine la animación CSS (400ms)
  setTimeout(() => {

  // Eliminamos el elemento del DOM
  $item.remove();

  // Esperamos 1 frame para que el layout se actualice
  requestAnimationFrame(() => {
    const posicionesDespues = guardarPosiciones();

    posicionesDespues.forEach((pos, i) => {
      const antes = posicionesAntes.find(p => p.el.is(pos.el));
      if (!antes) return;

      const deltaY = antes.top - pos.top;
      if (deltaY !== 0) {
        pos.el.css('transform', `translateY(${deltaY}px)`);
        pos.el[0].offsetHeight; // forzar reflow
        pos.el.css({
          transition: 'transform 0.4s ease',
          transform: 'translateY(0)'
        });

        setTimeout(() => { 
          $('body').removeClass('body-no-scroll-x');
          pos.el.css({
            transition: '',
            transform: ''
          });
        }, 400);
      }
    });
    guardarCarrito();
    actualizarTotal();
    //Si el carrito está vacío, mostramos mensaje
    mostrarMensajeCarritoVacio();
  });

}, 400); // este timeout es solo para esperar la animación de salida

});


//Función para actualizar el total del carrito sin tener que recargarlo completo
function actualizarTotal() {
  let total = 0;
  carrito.forEach(item => {
    const producto = productosDisponibles.find(p => p.id === item.id);
    if (producto) {
      total += producto.offerPrice * item.cantidad;
    }
  });

  $('#total-carrito').text(`$${total.toFixed(2)}`);
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

//Función para contar el total de productos en el carrito y mantenerlo entre vistas
function calcularTotalItems(carrito) {
  if (!carrito || carrito.length === 0) return 0;
  return carrito.reduce((total, producto) => total + producto.cantidad, 0);
}

// Para animación suave, guardado de posiciones
function guardarPosiciones() {
  const posiciones = [];
  $('.item-carrito, #total h4, #total button, #seguir-comprando, .pie-de-pagina ').each(function () {
    const $el = $(this);
    posiciones.push({
      el: $el,
      top: $el.offset().top
    });
  });
  return posiciones;
}
//Para mostrar mensaje si el carrito está vacío. Creo función aparte porque rompía la animación
function mostrarMensajeCarritoVacio() {
  if (carrito.length === 0) {
    $('#contenedor-carrito')
      .css('min-height', '180px')
      .append(`
        <li class="text-center text-muted py-5 w-100" style="list-style-type: none;">
          <i class="bi bi-cart-x fs-1 d-block mb-3"></i>
          <p class="mb-0">Tu carrito está vacío.</p>
        </li>
      `);
      $('#confirmar-pago').prop('disabled', true);
  } else {
      $('#confirmar-pago').prop('disabled', false);
  }
}
const estaLogueado = () => {
  const usuario = localStorage.getItem('usuario');
  // Si usuario es null o 'guest' no está logueado
  return usuario !== null && usuario !== 'guest';
}
function mostrarModalLogin() {
  const loginModal = new bootstrap.Modal(document.getElementById('modalCarrito'));
  loginModal.show();
}