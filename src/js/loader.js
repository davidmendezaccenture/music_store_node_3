$(function () {
  // Cargar HEADER
  $('#header-container').load('../partials/header.html');

  // Cargar MODALES y luego scripts en orden
  $('#modals-container').load('../partials/modals.html', function () {
    // Cargar Bootstrap
    const bsScript = document.createElement('script');
    bsScript.src = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js';
    bsScript.onload = function () {
      // Scripts personalizados a cargar en secuencia
      const scripts = [
        '../js/auth.js',
        '../js/cart.js',
        '../js/app.js',
        '../js/login-ui.js',
        '../js/index.js',
        '../js/products.js',
        '../js/category.js'
      ];

      let index = 0;

      function loadNextScript() {
        if (index >= scripts.length) {
          // Al final, aseguramos que initLoginUI se llame (por si acaso)
          if (typeof initLoginUI === 'function') initLoginUI();

          // Mostrar modal login si viene en URL
          if (typeof esperarYMostrarLoginModal === 'function' && window.location.search.includes('showLogin=1')) {
            esperarYMostrarLoginModal();
            window.history.replaceState({}, document.title, window.location.pathname);
          }
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

  // Cargar FOOTER (fuera del callback modales para que sea paralelo)
  $('#footer-container').load('../partials/footer.html');

  // Cargar prefooter si corresponde
  const paginasConPrefooter = [
    'index.html', 'guitar.html', 'keyboard.html', 'drums.html',
    'product-detail.html', 'services.html'
  ];
  const paginaActual = window.location.pathname.split('/').pop();
  if (paginasConPrefooter.includes(paginaActual)) {
    $('#prefooter-container').load('../partials/prefooter.html');
  }

  // Guardar última página visitada
  localStorage.setItem('ultimaPagina', window.location.pathname);
});
