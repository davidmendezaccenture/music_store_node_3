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

  // 🔧 Mostrar productos según filtro
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

        productosFiltrados.forEach(producto => {
          const card = `
            <div class="col">
              <div class="card h-100 shadow-sm">
                <img src="${producto.image}" class="card-img-top" alt="${producto.name}">
                <div class="card-body">
                  <h5 class="card-title">${producto.name}</h5>
                  <p class="card-text">${producto.description}</p>
                  <p class="card-text fw-bold text-success">${producto.offerPrice}€ 
                    <span class="text-muted text-decoration-line-through fs-6">${producto.price}€</span>
                  </p>
                  <button class="btn btn-primary w-100 add-to-cart" data-id="${producto.id}">
                    <i class="bi bi-cart-plus"></i> Añadir al carrito
                  </button>
                </div>
              </div>
            </div>`;
          container.append(card);
        });
      },
      error: function (xhr, status, error) {
        console.error("Error al cargar productos:", error);
        container.html('<p class="text-danger">No se pudieron cargar los productos.</p>');
      }
    });
  }

  // Inicial
  mostrarProductos();

  // Al cambiar filtro
  $('#categoria').on('change', function () {
    const filtro = $(this).val();
    mostrarProductos(filtro);
  });

  // Añadir al carrito
  container.on('click', '.add-to-cart', function () {
    const id = $(this).data('id');
    addToCart(id);
    const toast = new bootstrap.Toast($('#toastAdd'));
    toast.show();
  });
});
