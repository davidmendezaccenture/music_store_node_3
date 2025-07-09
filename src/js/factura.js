document.addEventListener("DOMContentLoaded", () => {
  const pedidoJSON = localStorage.getItem('ultimoPedido');
  if (!pedidoJSON) {
    document.body.innerHTML = '<h2>❌ No se encontró ningún pedido reciente.</h2>';
    return;
  }

  const pedido = JSON.parse(pedidoJSON);
  const fecha = new Date(pedido.createdAt).toLocaleString();

  // Rellenar datos principales
  document.getElementById('pedido-id').textContent = pedido.id ?? 'Sin ID';
  document.getElementById('pedido-fecha').textContent = fecha;
  document.getElementById('cliente-nombre').textContent = `${pedido.user.nombre} ${pedido.user.apellidos}`;
  document.getElementById('cliente-email').textContent = pedido.user.email;
  document.getElementById('cliente-telefono').textContent = pedido.user.telefono;
  document.getElementById('metodo-envio').textContent = pedido.user.metodoEnvio;
  document.getElementById('metodo-pago').textContent = pedido.user.metodoPago;

  // Dirección (solo si es domicilio)
  if (pedido.user.metodoEnvio === 'domicilio') {
    const dir = pedido.user.direccion;
    if (dir) {
      const direccionTexto = `${dir.calle}, ${dir.cp} ${dir.ciudad}`;
      document.getElementById('direccion-completa').textContent = direccionTexto;
      document.getElementById('direccion-envio').style.display = 'block';
    }
  }

  // Estado y localizador
  const estadoSpan = document.getElementById('estado-texto');
  estadoSpan.textContent = pedido.status;
  estadoSpan.classList.add(pedido.status === 'pendiente' ? 'pendiente' : 'pagado');

  if (pedido.localizador) {
    document.getElementById('localizador').textContent = pedido.localizador;
    document.getElementById('localizador-linea').style.display = 'block';
  }

  if (pedido.status === 'pendiente') {
    document.getElementById('mensaje-pendiente').style.display = 'block';
  }

  // Lista de productos
  const lista = document.getElementById('lista-productos');
  lista.innerHTML = pedido.items.map(item => `
    <div>
      <strong>${item.nombre}</strong> (${item.descripcion}) - 
      ${item.cantidad} × ${item.precioUnitario.toFixed(2)} € = 
      <strong>${item.total.toFixed(2)} €</strong>
    </div>
  `).join('');

  // Totales
  document.getElementById('subtotal').textContent = pedido.precio.subtotal.toFixed(2);
  const descuentoValor = (pedido.precio.subtotal * (pedido.precio.descuentoAplicado / 100));
  document.getElementById('descuento').textContent = descuentoValor.toFixed(2);
  document.getElementById('envio').textContent = pedido.precio.gastosEnvio.toFixed(2);
  document.getElementById('total').textContent = pedido.precio.total.toFixed(2);

  // Opcional: limpiar el pedido del localStorage tras cargarlo
  // localStorage.removeItem('ultimoPedido');
});
