document.addEventListener("DOMContentLoaded", () => {
    const pedidoJSON = localStorage.getItem('ultimoPedido');
    if (!pedidoJSON) {
        document.body.innerHTML = `
        <div class="d-flex flex-column justify-content-center align-items-center vh-100 text-center p-3">
            <h2>❌ No se encontró ningún pedido reciente.</h2>
            <a href="index.html" class="btn btn-primary mt-3">Volver a la tienda</a>
        </div>
        `;
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

    //Para generar PDF
    const { jsPDF } = window.jspdf;

    // Función para convertir una imagen a base64
    function getImageBase64(imgElement) {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            canvas.width = imgElement.naturalWidth;
            canvas.height = imgElement.naturalHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(imgElement, 0, 0);
            resolve(canvas.toDataURL('image/png'));
        });
    }

    document.getElementById('btn-descargar-pdf').addEventListener('click', async () => {
        const spinner = document.getElementById('spinner-pdf');
        spinner.style.display = 'inline-block';

        const logoImg = document.getElementById('logo-tienda');
        const logoBase64 = await getImageBase64(logoImg);

        const doc = new jsPDF();

        // Logo
        const originalWidth = logoImg.naturalWidth;
        const originalHeight = logoImg.naturalHeight;

        const targetWidth = 60; // en mm
        const ratio = originalHeight / originalWidth;
        const targetHeight = targetWidth * ratio;

        //Redimensionamiento del logo
        doc.addImage(logoBase64, 'PNG', 7.5, 10, targetWidth, targetHeight);

        let y = 10 + targetHeight + 10;
        const lineHeight = 7;

        doc.setFontSize(18);
        doc.text("Factura del pedido", 10, y); 
        y += lineHeight + 5;
        doc.setFontSize(12);

        // Datos del pedido
        const pedidoId = document.getElementById('pedido-id').textContent || '';
        const pedidoFecha = document.getElementById('pedido-fecha').textContent || '';
        const clienteNombre = document.getElementById('cliente-nombre').textContent || '';
        const clienteEmail = document.getElementById('cliente-email').textContent || '';
        const clienteTelefono = document.getElementById('cliente-telefono').textContent || '';
        const metodoEnvio = document.getElementById('metodo-envio').textContent || '';
        const metodoPago = document.getElementById('metodo-pago').textContent || '';
        const direccionCompleta = document.getElementById('direccion-completa').textContent || '';
        const mostrarDireccion = document.getElementById('direccion-envio').style.display !== 'none';

        doc.text(`Pedido: ${pedidoId}`, 10, y); y += lineHeight;
        doc.text(`Fecha: ${pedidoFecha}`, 10, y); y += lineHeight;
        doc.text(`Nombre: ${clienteNombre}`, 10, y); y += lineHeight;
        doc.text(`Email: ${clienteEmail}`, 10, y); y += lineHeight;
        doc.text(`Teléfono: ${clienteTelefono}`, 10, y); y += lineHeight;
        doc.text(`Envío: ${metodoEnvio}`, 10, y); y += lineHeight;
        doc.text(`Pago: ${metodoPago}`, 10, y); y += lineHeight;

        if (mostrarDireccion && direccionCompleta.trim() !== '') {
            doc.text(`Dirección: ${direccionCompleta}`, 10, y); y += lineHeight;
        }

        // Productos
        const productosTable = document.querySelector("#tabla-productos tbody");
        const productos = [];
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
            startY: y,
            head: [['Producto', 'Descripción', 'Cantidad', 'Precio unitario', 'Total']],
            body: productos,
            theme: 'grid',
            styles: { fontSize: 10 },
            headStyles: { fillColor: [0, 102, 204], textColor: 255 },
            margin: { left: 10 }
        });

        y = doc.lastAutoTable.finalY + 10;

        // Totales
        const subtotal = document.getElementById('subtotal').textContent || '0';
        const descuento = document.getElementById('descuento').textContent || '0';
        const envio = document.getElementById('envio').textContent || '0';
        const total = document.getElementById('total').textContent || '0';

        doc.text(`Subtotal: ${subtotal} €`, 10, y); y += lineHeight;
        doc.text(`Descuento: ${descuento} €`, 10, y); y += lineHeight;
        doc.text(`Gastos de envío: ${envio} €`, 10, y); y += lineHeight;

        doc.setFontSize(14);
        doc.text(`Total: ${total} €`, 10, y); y += lineHeight + 5;
        doc.setFontSize(12);

        // --- Estado del pedido y localizador ---
        const estadoTexto = document.getElementById('estado-texto').textContent || '';
        const localizadorLinea = document.getElementById('localizador-linea');
        const localizador = document.getElementById('localizador').textContent || '';

        doc.text(`Estado del pedido: ${estadoTexto}`, 10, y); y += lineHeight;

        if (localizadorLinea.style.display !== 'none' && localizador.trim() !== '') {
            doc.text(`Localizador: ${localizador}`, 10, y); y += lineHeight;
        }
        if (estadoTexto.includes('pendiente')) {
            y += lineHeight;
            doc.setTextColor(255, 0, 0); // rojo
            doc.setFontSize(11);
            doc.text("Factura provisional. Te enviaremos la factura final una vez confirmemos la recepción del pago.", 10, y, { maxWidth: 190 });
            doc.setTextColor(0, 0, 0); // restablecer a negro
            doc.setFontSize(12);
            y += lineHeight * 2;
        }
        
        // --- Código QR ---
        const qrImg = document.querySelector("#qr-container img");
        if (qrImg) {
            const qrBase64 = qrImg.src;
            doc.addImage(qrBase64, 'PNG', 150, 30, 40, 40);
        }

        // Descargar el PDF
        const pdfBlob = doc.output('blob');
        const blobUrl = URL.createObjectURL(pdfBlob);
        window.open(blobUrl, '_blank');
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
            document.getElementById("qr-text").style.display = "block";
        }
        } else {
            qrContainer.innerHTML = "";
            document.getElementById("qr-text").style.display = "none";
        }
    });
    //Limpiamos localstorage
    localStorage.removeItem('ultimoPedido');
    localStorage.removeItem('mantenerFiltros');
});
