$(document).ready(function () {
    const $form = $('#form-busqueda-mobile, #form-busqueda-desktop');
    const esSearchPage = window.location.pathname.endsWith('search.html');
    const $precioMinInput = $('#precio-min');
    const $precioMaxInput = $('#precio-max');
    const $ordenPrecioSelect = $('#orden-precio');
    const $ordenValoracionSelect = $('#orden-valoracion');
    const $ordenPrioridadSelect = $('#orden-prioridad');
    const $checkboxOferta = $('#checkbox-oferta');
    const $selectorPaginacion = $('#selector-paginacion');
    const $contenedor = $('#resultados');
    const $paginacion = $('#paginacion');
    const $minValorSpan = $('#min-valor');
    const $maxValorSpan = $('#max-valor');

    let productosOriginales = [];
    let productosFiltradosGlobal = [];
    let paginaActual = 1;
    let productosPorPagina = 6;

    function guardarEstadoFiltros() {
        const estado = {
            q: $form.find('[name="q"]').val(),
            category: $form.find('[name="category"]').val(),
            precioMin: $precioMinInput.val(),
            precioMax: $precioMaxInput.val(),
            ordenPrecio: $ordenPrecioSelect.val(),
            ordenValoracion: $ordenValoracionSelect.val(),
            ordenPrioridad: $ordenPrioridadSelect.val(),
            checkboxOferta: $checkboxOferta.is(':checked'),
            estrellas: obtenerEstrellasSeleccionadas(),
            productosPorPagina: productosPorPagina,
            paginaActual: paginaActual
        };
        localStorage.setItem('estadoFiltros', JSON.stringify(estado));
    }

    function restaurarEstadoFiltros() {
        const estadoStr = localStorage.getItem('estadoFiltros');
        if (!estadoStr) return false;
        try {
            const estado = JSON.parse(estadoStr);
            $form.find('[name="q"]').val(estado.q || '');
            $form.find('[name="category"]').val(estado.category || '');
            $precioMinInput.val(estado.precioMin || '');
            $minValorSpan.text(estado.precioMin || '');
            $precioMaxInput.val(estado.precioMax || '');
            $maxValorSpan.text(estado.precioMax || '');
            $ordenPrecioSelect.val(estado.ordenPrecio || 'asc');
            $ordenValoracionSelect.val(estado.ordenValoracion || 'asc');
            $ordenPrioridadSelect.val(estado.ordenPrioridad || 'precio');
            $checkboxOferta.prop('checked', estado.checkboxOferta || false);
            productosPorPagina = estado.productosPorPagina || 6;
            paginaActual = estado.paginaActual || 1;
            if ($selectorPaginacion.length) {
                $selectorPaginacion.val(productosPorPagina);
            }
            $('#filtro-estrellas input[type="checkbox"]').each(function () {
                const val = parseInt($(this).val());
                $(this).prop('checked', estado.estrellas.includes(val));
            });
            return true;
        } catch (e) {
            console.error('Error restaurando estadoFiltros:', e);
            return false;
        }
    }

    function obtenerEstrellasSeleccionadas() {
        return $('#filtro-estrellas input[type="checkbox"]:checked')
            .map(function () {
                return parseInt(this.value);
            }).get();
    }

    function buscarYMostrar(query, category) {
        $.getJSON(`/buscar`, { q: query, category: category })
            .done(function (productos) {
                productosOriginales = productos;
                filtrarYOrdenar();
            })
            .fail(function (err) {
                console.error('Error al obtener productos:', err);
            });
    }

    function filtrarYOrdenar() {
        const estrellasSeleccionadas = obtenerEstrellasSeleccionadas();
        const minPrecio = parseFloat($precioMinInput.val());
        const maxPrecio = parseFloat($precioMaxInput.val());
        const soloEnOferta = $checkboxOferta.is(':checked');

        let filtrados = productosOriginales.filter(producto => {
            const ratingOk = estrellasSeleccionadas.length === 0 || estrellasSeleccionadas.includes(producto.rating);
            const precio = producto.enOferta === "sí" ? parseFloat(producto.offerPrice) : parseFloat(producto.price);
            const minPrecioOk = isNaN(minPrecio) || precio >= minPrecio;
            const maxPrecioOk = isNaN(maxPrecio) || precio <= maxPrecio;
            const ofertaOk = !soloEnOferta || producto.enOferta === "sí";
            return ratingOk && minPrecioOk && maxPrecioOk && ofertaOk;
        });

        filtrados.sort((a, b) => {
            const pA = Number(a.enOferta === 'sí' ? a.offerPrice : a.price) || 0;
            const pB = Number(b.enOferta === 'sí' ? b.offerPrice : b.price) || 0;
            const ordenPrecio = $ordenPrecioSelect.val() === 'asc' ? pA - pB : pB - pA;
            const ordenValoracion = $ordenValoracionSelect.val() === 'asc' ? a.rating - b.rating : b.rating - a.rating;
            if ($ordenPrioridadSelect.val() === 'precio') {
                return ordenPrecio !== 0 ? ordenPrecio : ordenValoracion;
            } else {
                return ordenValoracion !== 0 ? ordenValoracion : ordenPrecio;
            }
        });

        productosFiltradosGlobal = filtrados;
        mostrarResultados(productosFiltradosGlobal);
    }

    function mostrarResultados(productos) {
        $contenedor.empty();
        $paginacion.empty();

        if (productos.length === 0) {
            $contenedor.html(`
                <div class="no-encontrado text-center p-4" role="alert" aria-live="polite">
                    <img src="../assets/images/sin-datos.gif" alt="Sin resultados" style="width:64px;height:64px;margin-bottom:1rem;">
                    <p>No se encontraron productos.</p>
                    <p>Prueba a cambiar los filtros o los términos de búsqueda.</p>
                </div>`);
            return;
        }

        const totalPaginas = Math.ceil(productos.length / productosPorPagina);
        const inicio = (paginaActual - 1) * productosPorPagina;
        const fin = inicio + productosPorPagina;
        const productosPagina = productos.slice(inicio, fin);

        productosPagina.forEach((producto, i) => {
            const estrellas = '⭐'.repeat(producto.rating) + '☆'.repeat(5 - producto.rating);
            const ofertaBadge = producto.enOferta === "sí"
                ? `<div class="badge bg-danger text-white position-absolute top-0 end-0 m-2">🔥 En oferta</div>` : "";
            const precioHTML = producto.enOferta === "sí"
                ? `<span class="precio">
                        <span class="text-muted text-decoration-line-through">${producto.price}&nbsp;€</span>
                        <span class="fw-bold text-danger ms-2">${producto.offerPrice}&nbsp;€</span>
                    </span>` : `<span class="fw-bold precio">${producto.price}&nbsp;€</span>`;

            const $col = $(`
                    <div class="col producto-animado" data-category="${producto.category}">
                    <div class="card h-100 d-flex flex-column position-relative" role="article" aria-label="${producto.name}" style="max-width: 300px; margin: 0 auto;">${ofertaBadge} 
                        <img src="${producto.image.replace('..', '')}" class="card-img-top img-fluid" alt="Imagen de ${producto.name}" style="height: 130px; object-fit: cover;">
                        <div class="card-body d-flex flex-column" style="padding: 0.5rem;">
                            <h2 class="card-title fw-bold" style="font-size: 0.95rem; margin-bottom: 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${producto.name}
                            </h2>
                            <p class="card-text" style="font-size: 0.85rem; min-height: 75px; max-height: 75px; overflow-y: auto; margin-bottom: 2px; scrollbar-width: thin;">${producto.description}
                            </p>
                            <div class="espacio-inferior mt-auto d-flex flex-column gap-1">
                                <div class="precio fw-bold" aria-label="Precio del producto">${precioHTML}</div>
                                <p class="valoracion" style="font-size: 0.8rem; margin: 0;" aria-label="Valoración del producto">${estrellas}
                                </p>
                                <div class="d-flex gap-1 mt-2">
                                    <button class="btn btn-sm btn-primary flex-fill d-flex justify-content-center align-items-center agregar-carrito" data-id="${producto.id}" aria-label="Añadir ${producto.name} al carrito"><i class="bi bi-cart me-2"></i>Añadir</button>
                                    <a href="/pages/product-detail.html?productId=${producto.id}" class="btn btn-sm btn-outline-secondary flex-fill d-flex justify-content-center align-items-center boton-detalle" aria-label="Ver detalle del producto ${producto.name}"><i class="bi bi-eye "></i>Detalle</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                `);
            $contenedor.append($col);
            setTimeout(() => $col.addClass('visible'), 100 + i * 100);
        });

        $paginacion.removeClass('fade-in-paginacion').empty();
        for (let i = 1; i <= totalPaginas; i++) {
            const $btn = $(`<button class="btn btn-sm mx-1 btn-outline-primary ${i === paginaActual ? 'pagina-activa' : ''}">${i}</button>`);
            $btn.on('click', () => {
                paginaActual = i;
                mostrarResultados(productosFiltradosGlobal);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
            $paginacion.append($btn);
        }
        void $paginacion[0].offsetWidth;
        $paginacion.addClass('fade-in-paginacion');
    }

    // === FORMULARIO DE BÚSQUEDA Y RESTAURACIÓN ===
    if (esSearchPage) {
        const mantenerFiltros = localStorage.getItem('mantenerFiltros');
        if (mantenerFiltros === 'true') {
            const paginaGuardada = localStorage.getItem('paginaProducto');
            if (paginaGuardada) {
                const urlParams = new URLSearchParams(paginaGuardada.split('?')[1] || '');
                const q = urlParams.get('q') || '';
                const cat = urlParams.get('category') || '';
                $form.find('[name="q"]').val(q);
                $form.find('[name="category"]').val(cat);
                restaurarEstadoFiltros();
                buscarYMostrar(q, cat);
                $('#categorySelectMobile').val(cat).trigger('change');
                $('#categorySelect').val(cat).trigger('change');
            }
            localStorage.removeItem('mantenerFiltros');
        } else {
            const params = new URLSearchParams(window.location.search);
            const q = params.get('q') || '';
            const cat = params.get('category') || '';
            $form.find('[name="q"]').val(q);
            $form.find('[name="category"]').val(cat);
            buscarYMostrar(q, cat);
        }

        $form.on('submit', function (e) {
            e.preventDefault();
            const query = $(this).find('[name="q"]').val().trim();
            const category = $(this).find('[name="category"]').val();
            buscarYMostrar(query, category);

            const newUrl = `${window.location.pathname}?q=${encodeURIComponent(query)}&category=${encodeURIComponent(category)}`;
            window.history.replaceState(null, '', newUrl);
            localStorage.setItem('paginaProducto', newUrl);
        });
    }

    // Eventos de filtros dinámicos
// Eventos de filtros dinámicos (actualizado para guardar filtros)
$('#filtro-estrellas input[type="checkbox"]').on('change', function () {
    filtrarYOrdenar();
    guardarEstadoFiltros();
});

$precioMinInput.on('input', function () {
    $minValorSpan.text($(this).val());
    filtrarYOrdenar();
    guardarEstadoFiltros();
});

$precioMaxInput.on('input', function () {
    $maxValorSpan.text($(this).val());
    filtrarYOrdenar();
    guardarEstadoFiltros();
});

$ordenPrecioSelect.on('change', function () {
    filtrarYOrdenar();
    guardarEstadoFiltros();
});

$ordenValoracionSelect.on('change', function () {
    filtrarYOrdenar();
    guardarEstadoFiltros();
});

$ordenPrioridadSelect.on('change', function () {
    filtrarYOrdenar();
    guardarEstadoFiltros();
});

$checkboxOferta.on('change', function () {
    filtrarYOrdenar();
    guardarEstadoFiltros();
});

if ($selectorPaginacion.length) {
    $selectorPaginacion.on('change', function () {
        const valor = parseInt($(this).val());
        productosPorPagina = valor === 0 ? productosFiltradosGlobal.length : valor;
        paginaActual = 1;
        mostrarResultados(productosFiltradosGlobal);
        guardarEstadoFiltros();
    });
}


    // Antes de ir al detalle, guardar estado
    $contenedor.on('click', '.boton-detalle', function () {
        guardarEstadoFiltros();
        localStorage.setItem('mantenerFiltros', "true");
    });
    document.querySelector('a[aria-label="Ir al carrito"]')?.addEventListener('click', function () {
    if (window.location.pathname.endsWith('/search.html')) {
        guardarEstadoFiltros();
        localStorage.setItem('mantenerFiltros', "true");
    }
});

});
