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
        const datosUsuario = data.user;

        // --- NUEVO: copiar aceptación de cookies de invitado a usuario ---
        const invitadoAcepto = localStorage.getItem('cookies_accepted_guest');
        if (invitadoAcepto === 'true') {
          localStorage.setItem(`cookies_accepted_${usuario}`, 'true');
        }
        // --- FIN NUEVO ---

        localStorage.setItem('usuario', usuario);
        localStorage.setItem('datosUsuario', JSON.stringify(data.user));

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
});

function mostrarErrorCampo(idInput, mensaje) {
  const input = document.getElementById(idInput);
  let feedback;

  if (idInput === "password") {
    // Para password, buscar el div con id passwordError
    feedback = document.getElementById("passwordError");
  } else if (idInput === "confirmPassword") {
    // Similar para confirmPassword
    feedback = document.getElementById("confirmPasswordError");
  } else {
    feedback = input.nextElementSibling;
  }

  input.classList.add("is-invalid");
  if (feedback) {
    feedback.textContent = mensaje;
    feedback.classList.remove("visually-hidden");
  }
}

function ocultarErrorCampo(idInput) {
  const input = document.getElementById(idInput);
  let feedback;

  if (idInput === "password") {
    feedback = document.getElementById("passwordError");
  } else if (idInput === "confirmPassword") {
    feedback = document.getElementById("confirmPasswordError");
  } else {
    feedback = input.nextElementSibling;
  }

  input.classList.remove("is-invalid");
  if (feedback) {
    feedback.classList.add("visually-hidden");
  }
}


  // === REGISTRO ===
$('#form-registro').submit(function (e) {
  e.preventDefault();
  //Si venimos de search, mantenemos los filtros
  localStorage.setItem('mantenerFiltros', 'true');

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
    { id: "regUsername", value: nuevoUsuario.username, msg: "El nombre de usuario es obligatorio." },
    { id: "email", value: nuevoUsuario.email, msg: "El correo electrónico es obligatorio." },
    { id: "birthdate", value: nuevoUsuario.birthdate, msg: "La fecha de nacimiento es obligatoria." },
    { id: "phone", value: nuevoUsuario.phone, msg: "El teléfono es obligatorio." },
    { id: "postalcode", value: nuevoUsuario.postalcode, msg: "El código postal es obligatorio." },
    { id: "city", value: nuevoUsuario.city, msg: "La ciudad es obligatoria." },
    { id: "password", value: nuevoUsuario.password, msg: "La contraseña es obligatoria." },
    { id: "confirmPassword", value: confirmPassword, msg: "Debes confirmar la contraseña." },
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

  // Validaciones específicas
  if (!validarUsername(nuevoUsuario.username)) {
    mostrarErrorCampo("regUsername", "El nombre de usuario debe tener entre 3 y 20 caracteres, y solo letras, números, guiones o guiones bajos.");
    return;
  } else {
    ocultarErrorCampo("regUsername");
  }

  if (!validarEmail(nuevoUsuario.email)) {
    mostrarErrorCampo("email", "El correo electrónico no tiene un formato válido.");
    return;
  } else {
    ocultarErrorCampo("email");
  }

  if (!/\d{4}-\d{2}-\d{2}/.test(nuevoUsuario.birthdate)) {
    mostrarErrorCampo("birthdate", "La fecha de nacimiento no es válida.");
    return;
  } else {
    ocultarErrorCampo("birthdate");
  }

  if (!/^\d{9}$/.test(nuevoUsuario.phone)) {
    mostrarErrorCampo("phone", "El teléfono debe tener 9 dígitos.");
    return;
  } else {
    ocultarErrorCampo("phone");
  }

  if (!/^\d{5}$/.test(nuevoUsuario.postalcode)) {
    mostrarErrorCampo("postalcode", "El código postal debe tener 5 dígitos.");
    return;
  } else {
    ocultarErrorCampo("postalcode");
  }

  if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{2,40}$/.test(nuevoUsuario.city)) {
    mostrarErrorCampo("city", "La ciudad debe tener entre 2 y 40 letras.");
    return;
  } else {
    ocultarErrorCampo("city");
  }

  if (!validarPassword(nuevoUsuario.password)) {
    mostrarErrorCampo("password", "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número.");
    return;
  } else {
    ocultarErrorCampo("password");
  }

  if (!compararPasswords(nuevoUsuario.password, confirmPassword)) {
    mostrarErrorCampo("confirmPassword", "Las contraseñas no coinciden.");
    return;
  } else {
  ocultarErrorCampo("confirmPassword");
  }


  // Enviar petición al servidor
  $.ajax({
    url: '/api/register',
    method: 'POST',
    contentType: 'application/json',
    data: JSON.stringify(nuevoUsuario),
    success: function (res) {
      $('#form-registro')[0].reset();
      localStorage.removeItem("usuario");
      localStorage.removeItem("datosUsuario");
      const username = nuevoUsuario.username;
      const datosUsuario = res.usuario;
      procesarPostLogin(username, datosUsuario);
    },
    error: function (xhr) {
      const errorMsg = xhr.responseJSON?.error || 'Error al registrar usuario';

      // Limpiamos errores previos
      ocultarErrorCampo('regUsername');
      ocultarErrorCampo('email');

      if (errorMsg.toLowerCase().includes('usuario')) {
        mostrarErrorCampo('regUsername', errorMsg);
      } else if (errorMsg.toLowerCase().includes('correo') || errorMsg.toLowerCase().includes('email')) {
        mostrarErrorCampo('email', errorMsg);
      } else {
        // Puedes mostrar error general en un div o console
        console.error('Error inesperado:', errorMsg);
      }
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

  function procesarPostLogin(username, datosUsuario) {
  const usuario = username;
  let carritoInvitado = [];
  let carritoUsuario = [];

  // Copiar cookies si existían
const invitadoAcepto = localStorage.getItem('cookies_accepted_guest');
if (invitadoAcepto === 'true') {
  localStorage.setItem(`cookies_accepted_${usuario}`, 'true');

  const modalEl = document.getElementById('cookieModal');
  if (modalEl) {
    const modalInstance = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
    modalInstance.hide();
  }
}

  localStorage.setItem('usuario', usuario);
  localStorage.setItem('datosUsuario', JSON.stringify(datosUsuario));

  fetch('/api/cart?user=guest')
    .then(res => res.json())
    .then(data => {
      carritoInvitado = data;

      return fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: 'guest', items: [] })
      }).then(res => {
  if (!res.ok) {
    console.error("Error vaciando carrito invitado");
  }
  return res.json();
}).then(data => {
  console.log("Carrito invitado vaciado:", data);
});
    })
    .then(() => {

      return fetch(`/api/cart?user=${usuario}`);
    })
    .then(res => res.json())
    .then(data => {
      carritoUsuario = data;
      const carritoFinal = unificarCarritos(carritoUsuario, carritoInvitado);

      return fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: usuario, items: carritoFinal })
      }).then(() => {
        carrito = carritoFinal;
        actualizarContadorCarrito(calcularTotalItems(carritoFinal));

        mostrarModalBienvenidaYRedirigir(`Bienvenido ${usuario}`);

      });
    })
    .catch(err => {
      console.error("Error en proceso post-login:", err);
    });
}

function mostrarModalBienvenidaYRedirigir(mensaje) {

  const modalElement = document.getElementById('modalBienvenidaRegistro');
  if (!modalElement) {
    console.error('No se encontró la modal con id modalBienvenidaRegistro');
    return;
  }

  const modalsContainer = document.getElementById('modals-container');
  modalsContainer.innerHTML = ''; // limpia el contenedor
  modalsContainer.appendChild(modalElement); // mueve la modal al contenedor
  document.getElementById('mensajeBienvenidaRegistro').textContent = mensaje;
  const modal = new bootstrap.Modal(modalElement, {
    backdrop: 'static',
    keyboard: false
  });

  // Evento para redirigir al cerrar la modal (solo una vez)
  modalElement.addEventListener('hidden.bs.modal', () => {
    const ultimaPagina = localStorage.getItem('ultimaPagina');
    window.location.href = ultimaPagina;
  }, { once: true });
  modal.show();
}


