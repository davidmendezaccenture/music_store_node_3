// Supongamos que carrito está definido en algún lugar y productosDisponibles se carga con la llamada Ajax.
let productosDisponibles = [];
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

function mostrarResumenPedido() {
  const $resumen = $('#resumen-pedido');
  $resumen.empty();

  carrito.forEach(item => {
    const producto = productosDisponibles.find(p => p.id === item.id);
    if (!producto) return; // si no se encuentra producto, ignorar

    const subtotal = producto.offerPrice * item.cantidad;

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
}
//Variable para almacenar el elemento que queremos borrar
let itemPendienteEliminar = null; 
// Escuchar clicks en botones eliminar (delegación de eventos)
$('#resumen-pedido').on('click', '.btn-eliminar-checkout', function() {
    //Obtenemos el id del producto que vamos a eliminar y mostramos la modal
    itemPendienteEliminar = $(this).closest('li').data('id');
    mostrarModalConfirmarEliminacion();
});

$(document).on('click', '#btn-confirmar-eliminar', function() {

    if (!itemPendienteEliminar) return;
    modalEliminar.hide();
    // Eliminar producto del carrito
    carrito = carrito.filter(item => item.id !== itemPendienteEliminar);
    // Volver a mostrar resumen con carrito actualizado
    mostrarResumenPedido();
    // Guardamos el carrito de nuevo
    guardarCarrito();

});

// Función para guardar el carrito en backend y localStorage
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

// Cuando ya tengas cargados los productos disponibles y el carrito, llamar a mostrarResumenPedido()


$.get('/api/products', function(data) {
  productosDisponibles = data;
  mostrarResumenPedido();
});
