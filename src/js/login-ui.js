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
  const usernameMobile = document.getElementById('username-mobile');
  const usernameDesktop = document.getElementById('username-desktop');
  if (usernameMobile) usernameMobile.textContent = username;
  if (usernameDesktop) usernameDesktop.textContent = username;

  const btnContainerMobile = document.getElementById('auth-button-mobile');
  const btnContainerDesktop = document.getElementById('auth-button-desktop');

  const logoutHTML = `
    <button class="btn btn-danger" id="logoutBtn">
      <i class="bi bi-box-arrow-right me-1"></i>Logout
    </button>
  `;

if (btnContainerMobile) {
  btnContainerMobile.innerHTML = logoutHTML;
  const logoutBtn = btnContainerMobile.querySelector('#logoutBtn');
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('usuario');

    const modal = new bootstrap.Modal(document.getElementById('logoutModal'));
    modal.show();

    // Redirige o recarga después de 2 segundos
    setTimeout(() => {
      location.reload(); // o window.location.href = '/';
    }, 2000);
  });
}

if (btnContainerDesktop) {
  btnContainerDesktop.innerHTML = logoutHTML;
  const logoutBtn = btnContainerDesktop.querySelector('#logoutBtn');
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('usuario');
    //Guardamos mantenerFiltros si estamos en search para que muestre los filtros cargados
    if (window.location.pathname.endsWith("/search.html")) {
      localStorage.setItem('mantenerFiltros', "true");
    }
    

    const modal = new bootstrap.Modal(document.getElementById('logoutModal'));
    modal.show();
    

    // Redirige o recarga después de 2 segundos
    setTimeout(() => {
      location.reload(); // o window.location.href = '/';
    }, 2000);
  });
}
}

function mostrarBotonLogin() {
  const btnContainerMobile = document.getElementById('auth-button-mobile');
  const btnContainerDesktop = document.getElementById('auth-button-desktop');

  const loginHTML = `
    <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#loginModal" id="loginBtn">
      <i class="bi bi-person-fill me-1"></i>Login
    </button>
  `;

  if (btnContainerMobile) btnContainerMobile.innerHTML = loginHTML;
  if (btnContainerDesktop) btnContainerDesktop.innerHTML = loginHTML;
}

function esperarYMostrarLoginModal() {
  function showModal() {
    const modal = document.getElementById('loginModal');
    if (modal && typeof bootstrap !== 'undefined') {
      new bootstrap.Modal(modal).show();
      return true;
    }
    return false;
  }
  if (!showModal()) {
    const observer = new MutationObserver(() => {
      if (showModal()) observer.disconnect();
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }
}

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
  const usuario = localStorage.getItem('usuario');
  if (usuario) {
    mostrarBotonLogout(usuario);
  } else {
    mostrarBotonLogin();
  }

  const loginForm = document.getElementById('form-login');
  if (loginForm) {
    loginForm.addEventListener('submit', function (e) {
      e.preventDefault();
      ocultarErrorLoginPassword();

      const username = document.getElementById('login-username').value;
      const password = document.getElementById('login-password').value;
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
          localStorage.setItem('usuario', data.user.username);

          // Copiar estado cookies de invitado a usuario logueado
          const usuarioNuevo = data.user.username;
          const invitadoAceptado = localStorage.getItem('cookies_accepted_guest');
          if (invitadoAceptado === 'true') {
            localStorage.setItem(`cookies_accepted_${usuarioNuevo}`, 'true');
            localStorage.removeItem('cookies_accepted_guest');
          }

          mostrarBotonLogout(data.user.username);
          if (typeof bootstrap !== 'undefined') {
            const loginModal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
            if (loginModal) loginModal.hide();
          }
        })
      .catch(err => {
        mostrarErrorLoginPassword("Usuario o contraseña incorrectos");
      });
    });
  }

  // Asegurar que el botón de login siempre abre el modal aunque no esté en DOM al cargar
  const loginBtn = document.getElementById('loginBtn');
  if (loginBtn) {
    loginBtn.addEventListener('click', function (e) {
      e.preventDefault();
      esperarYMostrarLoginModal();
    });
  }
}

function onModalsLoaded() {
  initLoginUI();
  if (window.location.search.includes('showLogin=1')) {
    esperarYMostrarLoginModal();
    window.history.replaceState({}, document.title, window.location.pathname);
  }
}

(function () {
  const modalsContainer = document.getElementById('modals-container');
  const modalExists = document.getElementById('loginModal');

  if (modalExists) {
    onModalsLoaded();
  } else if (modalsContainer) {
    const observer = new MutationObserver((mutations, obs) => {
      if (document.getElementById('loginModal')) {
        onModalsLoaded();
        obs.disconnect();
      }
    });
    observer.observe(modalsContainer, { childList: true, subtree: true });
  } else {
    document.addEventListener('DOMContentLoaded', initLoginUI);
  }
})();

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
      mostrarCarrito();
      const backdrop = document.querySelector('.modal-backdrop');
      if (backdrop) backdrop.remove();
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
