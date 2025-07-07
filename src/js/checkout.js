let productosDisponibles = [];
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
let metodoEnvio = 'domicilio'; // Valor por defecto

function mostrarResumenPedido() {
  const $resumen = $('#resumen-pedido');
  const $envio = $('#envio');
  const $total = $('#total');

  $resumen.empty();

  if (carrito.length === 0) {
    mostrarMensajeCarritoVacio();
    $envio.text('0.00 €');
    $total.text('0.00 €');
    return;
  }

  let totalPedido = 0;
  let totalUnidades = 0;

  carrito.forEach(item => {
    const producto = productosDisponibles.find(p => p.id === item.id);
    if (!producto) return;

    const subtotal = producto.offerPrice * item.cantidad;
    totalPedido += subtotal;
    totalUnidades += item.cantidad;

    const $li = $(`
      <li class="list-group-item d-flex justify-content-between align-items-center" data-id="${item.id}">
        <div class="d-flex align-items-center gap-3">
          <img src="${producto.image}" alt="${producto.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 5px;">
          <div>
            <strong>${producto.name}</strong><br>
            <small class="text-muted">${producto.description}</small><br>
            Cantidad: ${item.cantidad}<br>
            Precio unitario: ${producto.offerPrice.toFixed(2)} €
          </div>
        </div>
        <div class="d-flex align-items-center gap-3">
          <span><strong>${subtotal.toFixed(2)} €</strong></span>
          <button class="btn btn-sm btn-outline-danger btn-eliminar-checkout" title="Eliminar producto">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </li>
    `);

    $resumen.append($li);
  });


  let gastosEnvio = 0;
    if (metodoEnvio === 'tienda' || totalPedido > 500) {
    gastosEnvio = 0;
  } else {
    if (totalUnidades > 0) {
      gastosEnvio = 10 + (totalUnidades - 1) * 5;
    }
  }

  $envio.text(`${gastosEnvio.toFixed(2)} €`);
  $total.text(`${(totalPedido + gastosEnvio).toFixed(2)} €`);
}

// Mostrar mensaje vacío si el carrito está vacío
function mostrarMensajeCarritoVacio() {
  $('#resumen-pedido').append(`
    <li class="list-group-item text-center text-muted border-0 bg-transparent fw-semibold">
      No tienes artículos en el carrito.
    </li>
  `);
}

// Variables auxiliares
let itemPendienteEliminar = null;
let posicionesAntesEliminar = [];

// Al pulsar el botón de eliminar
$('#resumen-pedido').on('click', '.btn-eliminar-checkout', function () {
  const $li = $(this).closest('li');
  itemPendienteEliminar = $li.data('id');
  posicionesAntesEliminar = guardarPosiciones();
  mostrarModalConfirmarEliminacion(); // Modal propio tuyo
});

// Confirmación de eliminación
$(document).on('click', '#btn-confirmar-eliminar', function () {
  if (!itemPendienteEliminar) return;

  modalEliminar.hide();
  const $liEliminar = $(`#resumen-pedido li[data-id="${itemPendienteEliminar}"]`);
  $liEliminar.addClass('removiendo');

  const $contenedor = $('#resumen-pedido').closest('.p-4');
  const alturaAntes = $contenedor.outerHeight();
  const paddingInferiorOriginal = $contenedor.css('padding-bottom');
  $contenedor.css('padding-bottom', '0px');

  // Eliminar del array del carrito
  carrito = carrito.filter(item => item.id !== itemPendienteEliminar);

  setTimeout(() => {
    $liEliminar.remove();

    // Si el carrito está vacío tras eliminar
    if (carrito.length === 0) {
      mostrarMensajeCarritoVacio();
    }

    requestAnimationFrame(() => {
      const posicionesDespues = guardarPosiciones();

      posicionesDespues.forEach(pos => {
        const antes = posicionesAntesEliminar.find(p => p.el.is(pos.el));
        if (!antes) return;
        const deltaY = antes.top - pos.top;

        if (deltaY !== 0) {
          pos.el.css('transform', `translateY(${deltaY}px)`);
          pos.el[0].offsetHeight; // Trigger repaint
          pos.el.css({
            transition: 'transform 0.4s ease',
            transform: 'translateY(0)'
          });

          setTimeout(() => {
            pos.el.css({ transition: '', transform: '' });
          }, 400);
        }
      });

      // Animar altura del contenedor
      const alturaDespues = $contenedor.outerHeight();
      $contenedor.css({ height: alturaAntes, transition: 'height 0.4s ease' });
      $contenedor[0].offsetHeight;
      $contenedor.css('height', alturaDespues);

      setTimeout(() => {
        $contenedor.css({
          transition: '',
          height: '',
          'padding-bottom': paddingInferiorOriginal
        });
      }, 400);

      guardarCarrito();
      mostrarResumenPedido();

      itemPendienteEliminar = null;
    });
  }, 400);
});

function guardarPosiciones() {
  const posiciones = [];
  $('#resumen-pedido li, .IVA').each(function () {
    posiciones.push({
      el: $(this),
      top: $(this).offset().top
    });
  });
  return posiciones;
}

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

// Cargar productos y mostrar el resumen
$.get('/api/products', function (data) {
  productosDisponibles = data;
  mostrarResumenPedido();
});
