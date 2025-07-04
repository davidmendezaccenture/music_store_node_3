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
    $.ajax({
      url: '/api/products',
      method: 'GET',
      dataType: 'json',
      success: function (data) {
        container.empty();
        const categoriaSeleccionada = categoriaMap[filtro];

        const productosFiltrados = data.filter(p => {
          if (categoriaSeleccionada === 'all') {
            return categoriasValidas.includes(p.category);
          }
          return p.category === categoriaSeleccionada;
        });

        productosFiltrados.forEach((producto, i) => {
          const estrellas = '★'.repeat(producto.rating) + '☆'.repeat(5 - producto.rating);
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
              <div class="card h-100 position-relative" role="article">
                ${ofertaBadge}
                <img src="${producto.image.replace('..', '')}" class="card-img-top" alt="${producto.name}">
                <div class="card-body d-flex flex-column">
                  <h2 class="card-title h5">${producto.name}</h2>
                  <p class="card-text">${producto.description}</p>
                  ${precioHTML}
                  <p class="valoracion" aria-label="Valoración del producto">${estrellas}</p>
                  <div class="mt-auto">
                    <button class="btn btn-primary agregar-carrito" data-id="${producto.id}">
                      Añadir a la cesta
                    </button>
                    <a href="/pages/product-detail.html?productId=${producto.id}" class="btn btn-outline-secondary mt-2 w-100">
                      Ver detalle
                    </a>
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
