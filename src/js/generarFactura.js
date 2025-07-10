document.addEventListener("DOMContentLoaded", cargarPedidos);

function cargarPedidos() {
  fetch("/api/orders")
    .then(res => {
      if (!res.ok) throw new Error("Error al obtener pedidos");
      return res.json();
    })
    .then(pedidos => {
      const tbody = document.querySelector("#tabla-pedidos tbody");
      tbody.innerHTML = "";

      pedidos.forEach(pedido => {
        
        const tr = document.createElement("tr");

        // Fecha formateada
        const fecha = new Date(pedido.createdAt).toLocaleString("es-ES");

        // Cliente completo
        const cliente = `${pedido.user.nombre} ${pedido.user.apellidos}`;

        // Estado editable
const select = document.createElement("select");
["pendiente", "pagado"].forEach(opcion => {
  const opt = document.createElement("option");
  opt.value = opcion;
  opt.textContent = opcion;
  if (pedido.status === opcion) opt.selected = true;
  select.appendChild(opt);
});

// Si el pedido ya está pagado, deshabilita el select para impedir volver a pendiente
if (pedido.status === "pagado") {
  select.disabled = true;
}


        // Evento para cambio de estado (solo visual)
select.addEventListener("change", () => {
  const nuevoEstado = select.value;

  // Si cambia a 'pagado', recogida en tienda y no tiene localizador
  if (nuevoEstado === "pagado" && pedido.user.metodoEnvio === "tienda" && !pedido.localizador) {
    pedido.localizador = generarLocalizador();
    alert(`Localizador generado para recogida en tienda: ${pedido.localizador}`);
  }

  pedido.status = nuevoEstado;

  // Enviar la actualización al backend
fetch("/api/orders", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    id: pedido.id,
    user: pedido.user,        // Aquí envías el usuario
    items: pedido.items,
    precio: pedido.precio,    // Aquí envías el precio
    status: pedido.status,
    localizador: pedido.localizador || null
  })
})

    .then(res => {
      if (!res.ok) throw new Error("Error al actualizar pedido");
      return res.json();
    })
    .then(data => {
      console.log("Pedido actualizado:", data);
      alert(`Pedido actualizado correctamente${data.localizador ? " con localizador " + data.localizador : ""}.`);
    })
    .catch(err => {
      console.error("Error al actualizar pedido:", err);
      alert("Error al actualizar el pedido.");
    });
});


        // Botón para generar factura
        const btn = document.createElement("button");
        btn.textContent = "Generar factura";
        btn.addEventListener("click", () => {
          localStorage.setItem("ultimoPedido", JSON.stringify({
            id: pedido.id,
            createdAt: pedido.createdAt,
            user: pedido.user,
            items: pedido.items,
            precio: pedido.precio,
            localizador: pedido.localizador || null,
            status: pedido.status
          }));
          window.location.href = "factura.html";
        });

        // Montar fila
        tr.innerHTML = `
          <td>${pedido.id}</td>
          <td>${fecha}</td>
          <td>${cliente}</td>
        `;
        const tdEstado = document.createElement("td");
        tdEstado.appendChild(select);
        const tdFactura = document.createElement("td");
        tdFactura.appendChild(btn);

        tr.appendChild(tdEstado);
        tr.appendChild(tdFactura);

        tbody.appendChild(tr);
      });
    })
    .catch(err => {
      console.error("Error al cargar pedidos:", err);
      alert("No se pudieron cargar los pedidos.");
    });
}
function generarLocalizador() {
  const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let localizador = 'PED-';
  for (let i = 0; i < 6; i++) {
    localizador += letras.charAt(Math.floor(Math.random() * letras.length));
  }
  return localizador;
}
