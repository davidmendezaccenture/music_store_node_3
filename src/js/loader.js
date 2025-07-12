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
          '../js/products.js',
          '../js/category.js',
          '../js/glide.js',
          '../js/search.js'
        ];

        let index = 0;

        function loadNextScript() {
          if (index >= scripts.length) {
            // ✅ Mostrar cookies solo al final, cuando ya está todo cargado
            $.getScript('../js/cookies.js');
            document.body.style.opacity = "1";

            // ✅ Asegurar login UI
            /*
            if (typeof initLoginUI === 'function') initLoginUI();

            // ✅ Mostrar modal login si viene con ?showLogin=1
            /*
            if (typeof esperarYMostrarLoginModal === 'function' && window.location.search.includes('showLogin=1')) {
              setTimeout(() => {
                esperarYMostrarLoginModal();
                window.history.replaceState({}, document.title, window.location.pathname);
              }, 200);
            } */
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
    'search.html', 'registro.html', 'payment-methods.html','newsletter.html',
    'media.html', 'faq.html', 'contact.html', 'cart.html','politica-cookies.html',
    'privacy-policy.html'
  ];
  if (paginasConPrefooter.includes(paginaActual)) {
    $('#prefooter-container').load('../partials/prefooter.html');
  }

  // Guardar última página visitada (excepto product-detail.html)
  if (
  !window.location.pathname.includes('product-detail.html') &&
  !window.location.pathname.includes('cart.html')
) {
    localStorage.setItem('ultimaPagina', window.location.href);
  }
});
