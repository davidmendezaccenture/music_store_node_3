$('#contenedor-carrito').on('click', '.btn-eliminar', function () {
  const $item = $(this).closest('.item-carrito');
  const id = $item.data('id');

  // Actualizar el array del carrito (suponiendo que lo tienes en memoria)
  carrito = carrito.filter(item => item.id !== id);
  carrito = carrito.filter(p => p.id !== id); // Quitamos el producto del array

  // Animación + eliminación del DOM
  $item.css({
    transition: 'opacity 0.3s, transform 0.3s',
    transform: 'translateX(100px)',
    opacity: 0
  });

  setTimeout(() => {
    $item.slideUp(200, function () {
      $(this).remove();

      // 👇 Solo actualiza el total, no recrees toda la lista
      actualizarTotal();
    });
  }, 300);
});

function actualizarTotal() {
  let total = 0;
  carrito.forEach(item => {
    const producto = productosDisponibles.find(p => p.id === item.id);
    if (producto) {
      total += producto.offerPrice * item.cantidad;
    }
  });

  $('#total-carrito').text(`Total: $${total.toFixed(2)}`);
}

//Probar para añadir animaciones

//Para eliminar del tiron
// Evento para eliminar producto directamente
$(document).on('click', '.btn-eliminar', function () {
  const id = $(this).closest('li').data('id');
  carrito = carrito.filter(p => p.id !== id); // Quitamos el producto del array
  guardarCarrito();
  mostrarCarrito();
});

//Animacion se completa aunque los elementos se desplazan al final
$('#contenedor-carrito').on('click', '.btn-eliminar', function () {
  const $item = $(this).closest('.item-carrito');
  const id = $item.data('id');

  carrito = carrito.filter(p => p.id !== id);

  $item.addClass('removiendo');

  // Esperamos el mismo tiempo que dura la animación
  setTimeout(() => {
    $item.remove();
    guardarCarrito();
    actualizarTotal();
  }, 400);
});