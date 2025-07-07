// Supongamos que carrito está definido en algún lugar y productosDisponibles se carga con la llamada Ajax.

function mostrarResumenPedido() {
  const $resumen = $('#resumen-pedido');
  $resumen.empty();

  carrito.forEach(item => {
    const producto = productosDisponibles.find(p => p.id === item.id);
    if (!producto) return; // si no se encuentra producto, ignorar

    const subtotal = producto.offerPrice * item.cantidad;

    const $li = $(`
      <li class="list-group-item d-flex justify-content-between align-items-center" data-id="${item.id}">
        <div>
          <strong>${producto.name}</strong><br>
          Cantidad: ${item.cantidad}<br>
          Precio unitario: ${producto.offerPrice.toFixed(2)} €
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
}

// Escuchar clicks en botones eliminar (delegación de eventos)
$('#resumen-pedido').on('click', '.btn-eliminar-checkout', function() {
  const idProducto = $(this).closest('li').data('id');
  // Eliminar producto del carrito
  carrito = carrito.filter(item => item.id !== idProducto);

  // Volver a mostrar resumen con carrito actualizado
  mostrarResumenPedido();

  // Opcional: actualizar localStorage o backend según corresponda
  localStorage.setItem('carrito', JSON.stringify(carrito));
});

// Cuando ya tengas cargados los productos disponibles y el carrito, llamar a mostrarResumenPedido()

// Ejemplo simple: carga de productos y luego mostrar carrito
let productosDisponibles = [];
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

$.get('/api/products', function(data) {
  productosDisponibles = data;
  mostrarResumenPedido();
});
