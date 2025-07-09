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
  if(pedido.user.metodoEnvio === "tienda"){
     document.getElementById('metodo-envio').textContent = "Recogida en tienda";
  } else {
     document.getElementById('metodo-envio').textContent = "Envio a domicilio";
  }
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

  // ✅ Lista de productos como tabla
  const tbody = document.querySelector("#tabla-productos tbody");
  pedido.items.forEach(item => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${item.nombre}</td>
      <td>${item.descripcion || '-'}</td>
      <td>${item.cantidad}</td>
      <td>${item.precioUnitario.toFixed(2)} €</td>
      <td>${item.total.toFixed(2)} €</td>
    `;
    tbody.appendChild(fila);
  });

  // Totales
  document.getElementById('subtotal').textContent = pedido.precio.subtotal.toFixed(2);
  const descuentoValor = (pedido.precio.subtotal * (pedido.precio.descuentoAplicado / 100));
  document.getElementById('descuento').textContent = descuentoValor.toFixed(2);
  document.getElementById('envio').textContent = pedido.precio.gastosEnvio.toFixed(2);
  document.getElementById('total').textContent = pedido.precio.total.toFixed(2);

  //Volver a activar para limpiar
  // localStorage.removeItem('ultimoPedido');
const { jsPDF } = window.jspdf;

document.getElementById('btn-descargar-pdf').addEventListener('click', () => {
  const doc = new jsPDF();

  // --- Datos básicos ---
  doc.setFontSize(18);
  doc.text("Factura del pedido", 10, 20);

  doc.setFontSize(12);

  const pedidoId = document.getElementById('pedido-id').textContent || '';
  const pedidoFecha = document.getElementById('pedido-fecha').textContent || '';
  const clienteNombre = document.getElementById('cliente-nombre').textContent || '';
  const clienteEmail = document.getElementById('cliente-email').textContent || '';
  const clienteTelefono = document.getElementById('cliente-telefono').textContent || '';
  const metodoEnvio = document.getElementById('metodo-envio').textContent || '';
  const metodoPago = document.getElementById('metodo-pago').textContent || '';
  const direccionCompleta = document.getElementById('direccion-completa').textContent || '';
  const mostrarDireccion = document.getElementById('direccion-envio').style.display !== 'none';

  let y = 30;
  const lineHeight = 7;

  doc.text(`Pedido: ${pedidoId}`, 10, y); y += lineHeight;
  doc.text(`Fecha: ${pedidoFecha}`, 10, y); y += lineHeight;
  doc.text(`Nombre: ${clienteNombre}`, 10, y); y += lineHeight;
  doc.text(`Email: ${clienteEmail}`, 10, y); y += lineHeight;
  doc.text(`Teléfono: ${clienteTelefono}`, 10, y); y += lineHeight;
  doc.text(`Envío: ${metodoEnvio}`, 10, y); y += lineHeight;
  doc.text(`Pago: ${metodoPago}`, 10, y); y += lineHeight;

  if (mostrarDireccion && direccionCompleta.trim() !== '') {
    doc.text(`Dirección: ${direccionCompleta}`, 10, y);
    y += lineHeight;
  }

  // --- Tabla productos ---
  const productosTable = document.querySelector("#tabla-productos tbody");
  const productos = [];

  // Recolectamos datos de la tabla HTML
  productosTable.querySelectorAll("tr").forEach(tr => {
    const tds = tr.querySelectorAll("td");
    productos.push([
      tds[0]?.textContent || '',
      tds[1]?.textContent || '',
      tds[2]?.textContent || '',
      tds[3]?.textContent || '',
      tds[4]?.textContent || ''
    ]);
  });

  doc.autoTable({
    startY: y + 5,
    head: [['Producto', 'Descripción', 'Cantidad', 'Precio unitario', 'Total']],
    body: productos,
    theme: 'grid',
    styles: { fontSize: 10 },
    headStyles: { fillColor: [0, 102, 204], textColor: 255 }
  });

  y = doc.lastAutoTable.finalY + 10;

  // --- Totales ---
  const subtotal = document.getElementById('subtotal').textContent || '0';
  const descuento = document.getElementById('descuento').textContent || '0';
  const envio = document.getElementById('envio').textContent || '0';
  const total = document.getElementById('total').textContent || '0';

  doc.text(`Subtotal: ${subtotal} €`, 10, y); y += lineHeight;
  doc.text(`Descuento: ${descuento} %`, 10, y); y += lineHeight;
  doc.text(`Gastos de envío: ${envio} €`, 10, y); y += lineHeight;

  doc.setFontSize(14);
  doc.text(`Total: ${total} €`, 10, y);
  y += lineHeight + 5;
  doc.setFontSize(12);

  // --- Estado del pedido y localizador ---
  const estadoTexto = document.getElementById('estado-texto').textContent || '';
  const localizadorLinea = document.getElementById('localizador-linea');
  const localizador = document.getElementById('localizador').textContent || '';

  doc.text(`Estado del pedido: ${estadoTexto}`, 10, y);
  y += lineHeight;

  if (localizadorLinea.style.display !== 'none' && localizador.trim() !== '') {
    doc.text(`Localizador: ${localizador}`, 10, y);
    y += lineHeight;
  }

  // --- Añadir imagen QR ---
  const qrImg = document.querySelector("#qr-container img");
  if (qrImg) {
    const qrBase64 = qrImg.src;
    // La posición y tamaño puedes ajustar
    doc.addImage(qrBase64, 'PNG', 150, 30, 40, 40);
  }

  // Guardar PDF
  doc.save(`factura_${pedidoId}.pdf`);
});


window.addEventListener('load', () => {
  const localizador = document.getElementById('localizador').textContent.trim();
  const qrContainer = document.getElementById('qr-container');

  if (localizador) {
    // Solo genera QR si hay localizador
    qrContainer.innerHTML = ""; // limpia contenido previo
    new QRCode(qrContainer, {
      text: localizador,
      width: 128,
      height: 128,
      colorDark : "#000000",
      colorLight : "#ffffff",
      correctLevel : QRCode.CorrectLevel.H
    });
    const qrImg = document.querySelector("#qr-container img");
    if (qrImg) {
        qrImg.alt = "Código QR";
    }
  } else {
    qrContainer.innerHTML = "";
  }
});



});
