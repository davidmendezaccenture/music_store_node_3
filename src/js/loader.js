$(function () {
  // Cargar HEADER
  $('#header-container').load('../partials/header.html');

  // === Cargar MODALES SOLO si la página no es 'registro.html' ===
  const paginaActual = window.location.pathname.split('/').pop();

  $('#modals-container').load('../partials/modals.html', function () {
    // ✅ Cargar Bootstrap (una vez cargados los modales)
    const bsScript = document.createElement('script');
    bsScript.src = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js';

    bsScript.onload = function () {
      // Scripts personalizados a cargar en secuencia
      const scripts = [
        '../js/utils.js',
        '../js/auth.js',
        '../js/cart.js',
        '../js/app.js',
        '../js/login-ui.js',
        '../js/index.js',
        '../js/favorites.js',
        '../js/products.js',
        '../js/category.js',
        '../js/search.js'
      ];

      let index = 0;

      function loadNextScript() {
        if (index >= scripts.length) {
          // ✅ Cargar cookies.js y luego ejecutar su función global cuando ya está todo en el DOM
          $.getScript('../js/cookies.js', function () {
            if (typeof window.inicializarModalCookies === 'function') {
              window.inicializarModalCookies();
            }
          });

          // ✅ Mostrar página (después de cargar todo)
          document.body.style.opacity = '1';
          return;
        }

        const script = document.createElement('script');
        script.src = scripts[index];
        script.onload = loadNextScript;
        document.body.appendChild(script);
        index++;
      }

      loadNextScript();
    };

    document.body.appendChild(bsScript);
  });

  // Cargar FOOTER (fuera del callback modales para que cargue en paralelo)
  $('#footer-container').load('../partials/footer.html');

  // Cargar PREFOOTER si corresponde (según página actual)
  const paginasConPrefooter = [
    'index.html', 'guitar.html', 'keyboard.html', 'drums.html',
    'product-detail.html', 'services.html', 'sobre_nosotros.html',
    'search.html', 'registro.html', 'payment-methods.html', 'newsletter.html',
    'media.html', 'faq.html', 'contact.html', 'cart.html', 'politica-cookies.html',
    'privacy-policy.html', 'blog.html', 'clasificados.html', 'devoluciones.html', 'favorites.html',
    'shipping.html', 'terms.html', 'garantia.html', 'legal.html'
  ];
  if (paginasConPrefooter.includes(paginaActual)) {
    $('#prefooter-container').load('../partials/prefooter.html');
  }

  // Guardar última página visitada (excepto en ciertas páginas)
  if (
    !window.location.pathname.includes('product-detail.html') &&
    !window.location.pathname.includes('registro.html')
  ) {
    localStorage.setItem('ultimaPagina', window.location.href);
  }

  // Guardar referencia a última página de productos visitada
  if (
    window.location.pathname.includes('search.html') ||
    window.location.pathname.includes('guitar.html') ||
    window.location.pathname.includes('drums.html') ||
    window.location.pathname.includes('keyboard.html') ||
    window.location.pathname.includes('index.html')
  ) {
    localStorage.setItem('paginaProducto', window.location.href);
  }
  // Para cargar favoritos

});