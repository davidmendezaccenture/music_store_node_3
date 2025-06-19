// auth.js - Este archivo gestiona la autenticación de usuarios, incluyendo funciones para iniciar sesión, cerrar sesión y validar credenciales.
// Espera que el DOM esté cargado para empezar
$(document).ready(function () {

  // === LOGIN ===
  $('#form-login').submit(function (e) {
    e.preventDefault(); // Evita que el formulario se envíe de forma tradicional

    const credenciales = {
      username: $('#username').val().trim(), // Valor del input con id 'username'
      password: $('#password').val()         // Valor del input con id 'password'
    };

    // Validación simple (puedes mover esto a utils.js si prefieres)
    if (!credenciales.username || !credenciales.password) {
      alert('Por favor, completa todos los campos');
      return;
    }

    // Enviamos los datos al backend con AJAX
    $.ajax({
      url: '/api/login',                     // Ruta de registro en el backend
      method: 'POST',                        // Método POST para enviar datos
      contentType: 'application/json',       // Indicamos que enviamos JSON
      data: JSON.stringify(credenciales),    // Convertimos el objeto a JSON

      success: function (res) {
        alert(`Bienvenido, ${res.username}`);
        localStorage.setItem('usuario', JSON.stringify(res)); // Guardamos el objeto usuario completo en localStorage
        window.location.href = '/pages/index.html';       // Redirigimos a pagina index
      },

      error: function (xhr) {
        alert(xhr.responseJSON?.error || 'Error al iniciar sesión');// Si hay error, mostramos el mensaje que devuelve el backend
      }
    });
  });

  // === REGISTRO ===
  $('#form-registro').submit(function (e) {
    e.preventDefault(); // Previene envío clásico (con recarga)

    const nuevoUsuario = {
      username: $('#reg-username').val().trim(),
      email: $('#reg-email').val().trim(),
      password: $('#reg-password').val()
    };

    // Validación básica
    if (!nuevoUsuario.username || !nuevoUsuario.email || !nuevoUsuario.password) {
      alert('Por favor, completa todos los campos');
      return;
    }

     // Validaciones con funciones de utils.js

    // Validar username
    if (!validarUsername(nuevoUsuario.username)) {
      alert('El nombre de usuario debe tener entre 3 y 20 caracteres, y solo letras, números, guiones o guiones bajos.');
      return;
    }

    // Validar email
    if (!validarEmail(nuevoUsuario.email)) {
      alert('El email no tiene un formato válido.');
      return;
    }

    // Validar password
    if (!validarPassword(nuevoUsuario.password)) {
      alert('La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número.');
      return;
    }

    // Confirmar que ambas contraseñas coinciden
    if (!compararPasswords(nuevoUsuario.password, nuevoUsuario.password2)) {
      alert('Las contraseñas no coinciden.');
      return;
    }


    // Enviamos la solicitud al servidor
    $.ajax({
      url: '/api/register',               // Ruta de registro en el backend
      method: 'POST',
  
    contentType: 'application/json',
      data: JSON.stringify(nuevoUsuario), // Convertimos el objeto a JSON

      success: function (res) {
        alert(res.message || 'Usuario registrado correctamente');// Mostramos el mensaje de éxito
        $('#form-registro')[0].reset();
        window.location.href = '/pages/login.html'; // Redirige al login
      },

      error: function (xhr) {
        alert(xhr.responseJSON?.error || 'Error al registrar usuario');// Si hay error, mostramos el mensaje
      }
    });
  });

});