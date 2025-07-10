$(document).ready(function () {
  const container = $('#productosContainer');
  const paginaActual = window.location.pathname.split('/').pop();

  // Categorías permitidas por página
  const categoriasPorPagina = {
    'guitar.html': ['acoustic-guitars', 'classical-guitars', 'electric-guitars', 'basses'],
    'drums.html': ['acoustic-drums', 'electronic-drums', 'set-platillos'],
    'keyboard.html': ['keyboards', 'synthesizers']
  };

  // Categorías válidas para esta página
  const categoriasValidas = categoriasPorPagina[paginaActual] || [];

  // Mapeo de filtros según página actual
  const mapasPorPagina = {
    'guitar.html': {
      "Acústica": "acoustic-guitars",
      "Clásica": "classical-guitars",
      "Eléctrica": "electric-guitars",
      "Bajos": "basses",
      "Todas": "all"
    },
    'drums.html': {
      "Acústicas": "acoustic-drums",
      "Eléctricas": "electronic-drums",
      "Platillos": "set-platillos",
      "Todas": "all"
    },
    'keyboard.html': {
      "Teclados": "keyboards",
      "Sintetizadores": "synthesizers",
      "Todas": "all"
    }
  };

  const categoriaMap = mapasPorPagina[paginaActual] || {};

  // Mostrar productos según filtro
  function mostrarProductos(filtro = "Todas") {
    // Obtenemos la categoría para el filtro
    const categoriaSeleccionada = categoriaMap[filtro];

    // Para "Todas" o "all", enviamos categoría vacía para que el backend no filtre por categoría
    const categoriaQuery = (categoriaSeleccionada === 'all') ? '' : categoriaSeleccionada;

    $.ajax({
      url: '/buscar',
      method: 'GET',
      dataType: 'json',
      data: {
        q: '', // si quieres que haya búsqueda por texto, ajusta aquí
        category: categoriaQuery
      },
      success: function (data) {
        container.empty();

        // Aquí filtramos localmente por las categorías válidas para la página, en caso que backend no filtre
        const productosFiltrados = data.filter(p => {
          if (categoriaSeleccionada === 'all' || categoriaSeleccionada === '') {
            return categoriasValidas.includes(p.category);
          }
          return p.category === categoriaSeleccionada;
        });

        productosFiltrados.forEach((producto, i) => {
          const rating = producto.rating !== undefined ? producto.rating : 0;
          const estrellas = '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
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
                    <div class="card h-100 d-flex flex-column position-relative" role="article aria-label="${producto.name}">${ofertaBadge} 
                        <img src="${producto.image.replace('..', '')}" class="card-img-top img-fluid" alt="Imagen de ${producto.name}" style="height: 130px; object-fit: cover;">
                        <div class="card-body d-flex flex-column" style="padding: 0.5rem;">
                            <h2 class="card-title" style="font-size: 0.95rem; margin-bottom: 0.3rem; min-height: 2.5em; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${producto.name}
                            </h2>
                            <p class="card-text" style="font-size: 0.85rem; min-height: 60px; max-height: 60px; overflow-y: auto; margin-bottom: 0.5rem; scrollbar-width: thin;">${producto.description}
                            </p>
                            <div class="espacio-inferior mt-auto d-flex flex-column gap-1">
                                <div class="precio fw-bold" aria-label="Precio del producto">${precioHTML}</div>
                                <p class="valoracion" style="font-size: 0.8rem; margin: 0;" aria-label="Valoración del producto">${estrellas}
                                </p>
                                <div class="d-flex gap-1 mt-2">
                                    <button class="btn btn-sm btn-primary flex-fill agregar-carrito" data-id="${producto.id}" aria-label="Añadir ${producto.name} al carrito">Añadir</button>
                                    <a href="/pages/product-detail.html?productId=${producto.id}" class="btn btn-sm btn-outline-secondary flex-fill d-flex justify-content-center align-items-center boton-detalle" aria-label="Ver detalle del producto ${producto.name}">Detalle</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

          `);

          container.append($col);
          setTimeout(() => $col.addClass('visible'), 100 + i * 100); // animación progresiva
        });
      },
      error: function (xhr, status, error) {
        console.error("Error al cargar productos:", error);
        container.html('<p class="text-danger">No se pudieron cargar los productos.</p>');
      }
    });
  }

  // Carga inicial de productos al abrir la página
  mostrarProductos();

  // Al cambiar filtro de categoría
  $('#categoria').on('change', function () {
    const filtro = $(this).val();
    mostrarProductos(filtro);
  });

});
