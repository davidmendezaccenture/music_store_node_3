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

    let productosFiltradosGlobal = [];
    let paginaActual = 1;
    let productosPorPagina = 6;

    if ($selectorPaginacion.length) {
        $selectorPaginacion.on('change', function () {
            const valor = parseInt($(this).val());
            productosPorPagina = valor === 0 ? productosFiltradosGlobal.length : valor;
            paginaActual = 1;
            mostrarResultados(productosFiltradosGlobal);
        });
    }

    function buscarYMostrar(query, category) {
        $.getJSON(`/buscar`, { q: query, category: category })
            .done(function (productos) {
                const estrellasSeleccionadas = obtenerEstrellasSeleccionadas();
                const minPrecio = parseFloat($precioMinInput.val());
                const maxPrecio = parseFloat($precioMaxInput.val());
                const soloEnOferta = $checkboxOferta.is(':checked');

                let productosFiltrados = productos.filter(producto => {
                    const ratingOk = estrellasSeleccionadas.length === 0 || estrellasSeleccionadas.includes(producto.rating);
                    const precio = producto.offerPrice ?? producto.price;
                    const precioOk = precio >= minPrecio && precio <= maxPrecio;
                    const ofertaOk = !soloEnOferta || producto.enOferta === "sí";
                    return ratingOk && precioOk && ofertaOk;
                });

                productosFiltrados.sort((a, b) => {
                    
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

                mostrarResultados(productosFiltrados);
            })
            .fail(function (err) {
                console.error('Error al obtener productos:', err);
            });
    }

    function obtenerEstrellasSeleccionadas() {
        return $('#filtro-estrellas input[type="checkbox"]:checked')
            .map(function () {
                return parseInt(this.value);
            }).get();
    }

    function mostrarResultados(productos) {
        productosFiltradosGlobal = productos;
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
                ? `<div class="badge bg-danger text-white position-absolute top-0 end-0 m-2">🔥 En oferta</div>`
                : "";
            const precioHTML = producto.enOferta === "sí"
                ? `<span class="precio">
                        <span class="text-muted text-decoration-line-through">${producto.price}&nbsp;€</span>
                        <span class="fw-bold text-danger ms-2">${producto.offerPrice}&nbsp;€</span>
                    </span>`
                : `<span class="fw-bold precio">${producto.price}&nbsp;€</span>`;

            const $col = $(`
                <div class="col producto-animado" data-category="${producto.category}">
                    <div class="card-product d-flex flex-column position-relative" role="article aria-label="${producto.name}">${ofertaBadge} 
                        <img src="${producto.image.replace('..', '')}" class="card-img-top img-fluid" alt="Imagen de ${producto.name}" style="height: 130px; object-fit: cover;">
                        <div class="card-body d-flex flex-column" style="padding: 0.5rem;">
                            <h2 class="card-title" style="font-size: 0.95rem; margin-bottom: 0.3rem; min-height: 2.5em; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${producto.name}
                            </h2>
                            <p class="card-text">${producto.description}
                            </p>
                            <div class="espacio-inferior mt-auto d-flex flex-column gap-1">
                                <div class="precio fw-bold" aria-label="Precio del producto">${precioHTML}</div>
                                <p class="valoracion" style="font-size: 0.8rem; margin: 0;" aria-label="Valoración del producto">${estrellas}
                                </p>
                                <div class="d-flex gap-1 mt-2">
                                    <button class="btn btn-sm btn-primary agregar-carrito" data-id="${producto.id}" aria-label="Añadir ${producto.name} al carrito">Añadir</button>
                                    <a href="/pages/product-detail.html?productId=${producto.id}" class="btn btn-sm btn-outline-secondary d-flex justify-content-center align-items-center boton-detalle" aria-label="Ver detalle del producto ${producto.name}">Detalle</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `);
            $contenedor.append($col);
            setTimeout(() => $col.addClass('visible'), 100 + i * 100); // animación progresiva
        });

        for (let i = 1; i <= totalPaginas; i++) {
            const $btn = $(`<button class="btn btn-sm mx-1 btn-outline-primary ${i === paginaActual ? 'pagina-activa' : ''}">${i}</button>`);
            $btn.on('click', () => {
                paginaActual = i;
                mostrarResultados(productosFiltradosGlobal);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
            $paginacion.append($btn);
        }
    }

    if (esSearchPage) {
        $form.on('submit', function (e) {
            e.preventDefault();
    const query = $(this).find('[name="q"]').val().trim();
    const category = $(this).find('[name="category"]').val();
            buscarYMostrar(query, category);

            const newUrl = `${window.location.pathname}?q=${encodeURIComponent(query)}&category=${encodeURIComponent(category)}`;
            window.history.replaceState(null, '', newUrl);
            localStorage.setItem('ultimaPagina', newUrl);
        });

        const params = new URLSearchParams(window.location.search);
        const q = params.get('q') || '';
        const cat = params.get('category') || '';
        $form.find('[name="q"]').val(q);
        $form.find('[name="category"]').val(cat);
        buscarYMostrar(q, cat);
    }

    $('#filtro-estrellas input[type="checkbox"]').on('change', () => {
        const query = $form.find('[name="q"]').val().trim();
        const category = $form.find('[name="category"]').val();
        buscarYMostrar(query, category);
    });

    $precioMinInput.on('input', actualizarYFiltrar);
    $precioMaxInput.on('input', actualizarYFiltrar);
    $ordenPrecioSelect.on('change', actualizarYFiltrar);
    $ordenValoracionSelect.on('change', actualizarYFiltrar);
    $ordenPrioridadSelect.on('change', actualizarYFiltrar);
    $checkboxOferta.on('change', actualizarYFiltrar);

    function actualizarYFiltrar() {
        $('#min-valor').text($precioMinInput.val());
        $('#max-valor').text($precioMaxInput.val());
        const query = $form.find('[name="q"]').val().trim();
        const category = $form.find('[name="category"]').val();
        buscarYMostrar(query, category);
    }
});
