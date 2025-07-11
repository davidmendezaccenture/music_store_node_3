//auth.js
$(document).ready(function () {

  // === LOGIN desde el modal===
  function mostrarErrorLogin(campo, mensaje) {
    const errorDiv = document.getElementById(`login${capitalize(campo)}Error`);
    if (errorDiv) {
      errorDiv.textContent = mensaje;
      errorDiv.classList.remove("visually-hidden");
    }
  }

  function ocultarErrorLogin(campo) {
    const errorDiv = document.getElementById(`login${capitalize(campo)}Error`);
    if (errorDiv) {
      errorDiv.textContent = "";
      errorDiv.classList.add("visually-hidden");
    }
  }

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // Manejador de eventos para el formulario de login
$(document).on('submit', '#form-login', function(e) {
  console.log("Submit capturado");
  e.preventDefault();
  //Quitamos trim() del username, ya que si añadimos espacios lo da por válido, pero da inicialmente error aunque se conecta
  const username = $("#login-username").val();
  const password = $("#login-password").val();

  // Oculta errores previos
  ocultarErrorLogin("username");
  ocultarErrorLogin("password");

  let hayError = false;
  if (!username) {
    mostrarErrorLogin("username", "El usuario es obligatorio");
    hayError = true;
  }
  if (!password) {
    mostrarErrorLogin("password", "La contraseña es obligatoria");
    hayError = true;
  }
  if (hayError) return;

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

    //Añadimos el carrito del usuario
    carritoUsuario.forEach((item) => {
      mapa.set(item.id, { ...item });
    });

    //Añadimos el contenido del carrito de invitado. Si el elemento ya está, sumamos cantidades
    carritoInvitado.forEach((item) => {
      if (mapa.has(item.id)) {
        mapa.get(item.id).cantidad += item.cantidad;
      } else {
        mapa.set(item.id, { ...item });
      }
    });
    return Array.from(mapa.values());
  }
});

function mostrarErrorCampo(idInput, mensaje) {
  const input = document.getElementById(idInput);
  const feedback = input.nextElementSibling;
  input.classList.add("is-invalid");
  if (feedback && feedback.classList.contains("invalid-feedback")) {
    feedback.textContent = mensaje;
    feedback.classList.remove("visually-hidden");
  }
}
function ocultarErrorCampo(idInput) {
  const input = document.getElementById(idInput);
  const feedback = input.nextElementSibling;
  input.classList.remove("is-invalid");
  if (feedback && feedback.classList.contains("invalid-feedback")) {
    feedback.classList.add("visually-hidden");
  }
}

  // === REGISTRO ===
  $('#form-registro').submit(function (e) {
    e.preventDefault();

    const nuevoUsuario = {
      username: $('#regUsername').val().trim(),
      email: $('#email').val().trim(),
      birthdate: $('#birthdate').val(),
      phone: $('#phone').val().trim(),
      postalcode: $('#postalcode').val().trim(),
      city: $('#city').val().trim(),
      password: $('#password').val()
    };

    const confirmPassword = $('#confirmPassword').val();
    // Validación básica
    const campos = [
      {
        id: "regUsername",
        value: nuevoUsuario.username,
        msg: "El nombre de usuario es obligatorio.",
      },
      {
        id: "email",
        value: nuevoUsuario.email,
        msg: "El correo electrónico es obligatorio.",
      },
      {
        id: "birthdate",
        value: nuevoUsuario.birthdate,
        msg: "La fecha de nacimiento es obligatoria.",
      },
      {
        id: "phone",
        value: nuevoUsuario.phone,
        msg: "El teléfono es obligatorio.",
      },
      {
        id: "postalcode",
        value: nuevoUsuario.postalcode,
        msg: "El código postal es obligatorio.",
      },
      {
        id: "city",
        value: nuevoUsuario.city,
        msg: "La ciudad es obligatoria.",
      },
      {
        id: "password",
        value: nuevoUsuario.password,
        msg: "La contraseña es obligatoria.",
      },
      {
        id: "confirmPassword",
        value: confirmPassword,
        msg: "Debes confirmar la contraseña.",
      },
    ];

    let hayError = false;
    campos.forEach((campo) => {
      if (!campo.value) {
        mostrarErrorCampo(campo.id, campo.msg);
        hayError = true;
      } else {
        ocultarErrorCampo(campo.id);
      }
    });
    if (hayError) return;

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

  $("#form-forgot-password").submit(function (e) {
    e.preventDefault();
    const email = $("#forgotEmail").val().trim();
    $("#forgotEmail").removeClass("is-invalid");
    $("#forgotEmailError").text("");
    $("#forgotPasswordSuccess").addClass("visually-hidden").text("");

    if (!email) {
      $("#forgotEmail").addClass("is-invalid");
      $("#forgotEmailError").text("El correo es obligatorio");
      return;
    }

    // Aquí iría la llamada AJAX real al backend
    $.ajax({
      url: "/api/forgot-password",
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify({ email }),
      success: function () {
        $("#forgotPasswordSuccess")
          .removeClass("visually-hidden")
          .text(
            "Si el correo existe, recibirás un enlace para restablecer tu contraseña."
          );
      },
      error: function () {
        $("#forgotEmail").addClass("is-invalid");
        $("#forgotEmailError").text(
          "No se pudo enviar el correo. Inténtalo más tarde."
        );
      },
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
