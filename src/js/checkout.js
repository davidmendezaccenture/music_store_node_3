let productosDisponibles = [];
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
let metodoEnvio = 'domicilio'; //Iniciamos en domicilio

let descuentoAplicado = 0; // Porcentaje de descuento

//Si no hay pedidos, el botón de pago se desactiva
document.addEventListener('DOMContentLoaded', function () {
  actualizarEstadoBotonCheckout();
});
//Función que muestra el resumen del pedido
function mostrarResumenPedido() {
  const $resumen = $('#resumen-pedido');
  //Limpiamos el resumen cuando llamamos a esta función
  $resumen.empty();
  //Si el carrito está vacío, mostramos el mensaje de carrito vacío y actualizamos gastos y total
  if (carrito.length === 0) {
    mostrarMensajeCarritoVacio();
    actualizarGastosYTotal();
    return;
  }
  //Creamos un elemento de la lista con cada elemento del carrito
  carrito.forEach(item => {
    const producto = productosDisponibles.find(p => p.id === item.id);
    if (!producto) return;
    const subtotal = producto.offerPrice * item.cantidad;
    const $li = $(`
      <li class="list-group-item mb-3" data-id="${item.id}">
        <div class="d-flex flex-column gap-1">
          <div class="d-flex align-items-center gap-3">
            <img src="${producto.image}" alt="${producto.name}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 5px;">
            <strong class="mb-0">${producto.name}</strong>
          </div>
          <div class="ms-5">
            <small class="text-muted">${producto.description}</small>
          </div>
          <div class="d-flex justify-content-between align-items-center ms-5 mt-1 flex-wrap">
            <span class="text-muted">${item.cantidad} unidad(es) × ${producto.offerPrice.toFixed(2)} €</span>
            <span class="fw-bold">Total: ${subtotal.toFixed(2)} €</span>
            <button class="btn btn-sm btn-outline-danger btn-eliminar-checkout" title="Eliminar producto">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </div>
      </li>
    `);
    $resumen.append($li);
  });
  //Actualizamos gastos y total
  actualizarGastosYTotal();
}
//Variables para eliminar elementos con animación
let itemPendienteEliminar = null;
let posicionesAntesEliminar = [];
//Función para llamar a la modal previa a eliminar items
$('#resumen-pedido').on('click', '.btn-eliminar-checkout', function () {
  const $li = $(this).closest('li');
  itemPendienteEliminar = $li.data('id');
  posicionesAntesEliminar = guardarPosiciones();
  mostrarModalConfirmarEliminacion();
});
//Función para elininar items tras confirmar la modal con animación
$(document).on('click', '#btn-confirmar-eliminar', function () {
  if (!itemPendienteEliminar) return;
  modalEliminar.hide();
  const $liEliminar = $(`#resumen-pedido li[data-id="${itemPendienteEliminar}"]`);
  $liEliminar.addClass('removiendo');
  const $contenedor = $('#resumen-pedido').closest('.p-4');
  const alturaAntes = $contenedor.outerHeight();
  const paddingInferiorOriginal = $contenedor.css('padding-bottom');
  $contenedor.css('padding-bottom', '0px');

  carrito = carrito.filter(item => item.id !== itemPendienteEliminar);

  setTimeout(() => {
    $liEliminar.remove();
    if (carrito.length === 0) {
      mostrarMensajeCarritoVacio();
    } else {
      actualizarGastosYTotal();
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
          'padding-bottom': paddingInferiorOriginal
        });
      }, 400);

      guardarCarrito();
      if (carrito.length === 0) {
        mostrarResumenPedido();
        guardarCarrito();
        actualizarEstadoBotonCheckout();
      }
      itemPendienteEliminar = null;
    });
  }, 400);
});
//Función para guardar las posiciones de los elementos que animamos al eliminar items
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
//Función que guarda el carrito en localStorage y backend
function guardarCarrito() {
  const usuario = localStorage.getItem('usuario') || 'guest';
  localStorage.setItem('carrito', JSON.stringify(carrito));

  $.ajax({
    url: '/api/cart',
    method: 'POST',
    contentType: 'application/json',
    data: JSON.stringify({ user: usuario, items: carrito }),
    success: () => console.log('Carrito guardado'),
    error: () => alert('Error al guardar el carrito')
  });
}
//Función para mostrar el mensaje de carrito vacío
function mostrarMensajeCarritoVacio() {
  $('#resumen-pedido').append(`
    <li class="list-group-item text-center text-muted border-0 bg-transparent fw-semibold">
      No tienes artículos en el carrito.
    </li>
  `);

  $('#envio, #totalSinEnvio, #total').text('0.00 €');
  descuentoAplicado = 0;
}
//Función para actualizar subtotal, descuento, gastos de envío y total
function actualizarGastosYTotal() {
  let totalPedido = 0;
  let totalUnidades = 0;

  carrito.forEach(item => {
    const producto = productosDisponibles.find(p => p.id === item.id);
    if (!producto) return;
    totalPedido += producto.offerPrice * item.cantidad;
    totalUnidades += item.cantidad;
  });

  const descuento = (totalPedido * descuentoAplicado) / 100;
  const totalConDescuento = totalPedido - descuento;

  let gastosEnvioNormal = totalUnidades > 0 ? 10 + (totalUnidades - 1) * 5 : 0;
  let gastosEnvioFinal = (metodoEnvio === 'tienda' || totalConDescuento > 500) ? 0 : gastosEnvioNormal;

if (gastosEnvioFinal === 0 && gastosEnvioNormal > 0) {
  $('#envio')
    .html(`
      <span style="text-decoration: line-through; color: #888; margin-right: 8px;">
        ${gastosEnvioNormal.toFixed(2)} €
      </span>
      <strong style="color:red;">0.00 €</strong>
    `)
    .attr('data-envio', gastosEnvioFinal.toFixed(2));
} else {
  $('#envio')
    .text(`${gastosEnvioFinal.toFixed(2)} €`)
    .attr('data-envio', gastosEnvioFinal.toFixed(2));
}

  if (descuentoAplicado > 0) {
    $('#totalSinEnvio').html(`
      <span style="text-decoration: line-through; color: #888; margin-right: 8px;">
        ${totalPedido.toFixed(2)} €
      </span>
      <strong>${totalConDescuento.toFixed(2)} €</strong>
    `);
  } else {
    $('#totalSinEnvio').text(`${totalPedido.toFixed(2)} €`);
  }

  $('#total').text(`${(totalConDescuento + gastosEnvioFinal).toFixed(2)} €`);
}
//Función para aplicar cupones de descuento. Los obtenemos del backend con la función validarCupon
$('#btn-aplicar-cupon').on('click', async function () {
  const codigo = $('#input-cupon').val().trim();
  let subtotal = 0;
  carrito.forEach(item => {
    const producto = productosDisponibles.find(p => p.id === item.id);
    if (!producto) return;
    subtotal += producto.offerPrice * item.cantidad;
  });

  const resultado = await validarCupon(codigo, subtotal);

  if (resultado.valido) {
    descuentoAplicado = resultado.descuento || 0;
    $('#mensaje-cupon').css('color', 'green').text(resultado.mensaje);
  } 
  else if (!codigo){
    descuentoAplicado = 0;
    $('#mensaje-cupon').css('color', 'red').text('Introduce un código de cupón.');
  }
  else {
    descuentoAplicado = 0;
    $('#mensaje-cupon').css('color', 'red').text(resultado.mensaje);
  }

  actualizarGastosYTotal();
});
//Función de envío del formulario. Muestra la modal de confirmación previa al pago
$('#form-checkout').on('submit', function (e) {
  e.preventDefault();
  $('#input-cupon')
  if (!this.checkValidity()) {
    $(this).addClass('was-validated');
    return;
  }
   mostrarModalRealizarPago();

});
//Animación de los items del resumen al cargar la página. Carga también los datos de usuario
$(document).ready(() => {
  //Animacion contenedor al cargar
    $('#contenedor-resumen').addClass('fade-in-smooth');
    $('#columna-resumen').addClass('fade-in-smooth');
  // Cargar datos del usuario
  const usuarioStr = localStorage.getItem('datosUsuario');
  if (usuarioStr) {
    try {
      const usuario = JSON.parse(usuarioStr);
      if (usuario.username) $('#nombre').val(usuario.username);
      if (usuario.apellidos) $('#apellidos').val(usuario.apellidos);
      if (usuario.phone) $('#telefono').val(usuario.phone);
      if (usuario.email) $('#email').val(usuario.email);
      if (usuario.city) $('#ciudad').val(usuario.city);
      if (usuario.postalcode) $('#cp').val(usuario.postalcode);
    } catch (e) {
      console.error('Error al parsear el usuario en localStorage', e);
    }
  }

  // Manejar cambio de método de envío. Muestra el resto de elementos del envio a domicilio y se actualizan los gastos de envío
  $('#metodoEnvio').on('change', function () {
    const valor = $(this).val();
    metodoEnvio = valor;

    if (valor === 'domicilio') {
      $('#datos-envio').show();
      $('#direccion, #ciudad, #cp').attr('required', true);
    } else {
      $('#datos-envio').hide();
      $('#direccion, #ciudad, #cp').removeAttr('required');
    }

    actualizarGastosYTotal();
  }).trigger('change');

  $.get('/api/products', function (data) {
    productosDisponibles = data;
    mostrarResumenPedido();
  });
});

// Función de validación de cupones (con fetch, no jQuery)
function validarCupon(codigoCupon, subtotal) {
  return new Promise((resolve, reject) => {
    $.get('/api/coupons')
      .done(cupones => {
        if (codigoCupon.trim() === '') {
          resolve({ valido: false, total: subtotal, mensaje: '' });
          return;
        }

        const cupon = cupones.find(c => c.codigo.toLowerCase() === codigoCupon.toLowerCase());
        if (!cupon) {
          resolve({ valido: false, mensaje: 'Cupón inválido', total: subtotal });
          return;
        }

        const descuento = (subtotal * cupon.descuento) / 100;
        resolve({
          valido: true,
          descuento: cupon.descuento,
          mensaje: `Cupón válido. Has aplicado un ${cupon.descuento}% de descuento.`,
          total: (subtotal - descuento).toFixed(2)
        });
      })
      .fail(err => {
        console.error('Error al aplicar cupón:', err);
        resolve({ valido: false, mensaje: 'Error al validar el cupón', total: subtotal });
      });
  });
}


// Mostrar modal de confirmación de pago
function mostrarModalRealizarPago() {
  const modal = new bootstrap.Modal(document.getElementById('realizarPagoModal'));
  modal.show();
}

// Mostrar modal de pago confirmado
function mostrarModalPagoRealizado() {
  const modal = new bootstrap.Modal(document.getElementById('modalPagoConfirmado'));
  modal.show();
}

// Mostrar modal de datos de pago según método seleccionado
function mostrarModalDatosPago(metodo) {
  const modal = new bootstrap.Modal(document.getElementById('modalDatosPago'));

  // Oculta todos los formularios
  $('#formPaypal, #formTarjeta, #formTransferencia').addClass('d-none');

  // Mostrar formulario correspondiente
  if (metodo === 'paypal') {
    $('#formPaypal').removeClass('d-none');
    $('#btnConfirmarPago').text('Pagar con PayPal').data('metodo', 'paypal');
  } else if (metodo === 'tarjeta') {
    $('#formTarjeta').removeClass('d-none');
    $('#btnConfirmarPago').text('Pagar con tarjeta').data('metodo', 'tarjeta');
  } else if (metodo === 'transferencia') {
    $('#formTransferencia').removeClass('d-none');
    $('#btnConfirmarPago').text('Confirmar pedido').data('metodo', 'transferencia');
  } else if (metodo === 'bizum') {
    $('#formBizum').removeClass('d-none');
    $('#btnConfirmarPago').text('Confirmar pedido').data('metodo', 'bizum');
  }
  modal.show();
}

// Evento click en botón "Pagar" de la modal realizarPagoModal
$(document).on('click', '#btnDatosPago', function () {
  const metodoSeleccionado = $('#metodoPago').val();

  // Cerrar modal de confirmación de pago
  const confirmarModalEl = document.getElementById('realizarPagoModal');
  const confirmarModal = bootstrap.Modal.getInstance(confirmarModalEl);
  if (confirmarModal) confirmarModal.hide();

  mostrarModalDatosPago(metodoSeleccionado);
});

// Evento click en botón "Confirmar" de modalDatosPago
$(document).on('click', '#btnConfirmarPago', function () {
  const metodo = $(this).data('metodo');
  const mensajeEl = document.getElementById('mensajePago');
  let localizador= null;
  let valido = true;
  if (metodo === 'tarjeta') {
    valido = validarTarjeta();
  } else if (metodo === 'paypal') {
    valido = validarPaypal();
  }

  if (!valido) {
    // No cerrar la modal si hay errores
    return;
  }

  // Aquí cerramos la modal solo si es válido
  const modalDatosEl = document.getElementById('modalDatosPago');
  const modalDatos = bootstrap.Modal.getInstance(modalDatosEl);
  if (modalDatos) modalDatos.hide();

  if (metodo === 'transferencia') {
    // No mostrar modal de pago confirmado para transferencia. Guardamos en backend y enviamos a factura
    //Enviamos al backend, vaciamos el carrito, lo guardamos en el backend para limpiarlo, limpiamos los campos y enviamos a factura
    enviarPedido(obtenerDatosPedido());
    carrito = [];
    guardarCarrito();
    mostrarResumenPedido();
    limpiarFormularioPago();
    actualizarEstadoBotonCheckout();
    window.location.href = 'factura.html';
    return;
  }
    if (metodo === 'bizum') {
    // Igual que transferencia, no mostramos pago confirmado
    enviarPedido(obtenerDatosPedido());
    carrito = [];
    guardarCarrito();
    mostrarResumenPedido();
    limpiarFormularioPago();
    actualizarEstadoBotonCheckout();
    window.location.href = 'factura.html';
    return;
    //Creo que ya el return es opcional
  }

  if (metodoEnvio === 'tienda') {
    localizador = generarLocalizador(); // Función para generar un localizador
    mensajeEl.innerHTML = `¡Gracias por tu compra!<br>Ya puedes acudir a nuestra tienda con tu DNI y tu localizador <strong>${localizador}</strong>.`;
  }

  // Mostrar modal de pago confirmado, antes guardamos el pedido en backend
  enviarPedido(obtenerDatosPedido(localizador));
  const modalPagoConfirmadoEl = document.getElementById('modalPagoConfirmado');
  let modalPagoConfirmado = bootstrap.Modal.getInstance(modalPagoConfirmadoEl);
  if (!modalPagoConfirmado) modalPagoConfirmado = new bootstrap.Modal(modalPagoConfirmadoEl);
  modalPagoConfirmado.show();

  // Al cerrar modal pago confirmado, vaciar carrito y actualizar resumen
  $(modalPagoConfirmadoEl).one('hidden.bs.modal', function () {

    carrito = [];
    guardarCarrito();
    mostrarResumenPedido();
    limpiarFormularioPago();
    actualizarEstadoBotonCheckout();
    console.log('Modal de pago cerrada, carrito actualizado.');
    window.location.href = 'factura.html';
  });
});


//Función para generar un localizador al azar
function generarLocalizador() {
  const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let localizador = 'PED-';
  for (let i = 0; i < 6; i++) {
    localizador += letras.charAt(Math.floor(Math.random() * letras.length));
  }
  return localizador;
}

//Para limpiar el formulario tras el pago
function limpiarFormularioPago() {
  $('#form-checkout input[type="text"], #form-checkout input[type="email"], #form-checkout input[type="tel"]').val('');

  $('#form-checkout select').each(function () {
    $(this).prop('selectedIndex', 0);
  });

  $('#datos-envio').hide();

  $('#form-checkout').removeClass('was-validated');

  $('#form-checkout input, #form-checkout select').removeClass('is-invalid is-valid');
}
//Funciñon para deshabilitar botón de pago con carrito vacío
function actualizarEstadoBotonCheckout() {
  const boton = document.getElementById('btnSubmitCheckout');
  
  if (!boton) return;

  if (carrito.length === 0) {
    boton.disabled = true;
    boton.classList.remove('btn-primary');
  } else {
    boton.disabled = false;
    boton.classList.add('btn-primary');
  }
}

//Para validar los campos de las modales
function mostrarError(inputSelector, mensaje) {
  const input = $(inputSelector);
  input.addClass('is-invalid');
  input.next('.invalid-feedback').text(mensaje).show();
}
//Para limpiar los errores cuando el campo es correcto
function limpiarError(inputSelector) {
  const input = $(inputSelector);
  input.removeClass('is-invalid');
  input.next('.invalid-feedback').text('').hide();
}
//Para limpiar todos los erro
function limpiarTodosErrores(formSelector) {
  $(`${formSelector} .form-control`).each(function() {
    limpiarError(this);
  });
}
//Función para validar campos de modal paypal
function validarPaypal() {
  limpiarTodosErrores('#formPaypal');
  let valido = true;

  const email = $('#emailPaypal').val().trim();
  const password = $('#passwordPaypal').val();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    mostrarError('#emailPaypal', 'Introduce un correo electrónico válido.');
    valido = false;
  }

  if (!password) {
    mostrarError('#passwordPaypal', 'La contraseña no puede estar vacía.');
    valido = false;
  }

  return valido;
}
//Función para validar campos de tarjeta
function validarTarjeta() {
  limpiarTodosErrores('#formTarjeta');
  let valido = true;

  const numeroTarjeta = $('#numeroTarjeta').val().replace(/\s+/g, '');
  const fechaCaducidad = $('#fechaCaducidad').val().trim();
  const cvvTarjeta = $('#cvvTarjeta').val().trim();

  if (!/^\d{16}$/.test(numeroTarjeta)) {
    mostrarError('#numeroTarjeta', 'La tarjeta debe tener exactamente 16 dígitos.');
    valido = false;
  }

  if (!/^\d{2}\/\d{2}$/.test(fechaCaducidad)) {
    mostrarError('#fechaCaducidad', 'La fecha debe tener formato MM/YY.');
    valido = false;
  } else {
    const [mes, anio] = fechaCaducidad.split('/').map(str => parseInt(str));
    const fechaActual = new Date();
    const mesActual = fechaActual.getMonth() + 1;
    const anioActual = fechaActual.getFullYear() % 100;

    if (
      isNaN(mes) || isNaN(anio) ||
      mes < 1 || mes > 12 ||
      anio < anioActual || (anio === anioActual && mes < mesActual)
    ) {
      mostrarError('#fechaCaducidad', 'La tarjeta está caducada o la fecha es inválida.');
      valido = false;
    }
  }

  if (!/^\d{3}$/.test(cvvTarjeta)) {
    mostrarError('#cvvTarjeta', 'El CVV debe tener 3 dígitos.');
    valido = false;
  }

  return valido;
}
//Función para enviar al backend los datos del pedido:
function enviarPedido(pedido) {

  return fetch('/api/orders', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(pedido)
      })
    
  .then(res => {
    if (!res.ok) throw new Error(`Error en la respuesta: ${res.status}`);
    return res.json();
  })
  .then(data => {
  // Recibimos respuesta del servidor añadiendo el id y la fecha
    localStorage.setItem("ultimoPedido", JSON.stringify({
      id: data.id,
      createdAt: data.createdAt,
      user: pedido.user,
      items: pedido.items,
      precio: pedido.precio,
      localizador: data.localizador || null,
      status: data.status
  }));
  })
}
//Función para recopilar los datos del cliente
function obtenerDatosClienteDesdeFormulario() {
  const nombre = document.getElementById('nombre').value.trim();
  const apellidos = document.getElementById('apellidos').value.trim();
  const metodoEnvio = document.getElementById('metodoEnvio').value;
  const telefono = document.getElementById('telefono').value.trim();
  const email = document.getElementById('email').value.trim();
  const metodoPago = document.getElementById('metodoPago').value;

  const datosCliente = { nombre, apellidos, metodoEnvio, telefono, email, metodoPago };

  if (metodoEnvio === 'domicilio') {
    datosCliente.direccion = {
      calle: document.getElementById('direccion').value.trim(),
      ciudad: document.getElementById('ciudad').value.trim(),
      cp: document.getElementById('cp').value.trim()
    };
  }

  return datosCliente;
}
//Función para obtener los productos del resumen
function obtenerProductosDelResumen() {
  const productos = [];
  const lista = document.querySelectorAll("#resumen-pedido li.list-group-item");

  lista.forEach(li => {
    const id = li.getAttribute("data-id");

    const nombre = li.querySelector("strong")?.textContent.trim() || "";
    const descripcion = li.querySelector("small.text-muted")?.textContent.trim() || "";

    // Buscar el span que contiene la cantidad y precio unitario
    let cantidadPrecioTexto = "";
    const spansTextMuted = li.querySelectorAll("span.text-muted");
    spansTextMuted.forEach(span => {
      if (span.textContent.includes("unidad(es) ×")) {
        cantidadPrecioTexto = span.textContent;
      }
    });

    const match = cantidadPrecioTexto.match(/(\d+)\s+unidad\(es\)\s+×\s+([\d.,]+)\s*€/);
    let cantidad = 0;
    let precioUnitario = 0;
    if (match) {
      cantidad = parseInt(match[1], 10);
      precioUnitario = parseFloat(match[2].replace(',', '.'));
    }

    // Total del producto
    const totalTexto = li.querySelector("span.fw-bold")?.textContent || "";
    const totalMatch = totalTexto.match(/Total:\s*([\d.,]+)\s*€/);
    let total = 0;
    if (totalMatch) {
      total = parseFloat(totalMatch[1].replace(',', '.'));
    }

    productos.push({
      id,
      nombre,
      descripcion,
      cantidad,
      precioUnitario,
      total
    });
  });

  return productos;
}
//Función que reune todos los datos, cliene y pedido, añadimos localizador opcional
function obtenerDatosPedido(localizador = null) {
  const datosCliente = obtenerDatosClienteDesdeFormulario();
  const productos = obtenerProductosDelResumen();
  let subtotalTexto = "";
  let subtotal = 0;
  const totalSinEnvioEl = document.querySelector("#totalSinEnvio");
  if (totalSinEnvioEl.querySelector("span")) {
    subtotalTexto = totalSinEnvioEl.querySelector("span").textContent;
  } else {
    subtotalTexto = totalSinEnvioEl.textContent;
  }
  subtotal = parseFloat(subtotalTexto.replace(/[^\d.,]/g, "").replace(",", "."));

  const gastosEnvio = parseFloat(document.querySelector("#envio").getAttribute("data-envio"));

  const totalTexto = document.querySelector("#total").textContent;
  const total = parseFloat(totalTexto.replace(/[^\d.,]/g, "").replace(",", "."));

  const descuento = typeof descuentoAplicado === "number" ? descuentoAplicado : 0;

  const pedido = {
    user: datosCliente,
    items: productos,
    precio: {
      subtotal,
      descuentoAplicado: descuento,
      gastosEnvio,
      total
    }
  };

  if (localizador) {
    pedido.localizador = localizador;
  }
    return pedido;
}






