document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form-busqueda');
    const esSearchPage = window.location.pathname.endsWith('search.html');
    const precioMinInput = document.getElementById('precio-min');
    const precioMaxInput = document.getElementById('precio-max');
    const ordenPrecioSelect = document.getElementById('orden-precio');
    const ordenValoracionSelect = document.getElementById('orden-valoracion');
    const checkboxOferta = document.getElementById('checkbox-oferta');
    let productosFiltradosGlobal = [];
    let paginaActual = 1;
    let productosPorPagina = 6;

    //Para seleccionar productos por página
    const selectorPaginacion = document.getElementById('selector-paginacion');
if (selectorPaginacion) {
    selectorPaginacion.addEventListener('change', () => {
        const valor = parseInt(selectorPaginacion.value);
        productosPorPagina = valor === 0 ? productosFiltradosGlobal.length : valor;
        paginaActual = 1;
        mostrarResultados(productosFiltradosGlobal);
    });
}



    //Para obtener los productos resultados de la búsqueda
function buscarYMostrar(query, category) {
    fetch(`/buscar?q=${encodeURIComponent(query)}&category=${encodeURIComponent(category)}`)
        .then(res => res.json())
        .then(productos => {
            const estrellasSeleccionadas = obtenerEstrellasSeleccionadas();
            const minPrecio = parseFloat(precioMinInput.value);
            const maxPrecio = parseFloat(precioMaxInput.value);
            const soloEnOferta = checkboxOferta.checked;

            let productosFiltrados = productos.filter(producto => {
                const ratingOk = estrellasSeleccionadas.length === 0 || estrellasSeleccionadas.includes(producto.rating);
                const precio = producto.offerPrice ?? producto.price;
                const precioOk = precio >= minPrecio && precio <= maxPrecio;
                const ofertaOk = !soloEnOferta || producto.enOferta === "sí";
                return ratingOk && precioOk && ofertaOk;
            });

            // 💡 AÑADIR ORDENAMIENTO
            productosFiltrados.sort((a, b) => {
                const precioA = a.enOferta === 'sí' ? Number(a.offerPrice) : Number(a.price);
                const precioB = b.enOferta === 'sí' ? Number(b.offerPrice) : Number(b.price);
                const pA = isNaN(precioA) ? 0 : precioA;
                const pB = isNaN(precioB) ? 0 : precioB;

                let ordenPrecio = 0;
                if (ordenPrecioSelect.value === 'asc') {
                    ordenPrecio = pA - pB;
                } else {
                    ordenPrecio = pB - pA;
                }

                if (ordenPrecio !== 0) return ordenPrecio;

                if (ordenValoracionSelect.value === 'asc') {
                    return a.rating - b.rating;
                } else {
                    return b.rating - a.rating;
                }
            });

            mostrarResultados(productosFiltrados);
        })
        .catch(err => console.error('Error al obtener productos:', err));
}
    //Para obtener las estrellas que hemos marcado como filtro
    function obtenerEstrellasSeleccionadas() {
        const checkboxes = document.querySelectorAll('#filtro-estrellas input[type="checkbox"]');
        return Array.from(checkboxes)
            .filter(cb => cb.checked)
            .map(cb => parseInt(cb.value));
    }
    //Para mostrar los resultados de la búsqueda
    function mostrarResultados(productos) {
    productosFiltradosGlobal = productos; // Guardamos para usar en paginación
    const contenedor = document.getElementById('resultados');
    const paginacion = document.getElementById('paginacion');
    if (!contenedor || !paginacion) return;

    contenedor.innerHTML = '';
    paginacion.innerHTML = '';

    if (productos.length === 0) {
        contenedor.innerHTML = `
            <div class="no-encontrado" role="alert" aria-live="polite" style="text-align:center; padding: 2rem;">
                <img src="../assets/images/sin-datos.gif" alt="Lupa buscando archivo" style="width:64px; height:64px; display:block; margin:0 auto 1rem auto;">
                <p>No se encontraron productos.</p>
                <p>Prueba a cambiar los filtros o los términos de búsqueda.</p>
            </div>`;
        return;
    }

    const totalPaginas = Math.ceil(productos.length / productosPorPagina);
    const inicio = (paginaActual - 1) * productosPorPagina;
    const fin = inicio + productosPorPagina;
    const productosPagina = productos.slice(inicio, fin);

    productosPagina.forEach(producto => {
        const col = document.createElement('div');
        col.className = 'col producto-animado';
        col.setAttribute('data-category', producto.category);
        const estrellas = '★'.repeat(producto.rating) + '☆'.repeat(5 - producto.rating);

        col.innerHTML = `
            <div class="card h-100 position-relative" role="article">
                ${producto.enOferta === "sí"
                    ? `<div class="badge bg-danger text-white position-absolute top-0 end-0 m-2 shadow-sm" style="z-index: 1;">🔥 En oferta</div>`
                    : ""
                }
                <img src="${producto.image.replace('..', '')}" class="card-img-top" alt="${producto.name}">
                <div class="card-body">
                        <h2 class="card-title h5">${producto.name}</h2>
                        <p class="card-text">${producto.description}</p>
                        ${
                            producto.enOferta === "sí"
                            ? `<span class="precio">
                                    <span class="text-muted text-decoration-line-through">${producto.price}&nbsp;€</span>
                                    <span class="fw-bold text-danger ms-2">${producto.offerPrice}&nbsp;€</span>
                                </span>`
                            : `<span class="fw-bold precio">${producto.price}&nbsp;€</span>`
                        }
                        <p class="valoracion" aria-label="Valoración del producto">
                            ${estrellas}
                        </p>
                    <div class="mt-auto">
                        <button class="btn btn-primary agregar-carrito" aria-label="Añadir ${producto.name} a la cesta" data-id="${producto.id}">
                            Añadir a la cesta
                        </button>
                    </div>
                </div>
            </div>
        `;
        contenedor.appendChild(col);
        setTimeout(() => {
            void col.offsetWidth;
            col.classList.add('visible');
        }, 10);
    });

    for (let i = 1; i <= totalPaginas; i++) {
        const btn = document.createElement('button');
        btn.textContent = i;
        btn.className = `btn btn-sm ${i === paginaActual ? 'btn-primary' : 'btn-outline-primary'} mx-1`;
        btn.addEventListener('click', () => {
            paginaActual = i;
            mostrarResultados(productosFiltradosGlobal);
            window.scrollTo({ top: 0, behavior: 'smooth' });

        });
        paginacion.appendChild(btn);
    }
}

    if (esSearchPage) {
        form.addEventListener('submit', e => {
            e.preventDefault();
            const query = form.q.value.trim();
            const category = form.category.value;
            buscarYMostrar(query, category);
            const newUrl = `${window.location.pathname}?q=${encodeURIComponent(query)}&category=${encodeURIComponent(category)}`;
            window.history.replaceState(null, '', newUrl);
            localStorage.setItem('ultimaPagina', newUrl);
        });

        const params = new URLSearchParams(window.location.search);
        const q = params.get('q') || '';
        const cat = params.get('category') || '';
        form.q.value = q;
        form.category.value = cat;
        buscarYMostrar(q, cat);
    }

    const estrellaCheckboxes = document.querySelectorAll('#filtro-estrellas input[type="checkbox"]');
    estrellaCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            const query = form.q.value.trim();
            const category = form.category.value;
            buscarYMostrar(query, category);
        });
    });

    precioMinInput.addEventListener('input', actualizarYFiltrar);
    precioMaxInput.addEventListener('input', actualizarYFiltrar);

    ordenPrecioSelect.addEventListener('change', () => {
        const query = form.q.value.trim();
        const category = form.category.value;
        buscarYMostrar(query, category);
    });

    ordenValoracionSelect.addEventListener('change', () => {
        const query = form.q.value.trim();
        const category = form.category.value;
        buscarYMostrar(query, category);
    });

    // Nuevo: al cambiar el checkbox de oferta
    checkboxOferta.addEventListener('change', () => {
        const query = form.q.value.trim();
        const category = form.category.value;
        buscarYMostrar(query, category);
    });

    function actualizarYFiltrar() {
        document.getElementById('min-valor').textContent = precioMinInput.value;
        document.getElementById('max-valor').textContent = precioMaxInput.value;
        const query = form.q.value.trim();
        const category = form.category.value;
        buscarYMostrar(query, category);
    }


});
