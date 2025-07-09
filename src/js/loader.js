$(function () {
  // Paso 1: Cargar header
  $('#header-container').load('../partials/header.html', function () {
    // Paso 2: Cargar modales (login, cookies, etc.)
    $('#modals-container').load('../partials/modals.html', function () {
      // Paso 3: Cargar Bootstrap
      const bsScript = document.createElement('script');
      bsScript.src = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js';
      bsScript.onload = function () {
        // Paso 4: Cargar scripts personalizados secuencialmente
        const scripts = [
          '../js/auth.js',
          '../js/cart.js',
          '../js/app.js',
          '../js/login-ui.js',
          '../js/index.js',
          '../js/products.js',
          '../js/category.js'
        ];

        let i = 0;

        function cargarScript() {
          if (i >= scripts.length) {
            // Paso 5: Ejecutar login y otros inicializadores
            if (typeof initLoginUI === 'function') {
              initLoginUI();
            }
            if (typeof initCookieBanner === 'function') {
              initCookieBanner(); // Si más adelante haces uno para cookies
            }
            return;
          }

          const s = document.createElement('script');
          s.src = scripts[i];
          s.onload = cargarScript;
          document.body.appendChild(s);
          i++;
        }

        cargarScript();
      };
      document.body.appendChild(bsScript);
    });

    // Paso 6: Cargar footer y prefooter
    $('#footer-container').load('../partials/footer.html');

    const paginasConPrefooter = [
      'index.html', 'guitar.html', 'keyboard.html', 'drums.html',
      'product-detail.html', 'services.html'
    ];
    const paginaActual = window.location.pathname.split('/').pop();
    if (paginasConPrefooter.includes(paginaActual)) {
      $('#prefooter-container').load('../partials/prefooter.html');
    }

    // Paso 7: Guardar página actual
    localStorage.setItem('ultimaPagina', window.location.pathname);
  });
});
