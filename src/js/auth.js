//auth.js
$(document).ready(function () {

  // === LOGIN desde el modal ===
  $('#modals-container').on('submit', '#form-login', function (e) {
    e.preventDefault();

    const username = $('#login-username').val();
    const password = $('#login-password').val();

    if (!username || !password) {
      alert('Por favor, completa todos los campos');
      return;
    }

    const body = { username, password };
    let carritoInvitado = [];
    let carritoUsuario = [];

    // Obtener el carrito del invitado
    fetch('/api/cart?user=guest')
      .then(res => {
        if (!res.ok) throw new Error('Error al obtener el carrito del invitado');
        return res.json();
      })
      .then(data => {
        carritoInvitado = data;

        // Vaciar carrito invitado en backend
        return fetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user: 'guest', items: [] })
        });
      })
      .then(() => {
        // Enviar login
        return fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
      })
      .then(res => {
        if (!res.ok) throw new Error('Usuario o contraseña incorrectos');
        return res.json();
      })
      .then(data => {
        const usuario = data.user.username;

        // --- NUEVO: copiar aceptación de cookies de invitado a usuario ---
        const invitadoAcepto = localStorage.getItem('cookies_accepted_guest');
        if (invitadoAcepto === 'true') {
          localStorage.setItem(`cookies_accepted_${usuario}`, 'true');
        }
        // --- FIN NUEVO ---

        localStorage.setItem('usuario', usuario);

        // Obtener carrito del usuario
        return fetch(`/api/cart?user=${usuario}`)
          .then(res => {
            if (!res.ok) throw new Error('Error al obtener el carrito del usuario');
            return res.json();
          })
          .then(data => {
            carritoUsuario = data;
            const carritoFinal = unificarCarritos(carritoUsuario, carritoInvitado);
            actualizarContadorCarrito(calcularTotalItems(carritoFinal));

            // Guardar carrito unificado
            return fetch('/api/cart', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ user: usuario, items: carritoFinal })
            }).then(() => {
              carrito = carritoFinal;

              // ✅ CERRAR MODAL DE LOGIN
              const loginModalEl = document.getElementById('loginModal');
              if (loginModalEl) {
                const loginModal = bootstrap.Modal.getInstance(loginModalEl) || new bootstrap.Modal(loginModalEl);
                loginModal.hide();
              }

              // ✅ Mostrar bienvenida
              mostrarModalBienvenida(`Bienvenido ${usuario}`);

              // ✅ Actualizar UI de login/logout
              if (typeof initLoginUI === 'function') initLoginUI();
            });
          });
      })
      .catch(err => {
        console.error("Error en el proceso de login o carrito:", err);
        const loginErrorModalEl = document.getElementById('loginErrorModal');
        if (loginErrorModalEl) {
          const loginErrorModal = new bootstrap.Modal(loginErrorModalEl);
          loginErrorModal.show();
        }
      });

    // Función para unificar los carritos
    function unificarCarritos(carritoUsuario, carritoInvitado) {
      const mapa = new Map();

      carritoUsuario.forEach(item => {
        mapa.set(item.id, { ...item });
      });

      carritoInvitado.forEach(item => {
        if (mapa.has(item.id)) {
          mapa.get(item.id).cantidad += item.cantidad;
        } else {
          mapa.set(item.id, { ...item });
        }
      });

      return Array.from(mapa.values());
    }
  });

  // === REGISTRO ===
  $('#form-registro').submit(function (e) {
    e.preventDefault();

    const nuevoUsuario = {
      username: $('#username').val().trim(),
      email: $('#email').val().trim(),
      birthdate: $('#birthdate').val(),
      phone: $('#phone').val().trim(),
      postalcode: $('#postalcode').val().trim(),
      city: $('#city').val().trim(),
      password: $('#password').val()
    };

    const confirmPassword = $('#confirmPassword').val();

    if (!nuevoUsuario.username || !nuevoUsuario.email || !nuevoUsuario.birthdate ||
      !nuevoUsuario.phone || !nuevoUsuario.postalcode || !nuevoUsuario.city || !nuevoUsuario.password) {
      alert('Por favor, completa todos los campos');
      return;
    }

    if (!validarUsername(nuevoUsuario.username)) {
      alert('El nombre de usuario debe tener entre 3 y 20 caracteres, y solo letras, números, guiones o guiones bajos.');
      return;
    }

    if (!validarEmail(nuevoUsuario.email)) {
      alert('El email no tiene un formato válido.');
      return;
    }

    if (!/\d{4}-\d{2}-\d{2}/.test(nuevoUsuario.birthdate)) {
      alert('La fecha de nacimiento no es válida.');
      return;
    }

    if (!/^\d{9}$/.test(nuevoUsuario.phone)) {
      alert('El teléfono debe tener 9 dígitos.');
      return;
    }

    if (!/^\d{5}$/.test(nuevoUsuario.postalcode)) {
      alert('El código postal debe tener 5 dígitos.');
      return;
    }

    if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{2,40}$/.test(nuevoUsuario.city)) {
      alert('La ciudad debe tener entre 2 y 40 letras.');
      return;
    }

    if (!validarPassword(nuevoUsuario.password)) {
      alert('La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número.');
      return;
    }

    if (!compararPasswords(nuevoUsuario.password, confirmPassword)) {
      alert('Las contraseñas no coinciden.');
      return;
    }

    // ✅ Registro exitoso con delay antes de redirigir
    $.ajax({
      url: '/api/register',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(nuevoUsuario),
      success: function (res) {
        alert(res.message || 'Usuario registrado correctamente');
        $('#form-registro')[0].reset();

        // Esperar un poco tras el alert antes de redirigir
        setTimeout(() => {
          window.location.href = 'index.html?showLogin=1';
        }, 300);
      },
      error: function (xhr) {
        alert(xhr.responseJSON?.error || 'Error al registrar usuario');
      }
    });
  });

});

/* ================================================
   ✅ MODIFICACIÓN AÑADIDA para mostrar el modal login automáticamente
   después de registro, limpiando los campos antes de mostrar
================================================== */
function esperarYMostrarLoginModal() {
  const loginModalEl = document.getElementById('loginModal');
  if (!loginModalEl) return;

  const interval = setInterval(() => {
    const usernameInput = document.getElementById('login-username');
    const passwordInput = document.getElementById('login-password');

    if (usernameInput && passwordInput) {
      clearInterval(interval);

      // Limpiar campos antes de mostrar
      usernameInput.value = '';
      passwordInput.value = '';
      usernameInput.focus();

      const loginModal = new bootstrap.Modal(loginModalEl);
      loginModal.show();
    }
  }, 100);
}
