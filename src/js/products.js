$(document).ready(function () {
  const container = $('#productosContainer');
  const paginaActual = window.location.pathname.split('/').pop();

  const categoriasPorPagina = {
    'guitar.html': ['acoustic-guitars', 'classical-guitars', 'electric-guitars', 'basses'],
    'drums.html': ['acoustic-drums', 'electronic-drums', 'set-platillos'],
    'keyboard.html': ['keyboards', 'synthesizers']
  };

  const categoriasValidas = categoriasPorPagina[paginaActual] || [];

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

  let currentAudio = null;

  function mostrarProductos(filtro = "Todas") {
    const categoriaSeleccionada = categoriaMap[filtro];
    const categoriaQuery = (categoriaSeleccionada === 'all') ? '' : categoriaSeleccionada;

    const alturaActual = container.height();
    container.css('min-height', `${alturaActual}px`);

    $.ajax({
      url: '/buscar',
      method: 'GET',
      dataType: 'json',
      data: {
        q: '',
        category: categoriaQuery
      },
      success: function (data) {
        container.empty();

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

          const audioControls = producto.audioClip ? `
            <div class="audio-controls d-flex gap-2 mt-2">
              <button class="btn btn-outline-primary btn-sm play-audio" data-audio="${producto.audioClip}" aria-label="Reproducir clip de ${producto.name}">
                <i class="bi bi-play-fill"></i>
              </button>
              <button class="btn btn-outline-secondary btn-sm stop-audio" aria-label="Detener clip de ${producto.name}">
                <i class="bi bi-stop-fill"></i>
              </button>
            </div>
          ` : '';

          const $col = $(`
            <div class="col producto-animado" data-category="${producto.category}">
                  <div class="card h-100 d-flex flex-column position-relative" role="article" aria-label="${producto.name}" style="max-width: 300px; margin: 0 auto;">
                      ${ofertaBadge}
                      <button class="btn btn-sm btn-outline-danger position-absolute top-0 start-0 m-2 p-1 add-to-favorites" 
                              data-product-id="${producto.id}"
                              data-product-name="${producto.name}"
                              data-product-price="${producto.enOferta === "sí" ? producto.offerPrice : producto.price}"
                              data-product-image="${producto.image.replace('..', '')}"
                              aria-label="Añadir a favoritos">
                          <i class="bi bi-heart${isInFavorites(producto.id) ? '-fill' : ''}"></i>
                      </button>
                      <img src="${producto.image.replace('..', '')}" class="card-img-top img-fluid" alt="Imagen de ${producto.name}" style="height: 130px; object-fit: cover;">
                      <div class="card-body d-flex flex-column" style="padding: 0.5rem;">
                          <h2 class="card-title fw-bold" style="font-size: 0.95rem; margin-bottom: 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${producto.name}</h2>
                          <p class="card-text" style="font-size: 0.85rem; min-height: 75px; max-height: 75px; overflow-y: auto; margin-bottom: 2px; scrollbar-width: thin;">${producto.description}</p>
                          <div class="espacio-inferior mt-auto d-flex flex-column gap-1">
                              <div class="precio fw-bold" aria-label="Precio del producto">${precioHTML}</div>
                              <p class="valoracion" style="font-size: 0.8rem; margin: 0;" aria-label="Valoración del producto">${estrellas}</p>
                              ${audioControls}
                              <div class="d-flex gap-1 mt-2">
                                  <button class="btn btn-sm btn-primary flex-fill d-flex justify-content-center align-items-center agregar-carrito" data-id="${producto.id}" aria-label="Añadir ${producto.name} al carrito"><i class="bi bi-cart me-2"></i>Añadir</button>
                                  <a href="/pages/product-detail.html?productId=${producto.id}" class="btn btn-sm btn-outline-secondary flex-fill d-flex justify-content-center align-items-center boton-detalle" aria-label="Ver detalle del producto ${producto.name}"><i class="bi bi-eye"></i>Detalle</a>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          `);

          container.append($col);
          setTimeout(() => $col.addClass('visible'), 100 + i * 100);
          setTimeout(() => {
          $(productosContainer).css('min-height', '');
}, 300); // 
        });
      },
      error: function (xhr, status, error) {
        console.error("Error al cargar productos:", error);
        container.html('<p class="text-danger">No se pudieron cargar los productos.</p>');
      }
    });
  }

  // Eventos para reproducir o detener clips de audio
  $(document).on('click', '.play-audio', function () {
    const audioSrc = $(this).data('audio');
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }
    currentAudio = new Audio(audioSrc);
    currentAudio.play();
  });

  $(document).on('click', '.stop-audio', function () {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }
  });

  mostrarProductos();

  $('#categoria').on('change', function () {
    const filtro = $(this).val();
    mostrarProductos(filtro);
  });
  // Función para verificar si un producto está en favoritos
    function isInFavorites(productId) {
        const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        return favorites.some(item => item.id === productId);
    }

    // Manejador de clic para favoritos
    $(document).on('click', '.add-to-favorites', function() {
        const $btn = $(this);
        const productId = $btn.data('product-id');
        const productName = $btn.data('product-name');
        const productPrice = $btn.data('product-price');
        const productImage = $btn.data('product-image');
        
        const wasAdded = addToFavorites(productId, productName, productPrice, productImage);
        $btn.find('i').toggleClass('bi-heart bi-heart-fill');
        showFavoriteNotification(wasAdded);
    });

    function showFavoriteNotification(added) {
        const toast = $(`
            <div class="position-fixed bottom-0 end-0 p-3" style="z-index: 1100">
                <div class="toast align-items-center text-white ${added ? 'bg-success' : 'bg-danger'} border-0 show" role="alert" aria-live="assertive" aria-atomic="true">
                    <div class="d-flex">
                        <div class="toast-body">
                            ${added ? 'Añadido a favoritos' : 'Eliminado de favoritos'}
                        </div>
                        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
                    </div>
                </div>
            </div>
        `);
        
        $('body').append(toast);
        setTimeout(() => toast.remove(), 2000);
    }
});
