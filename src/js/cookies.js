// cookies.js

// ✅ Encapsulamos toda la lógica en una función global para poder llamarla tras cargar dinámicamente el modal
window.inicializarModalCookies = function () {
  // 1. Detectamos si el usuario está logueado o no
  const usuario = localStorage.getItem('usuario') || null;

  // 2. Según si está logueado o no, usamos una clave distinta en localStorage
  const claveCookiesAceptadas = usuario
    ? `cookies_accepted_${usuario}`   // Si está logueado, clave personalizada por usuario
    : 'cookies_accepted_guest';       // Si es invitado, clave genérica

  // 3. Comprobamos si ya aceptó las cookies antes
  const aceptado = localStorage.getItem(claveCookiesAceptadas);

  // 4. Si ya aceptó cookies, no mostramos el modal y salimos del script
  if (aceptado === 'true') {
    return;
  }

  // 5. Seleccionamos el modal de cookies del DOM
  const cookieModalEl = document.getElementById('cookieModal');
  if (!cookieModalEl) return; // Si el modal no está en esta página, no hacemos nada

  // 6. Creamos una instancia del modal Bootstrap
  const cookieModal = new bootstrap.Modal(cookieModalEl, {
    backdrop: 'static',  // No se puede cerrar haciendo clic fuera del modal
    keyboard: false      // No se puede cerrar con la tecla ESC
  });

  // 7. Mostramos el modal al usuario
  cookieModal.show();

  // 8. Acción al hacer clic en "Aceptar" cookies
  $('#acceptCookiesBtn').off('click').on('click', function () {
    // Guardamos en localStorage que este usuario (o invitado) aceptó las cookies
    localStorage.setItem(claveCookiesAceptadas, 'true');
    cookieModal.hide(); // Ocultamos el modal
  });

  // 9. Acción al hacer clic en "Más adelante"
  $('#postponeCookiesBtn').off('click').on('click', function () {
    // No guardamos nada → así el modal volverá a mostrarse en otras páginas
    cookieModal.hide(); // Solo cerramos el modal momentáneamente
  });
};
