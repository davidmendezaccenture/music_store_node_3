// auth.js - Este archivo gestiona la autenticación de usuarios, incluyendo funciones para iniciar sesión, cerrar sesión y validar credenciales.
// Espera que el DOM esté cargado para empezar
$(document).ready(function () {

  // === LOGIN ===
  $('#form-login').submit(function (e) {
    e.preventDefault(); // Evita que el formulario se envíe de forma tradicional (con recarga)

    // Obtenemos los datos del formulario
    const credenciales = {
      username: $('#username').val(),   // Valor del input con id 'username'
      password: $('#password').val()    // Valor del input con id 'password'
    };

    // Enviamos los datos al backend con AJAX
    $.ajax({
      url: '/api/login',                     // Ruta donde el servidor procesa el login
      method: 'POST',                        // Método POST para enviar datos
      contentType: 'application/json',       // Indicamos que enviamos JSON
      data: JSON.stringify(credenciales),    // Convertimos el objeto a JSON

      success: function (res) {
        alert(`Bienvenido ${res.username}`);                   // Mensaje de bienvenida
        localStorage.setItem('usuario', res.username);         // Guardamos el usuario en localStorage
        window.location.href = '/pages/index.html';            // Redirigimos al inicio
      },

      error: function (xhr) {
        // Si hay error, mostramos el mensaje que devuelve el backend
        alert(xhr.responseJSON?.error || 'Error en el login');
      }
    });
  });

  // === REGISTRO ===
  $('#form-registro').submit(function (e) {
    e.preventDefault(); // Previene envío clásico

    // Obtenemos los datos del formulario
    const usuario = {
      username: $('#reg-username').val(),
      email: $('#reg-email').val(),
      password: $('#reg-password').val()
    };

    // Enviamos la solicitud al servidor
    $.ajax({
      url: '/api/register',                 // Ruta de registro en el backend
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(usuario),       // Convertimos el objeto a JSON

      success: function (res) {
        alert(res.message);                 // Mostramos el mensaje de éxito
        $('#form-registro')[0].reset();     // Limpiamos el formulario
      },

      error: function (xhr) {
        alert(xhr.responseJSON?.error || 'Error en el registro');
      }
    });
  });
});
