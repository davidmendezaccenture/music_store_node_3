// Este archivo maneja la lógica de la cesta de la compra

let carrito = [];
let productosDisponibles = [];

// Al cargar la página, primero cargamos los productos y luego el carrito
$(document).ready(function () {
  //Animacion al cargar
  $('#contenedor-carrito').addClass('fade-in-smooth');
  const usuario = localStorage.getItem('usuario') || 'guest';

  // Intentamos cargar carrito local para mostrar el contador rápido
  const carritoGuardado = localStorage.getItem('carrito');
  if (carritoGuardado) {
    try {
      carrito = JSON.parse(carritoGuardado);
      actualizarContadorCarrito(calcularTotalItems(carrito));
    } catch (e) {
      console.warn('Carrito local corrupto. Limpiando...');
      localStorage.removeItem('carrito');
    }
  }

  // Cargar productos disponibles
  $.get('/api/products', function (data) {
    productosDisponibles = data;

    // Luego cargar carrito servidor para sincronizar
    $.ajax({
      url: `/api/cart?user=${usuario}`,
      method: 'GET',
      success: function (respuesta) {
        if (respuesta) {
          carrito = respuesta;
          actualizarContadorCarrito(calcularTotalItems(carrito));
          mostrarCarrito();
          guardarCarrito();
        }
      },
      error: function () {
        console.warn('No se pudo cargar el carrito del servidor.');
      }
    });
  });
});

// Función para actualizar el contador solo si cambia
function actualizarContadorCarrito(cantidad) {
  const $contadorMobile = $('#cartCounterMobile');
  const $contadorDesktop = $('#cartCounterDesktop');

  if ($contadorMobile.length && $contadorMobile.text() !== cantidad.toString()) {
    $contadorMobile.text(cantidad);
  }
  if ($contadorDesktop.length && $contadorDesktop.text() !== cantidad.toString()) {
    $contadorDesktop.text(cantidad);
  }
}

// ✅ Función modular para añadir producto al carrito (desde cualquier archivo externo)
function addToCart(id) {
  const productoExistente = carrito.find(p => p.id === id);
  if (productoExistente) {
    productoExistente.cantidad += 1;
  } else {
    carrito.push({ id, cantidad: 1 });
  }

  mostrarToastAgregar();
  guardarCarrito();
  actualizarContadorCarrito(calcularTotalItems(carrito));
  mostrarCarrito();
}

// Evento: agregar producto al carrito (solo para botones dentro de páginas del carrito)
$(document).on('click', '.agregar-carrito', function () {
  const id = $(this).data('id');
  addToCart(id);
});

// Mostrar carrito en pantalla
function mostrarCarrito() {
  const $contenedor = $('#contenedor-carrito');
  $contenedor.empty();

  let totalCarrito = 0;

  carrito.forEach(item => {
    const productoInfo = productosDisponibles.find(p => p.id === item.id);

    if (productoInfo) {
      const { name, offerPrice, image } = productoInfo;
      const cantidad = item.cantidad;
      const subtotal = offerPrice * cantidad;
      totalCarrito += subtotal;

      const itemHTML = `
        <li class="item-carrito list-group-item border rounded-3 shadow-sm p-3 mb-3 d-flex align-items-center mx-auto"
          style="max-width: 700px; width: 100%;" data-id="${item.id}">
          <div style="width: 80px; flex-shrink: 0;">
            <img src="${image}" alt="${name}" style="max-width: 100%; height: auto;">
          </div>
          <div class="flex-grow-1 d-flex justify-content-center">
            <div class="d-flex gap-4 align-items-center" style="max-width: 400px;">
              <div class="d-flex flex-column align-items-center gap-2" style="min-width: 150px;">
                <strong class="text-center">${name}</strong> 
                <div class="d-flex align-items-center gap-2">
                  <button class="btn btn-outline-secondary btn-sm btn-restar">−</button>
                  <span class="cantidad">${cantidad}</span>
                  <button class="btn btn-outline-secondary btn-sm btn-sumar">+</button>
                </div>
              </div>
              <div class="item-precio">
                <div class="precio">
                  <span>Precio:</span> ${offerPrice.toFixed(2)} €
                </div>
                <div id="subtotal" class="subtotal-container">
                  <strong>Subtotal:</strong>
                  <span class="subtotal-amount">${subtotal.toFixed(2)} €</span>
                </div>
              </div>
            </div>
          </div>
          <button class="btn btn-sm btn-outline-danger btn-eliminar ms-auto" title="Eliminar" style="font-size: 1.25rem; line-height: 1;">
            <i class="bi bi-trash"></i>
          </button>
        </li>
      `;
      $contenedor.append(itemHTML);
    } else {
      $contenedor.append(`<li><em>Producto con ID ${item.id} no encontrado</em></li>`);
    }
  });

  $('#total-carrito').text(totalCarrito.toFixed(2));
  mostrarMensajeCarritoVacio();
}

// Sumar cantidad
$(document).on('click', '.btn-sumar', function () {
  if (!estaLogueado()) {
    mostrarModalLogin();
    return;
  }

  const id = $(this).closest('li').data('id');
  const producto = carrito.find(p => p.id === id);
  if (producto) {
    producto.cantidad += 1;
    guardarCarrito();
    actualizarContadorCarrito(calcularTotalItems(carrito));
    mostrarCarrito();
        setTimeout(() => {
      const itemElem = $(`li[data-id="${id}"]`);
      const subtotalElem = itemElem.find('#subtotal');

      subtotalElem.removeClass('subtotal-anim'); // reset animation
      void subtotalElem[0].offsetWidth; // force reflow
      subtotalElem.addClass('subtotal-anim');
    }, 50);
  }
});

// Restar cantidad
$(document).on('click', '.btn-restar', function () {
  if (!estaLogueado()) {
    mostrarModalLogin();
    return;
  }

  const $item = $(this).closest('.item-carrito');
  const id = $item.data('id');
  const producto = carrito.find(p => p.id === id);

  if (producto) {
    producto.cantidad -= 1;
    if (producto.cantidad <= 0) {
      $item.find('.btn-eliminar').trigger('click');
    } else {
      guardarCarrito();
      actualizarContadorCarrito(calcularTotalItems(carrito));
      mostrarCarrito();
          setTimeout(() => {
      const itemElem = $(`li[data-id="${id}"]`);
      const subtotalElem = itemElem.find('#subtotal');

      subtotalElem.removeClass('subtotal-anim'); // reset animation
      void subtotalElem[0].offsetWidth; // force reflow
      subtotalElem.addClass('subtotal-anim');
    }, 50);
    }
  }
});

// Eliminar producto
let itemPendienteEliminar = null; // Almacenará el elemento a eliminar
let posicionesAntesEliminar = null; // Almacenará las posiciones iniciales

$('#contenedor-carrito').on('click', '.btn-eliminar', function() {
  if (!estaLogueado()) {
    mostrarModalLogin();
    return;
  }

  const $item = $(this).closest('.item-carrito');
  itemPendienteEliminar = $item; // Guarda el item para usarlo después
  posicionesAntesEliminar = guardarPosiciones(); // Guarda posiciones ANTES de abrir modal
  
  mostrarModalConfirmarEliminacion(); // Muestra la modal de confirmación
});

$(document).on('click', '#btn-confirmar-eliminar', function() {
  if (!itemPendienteEliminar) return;
  modalEliminar.hide();

  $('body').addClass('body-no-scroll-x');
  const id = itemPendienteEliminar.data('id');

  // 1. Filtra el carrito
  carrito = carrito.filter(p => p.id !== id);

  // 2. Animación y eliminación del DOM
  itemPendienteEliminar.addClass('removiendo');
  
  setTimeout(() => {
    itemPendienteEliminar.remove();
    
    requestAnimationFrame(() => {
      const posicionesDespues = guardarPosiciones();
      
      posicionesDespues.forEach((pos) => {
        const antes = posicionesAntesEliminar.find(p => p.el.is(pos.el));
        if (!antes) return;

        const deltaY = antes.top - pos.top;
        if (deltaY !== 0) {
          pos.el.css('transform', `translateY(${deltaY}px)`);
          pos.el[0].offsetHeight; // Reflow
          pos.el.css({
            transition: 'transform 0.4s ease',
            transform: 'translateY(0)'
          });

          setTimeout(() => {
            $('body').removeClass('body-no-scroll-x');
            pos.el.css({ transition: '', transform: '' });
          }, 400);
        }
      });

      // Actualizaciones finales
      guardarCarrito();
      actualizarTotal();
      mostrarMensajeCarritoVacio();
      actualizarContadorCarrito(calcularTotalItems(carrito));

    });
  }, 400);

});




// Actualizar total sin recargar todo
function actualizarTotal() {
  let total = 0;
  carrito.forEach(item => {
    const producto = productosDisponibles.find(p => p.id === item.id);
    if (producto) {
      total += producto.offerPrice * item.cantidad;
    }
  });
  $('#total-carrito').text(`${total.toFixed(2)}`);
}

// Guardar carrito en backend y localStorage
function guardarCarrito() {
  const usuario = localStorage.getItem('usuario') || 'guest';
  localStorage.setItem('carrito', JSON.stringify(carrito));

  $.ajax({
    url: '/api/cart',
    method: 'POST',
    contentType: 'application/json',
    data: JSON.stringify({ user: usuario, items: carrito }),
    success: function () {
      console.log('Carrito guardado');
    },
    error: function () {
      alert('Error al guardar el carrito');
    }
  });
}

// Calcular total de items
function calcularTotalItems(carrito) {
  if (!carrito || carrito.length === 0) return 0;
  return carrito.reduce((total, producto) => total + producto.cantidad, 0);
}

// Guardar posiciones para animaciones
function guardarPosiciones() {
  const posiciones = [];
  $('.item-carrito, #total h4, #total button, #seguir-comprando, .pie-de-pagina, .pre-footer ').each(function () {
    const $el = $(this);
    posiciones.push({ el: $el, top: $el.offset().top });
  });
  return posiciones;
}
//Función para el botón de pagar
$(document).ready(function () {
  const usuario = localStorage.getItem('usuario') || 'guest';
  $('#confirmar-pago').on('click', async function () {
    if (!estaLogueado()) {
      mostrarModalLogin();
    } else {
      mostrarModalPago();
      $('#modalPagoConfirmado').one('hidden.bs.modal', function () {
        carrito = [];
        guardarCarrito();
        actualizarContadorCarrito(calcularTotalItems(carrito));
        mostrarCarrito();
        console.log('Modal de pago cerrada, ahora ejecuto otras funciones.');
      });
    }
  });
});

// Mostrar mensaje si carrito está vacío
function mostrarMensajeCarritoVacio() {
  if (carrito.length === 0) {
    $('#contenedor-carrito')
      .append(`
        <li class="text-center text-muted py-0 w-100" style="list-style-type: none;">
          <i class="bi bi-cart-x fs-1 d-block mb-3"></i>
          <p class="mb-0">Tu carrito está vacío.</p>
        </li>
      `);
    $('#hacer-checkout').prop('disabled', true);
  } else {
    $('#hacer-checkout').prop('disabled', false);
  }
}
//Para cargar el carrito tras el loguin
function cargarCarritoUsuario(usuario) {
  // Luego cargar carrito servidor para sincronizar
  $.ajax({
    url: `/api/cart?user=${usuario}`,
    method: 'GET',
    success: function (respuesta) {
      if (respuesta) {
        carrito = respuesta;
        actualizarContadorCarrito(calcularTotalItems(carrito));
        mostrarCarrito();
      }
    },
    error: function () {
      console.warn('No se pudo cargar el carrito del servidor.');
    }
  });
}

const estaLogueado = () => {
  const usuario = localStorage.getItem('usuario');
  return usuario !== null && usuario !== 'guest';
}

function mostrarModalLogin() {
  const loginModal = new bootstrap.Modal(document.getElementById('modalCarrito'));
  loginModal.show();
}

//Mostrar notificacion al añadir instrumento
const toastElement = document.getElementById('toastAdd');
const toast = new bootstrap.Toast(toastElement, {
  delay: 1500,
  autohide: true,
});
function mostrarToastAgregar() {
  toast.show();
}
//Dirigir a checkout
document.getElementById('hacer-checkout').addEventListener('click', function() {
  window.location.href = '/pages/checkout.html';
});

