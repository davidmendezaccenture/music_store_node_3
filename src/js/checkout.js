let productosDisponibles = [];
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
let metodoEnvio = 'domicilio'; // Valor por defecto, puedes cambiarlo dinámicamente

function mostrarResumenPedido() {
  const $resumen = $('#resumen-pedido');
  const $envio = $('#envio');
  const $total = $('#total');

  $resumen.empty();

  if (carrito.length === 0) {
    // Mostrar mensaje de carrito vacío
    $resumen.append('<li class="list-group-item text-center text-muted">No tienes artículos en el carrito.</li>');
    
    // Poner gastos y total a 0
    $envio.text('0.00 €');
    $total.text('0.00 €');
    return;
  }

  let totalPedido = 0;

  carrito.forEach(item => {
    const producto = productosDisponibles.find(p => p.id === item.id);
    if (!producto) return;

    const subtotal = producto.offerPrice * item.cantidad;
    totalPedido += subtotal;

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

    // Calcular gastos de envío
    let gastosEnvio = 10;
    const metodoEnvio = localStorage.getItem('metodoEnvio'); // 'tienda' o 'domicilio'
    if (totalPedido > 300 || metodoEnvio === 'tienda') {
        gastosEnvio = 0;
    }
    $envio.text(`${gastosEnvio.toFixed(2)} €`);
    $total.text(`${(totalPedido + gastosEnvio).toFixed(2)} €`);
}

    let itemPendienteEliminar = null;
    let posicionesAntesEliminar = [];

    $('#resumen-pedido').on('click', '.btn-eliminar-checkout', function () {
        const $li = $(this).closest('li');
        itemPendienteEliminar = $li.data('id');
        posicionesAntesEliminar = guardarPosiciones();
        mostrarModalConfirmarEliminacion();
    });

    $(document).on('click', '#btn-confirmar-eliminar', function () {
        if (!itemPendienteEliminar) return;
        modalEliminar.hide();
        const $liEliminar = $(`#resumen-pedido li[data-id="${itemPendienteEliminar}"]`);
        $liEliminar.addClass('removiendo');
        const $contenedor = $('#resumen-pedido').closest('.p-4');
        const alturaAntes = $contenedor.outerHeight();

  // Tenemos que quitar padding-bottom del contenedor para que borde y elemento <p> vaya juntos sin efecto rebote al final
        const paddingInferiorOriginal = $contenedor.css('padding-bottom');
        $contenedor.css('padding-bottom', '0px');
        carrito = carrito.filter(item => item.id !== itemPendienteEliminar);

        setTimeout(() => {
            $liEliminar.remove();
            if (carrito.length === 0) {
            // Insertamos el mensaje de vacío
                $('#resumen-pedido').append('<li class="list-group-item text-center text-muted">No tienes artículos en el carrito.</li>');
            }
            requestAnimationFrame(() => {
                const posicionesDespues = guardarPosiciones();
                posicionesDespues.forEach(pos => {
                    const antes = posicionesAntesEliminar.find(p => p.el.is(pos.el));
                    if (!antes) return;
                    const deltaY = antes.top - pos.top;
                    if (deltaY !== 0) {
                        pos.el.css('transform', `translateY(${deltaY}px)`);
                        pos.el[0].offsetHeight;
                        pos.el.css({
                            transition: 'transform 0.4s ease',
                            transform: 'translateY(0)'
                        });
                        setTimeout(() => {
                            pos.el.css({ transition: '', transform: '' });
                        }, 400);
                    }
                });
                const alturaDespues = $contenedor.outerHeight();
                $contenedor.css({ height: alturaAntes, transition: 'height 0.4s ease' });
                $contenedor[0].offsetHeight;
                $contenedor.css('height', alturaDespues);
                setTimeout(() => {
                    $contenedor.css({
                        transition: '',
                        height: '',
                        'padding-bottom': paddingInferiorOriginal // ✅ Restaurar padding original
                    });
                }, 400);

                guardarCarrito();
                if (carrito.length === 0) {
                    mostrarResumenPedido();
                }
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

$.get('/api/products', function (data) {
  productosDisponibles = data;
  mostrarResumenPedido();
});
