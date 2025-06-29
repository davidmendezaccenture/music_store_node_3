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
  const userActions = document.getElementById('user-actions');
  if (!userActions) return;
userActions.innerHTML = `
  <a href="/pages/cart.html" class="btn btn-outline-dark position-relative me-3">
    <i class="bi bi-cart3"></i>
    <span id="cartCounter" class="position-absolute top-0 start-100 translate-middle badge bg-danger rounded-pill">0</span>
  </a>
  <span class="me-3 fw-bold align-self-center">${username}</span>
  <button class="btn btn-danger me-3" id="logoutBtn">
    <i class="bi bi-box-arrow-right me-1"></i> Cerrar sesión
  </button>
`;
  document.getElementById('logoutBtn').addEventListener('click', function() {
    localStorage.removeItem('usuario');
    location.reload();
  });
}

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
  const modalHTML = `
    <div class="modal fade" id="modalBienvenida" tabindex="-1" aria-labelledby="modalBienvenidaLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content text-center">
          <div class="modal-body">
            <i class="bi bi-person-check text-primary" style="font-size: 3rem; margin-bottom:15px;"></i>
            <p class="fs-5 mb-2">${mensaje}</p>
            <button class="btn btn-primary mt-2" data-bs-dismiss="modal">Aceptar</button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Insertar en el contenedor
  const contenedor = document.getElementById('modals-container');
  contenedor.innerHTML = modalHTML;

  // Mostrar la modal
  const modal = new bootstrap.Modal(document.getElementById('modalBienvenida'));
  modal.show();
  //Redirigir tras cerrar la modal
  document.getElementById('modalBienvenida').addEventListener('hidden.bs.modal', function () {
  if (window.location.pathname.includes('login.html')) {
    window.location.href = "/pages/index.html";
  } else {
    location.reload();
  }
});
}
//Modal de confirmacion de pago
function mostrarModalPago() {
  const modalHTML = `
    <div class="modal fade" id="modalPagoConfirmado" tabindex="-1" aria-labelledby="modalPagoConfirmadoLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content text-center">
          <div class="modal-body">
            <i class="bi bi-check-circle text-primary" style="font-size: 3rem; margin-bottom: 15px;"></i>
            <p class="fs-5 mb-2">✅ ¡Pago realizado correctamente!</p>
            <button class="btn btn-primary mt-2" data-bs-dismiss="modal">Aceptar</button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Insertar en el contenedor
  const contenedor = document.getElementById('modals-container');
  contenedor.innerHTML = modalHTML;

  // Mostrar la modal
  const modal = new bootstrap.Modal(document.getElementById('modalPagoConfirmado'));
  modal.show();
  //Recargar tras mostrar la modal
  document.getElementById('modalPagoConfirmado').addEventListener('hidden.bs.modal', function () {
    location.reload();
  });
}
//Modal de confirmacion de borrado de elementos
let modalEliminar=null;
function mostrarModalConfirmarEliminacion() {
  const modalHTML = `
  <div class="modal fade" id="modalConfirmarEliminacion" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Confirmar eliminación</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          ¿Estás seguro de que quieres eliminar este producto del carrito?
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
          <button id="btn-confirmar-eliminar" type="button" class="btn btn-danger">Eliminar</button>
        </div>
      </div>
    </div>
  </div>
  `;

  // Insertar en el contenedor
  const contenedor = document.getElementById('modals-container');
  contenedor.innerHTML = modalHTML;

  // Mostrar la modal
  modalEliminar = new bootstrap.Modal(document.getElementById('modalConfirmarEliminacion'));
  modalEliminar.show();
}



