// login-ui.js

function mostrarErrorLoginPassword(msg) {
  const errorDiv = document.getElementById('loginPasswordError');
  if (errorDiv) {
    errorDiv.textContent = msg;
    errorDiv.classList.remove('visually-hidden');
  }
}
function ocultarErrorLoginPassword() {
  const errorDiv = document.getElementById('loginPasswordError');
  if (errorDiv) {
    errorDiv.textContent = '';
    errorDiv.classList.add('visually-hidden');
  }
}

function mostrarBotonLogout(username) {
  // Nombre de usuario
  const usernameMobile = document.getElementById('username-mobile');
  const usernameDesktop = document.getElementById('username-desktop');
  if (usernameMobile) usernameMobile.textContent = username;
  if (usernameDesktop) usernameDesktop.textContent = username;

  // Contenedores de botones
  const btnContainerMobile = document.getElementById('auth-button-mobile');
  const btnContainerDesktop = document.getElementById('auth-button-desktop');

  // HTML del botón logout
  const logoutHTML = `
    <button class="btn btn-danger btn-sm" id="logoutBtn">
      <i class="bi bi-box-arrow-right me-1"></i>Logout
    </button>
  `;

  // Insertar logout en mobile
  if (btnContainerMobile) {
    btnContainerMobile.innerHTML = logoutHTML;
    const logoutBtn = btnContainerMobile.querySelector('#logoutBtn');
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('usuario');
      location.reload();
    });
  }

  // Insertar logout en desktop
  if (btnContainerDesktop) {
    btnContainerDesktop.innerHTML = logoutHTML;
    const logoutBtn = btnContainerDesktop.querySelector('#logoutBtn');
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('usuario');
      location.reload();
    });
  }
}
//Añado botón login y evento al cargar la página para evitar parpadeo entre páginas
function mostrarBotonLogin() {
  const btnContainerMobile = document.getElementById('auth-button-mobile');
  const btnContainerDesktop = document.getElementById('auth-button-desktop');

  const loginHTML = `
  <button class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#loginModal">
    <i class="bi bi-person-fill me-1"></i>Login
  </button>
  `;

  if (btnContainerMobile) btnContainerMobile.innerHTML = loginHTML;
  if (btnContainerDesktop) btnContainerDesktop.innerHTML = loginHTML;
}
document.addEventListener('DOMContentLoaded', () => {
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  if (usuario && usuario.nombre) {
    mostrarBotonLogout(usuario.nombre);
  } else {
    mostrarBotonLogin();
  }
});

function esperarYMostrarLoginModal() {
  function showModal() {
    var modal = document.getElementById('loginModal');
    if (modal && typeof bootstrap !== 'undefined') {
      new bootstrap.Modal(modal).show();
      return true;
    }
    return false;
  }
  if (!showModal()) {
    // Si aún no está, observar hasta que aparezca
    const observer = new MutationObserver(() => {
      if (showModal()) observer.disconnect();
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }
}

// Delegación de eventos para mostrar/ocultar contraseña (funciona para login y registro, incluso si se cargan dinámicamente)
document.addEventListener('click', function(e) {
  if (e.target.closest('.toggle-password')) {
    const btn = e.target.closest('.toggle-password');
    const input = btn.parentElement.querySelector('input');
    if (!input) return;
    if (input.type === 'password') {
      input.type = 'text';
      btn.querySelector('i').classList.remove('bi-eye');
      btn.querySelector('i').classList.add('bi-eye-slash');
      btn.setAttribute('aria-label', 'Ocultar contraseña');
    } else {
      input.type = 'password';
      btn.querySelector('i').classList.remove('bi-eye-slash');
      btn.querySelector('i').classList.add('bi-eye');
      btn.setAttribute('aria-label', 'Mostrar contraseña');
    }
  }
});

function initLoginUI() {
  // Revisar si hay usuario logeado
  const usuario = localStorage.getItem('usuario');
  if (usuario) {
    mostrarBotonLogout(usuario);
  }

  // Lógica de submit del formulario de login
  const loginForm = document.getElementById('form-login');
  if (loginForm) {
    loginForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })
        .then(res => {
          if (!res.ok) throw new Error('Usuario o contraseña incorrectos');
          return res.json();
        })
        .then(data => {
          // Acceso concedido: guardar usuario y cerrar modal
          localStorage.setItem('usuario', data.user.username);
          mostrarBotonLogout(data.user.username);
          // Cerrar modal si existe
          if (typeof bootstrap !== 'undefined') {
            var loginModal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
            if (loginModal) loginModal.hide();
          }
        })
        .catch(err => {
          mostrarErrorLoginPassword(err.message);
          // Mostrar modal de error si existe
          if (window.$ && $('#loginErrorModal').length) {
            $('#loginErrorModal').modal('show');
          }
        });
    });
  }

  // Asegurar que el botón de login siempre abre el modal aunque aún no esté cargado
  const loginBtn = document.getElementById('loginBtn');
  if (loginBtn) {
    loginBtn.addEventListener('click', function (e) {
      e.preventDefault();
      esperarYMostrarLoginModal();
    });
  }
}

// Accesibilidad: mostrar mensaje de error al abrir el modal de login si existe
$(document).on('show.bs.modal', '#loginModal', function() {
  var errorDiv = document.getElementById('loginPasswordError');
  if (errorDiv && errorDiv.textContent.trim() !== '') {
    errorDiv.classList.remove('visually-hidden');
  }
});

function onModalsLoaded() {
  initLoginUI();
  // Abrir modal automáticamente si la URL contiene ?showLogin=1
  if (window.location.search.includes('showLogin=1')) {
    esperarYMostrarLoginModal();
    window.history.replaceState({}, document.title, window.location.pathname);
  }
}

// Si los modales se cargan dinámicamente, esperar a que estén listos antes de inicializar login-ui.js
if (document.getElementById('modals-container')) {
  const observer = new MutationObserver(() => {
    if (document.getElementById('loginModal')) {
      onModalsLoaded();
      observer.disconnect();
    }
  });
  observer.observe(document.getElementById('modals-container'), { childList: true, subtree: true });
} else {
  document.addEventListener('DOMContentLoaded', initLoginUI);
}
//Modal de bienvenida de usuario
function mostrarModalBienvenida(mensaje) {
  document.getElementById('mensajeBienvenida').innerText = mensaje;

  const modalElement = document.getElementById('modalBienvenida');
  const modal = new bootstrap.Modal(modalElement);
  modal.show();

  document.getElementById('btnCerrarModalBienvenida').addEventListener('click', () => {
    modal.hide();
  });

  modalElement.addEventListener('hidden.bs.modal', () => {
    if (window.location.pathname.includes('login.html')) {
      window.location.href = "/pages/cart.html";
    } else {
      mostrarCarrito();
      const backdrop = document.querySelector('.modal-backdrop');
      if (backdrop) backdrop.remove();
    }
  });
}

//Modal de confirmacion de pago
function mostrarModalPago() {
  const modal = new bootstrap.Modal(document.getElementById('modalPagoConfirmado'));
  modal.show();

  document.getElementById('btnCerrarModalPago').addEventListener('click', () => {
    modal.hide();
  });
}

//Modal de confirmacion de borrado de elementos
let modalEliminar = null;

function mostrarModalConfirmarEliminacion() {
  modalEliminar = new bootstrap.Modal(document.getElementById('modalConfirmarEliminacion'));
  modalEliminar.show();
}




