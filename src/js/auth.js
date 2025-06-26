// auth.js - Este archivo gestiona la autenticación de usuarios, incluyendo funciones para iniciar sesión, cerrar sesión y validar credenciales.
// Espera que el DOM esté cargado para empezar
$(document).ready(function () {

  // === LOGIN desde el modal===
  $('#loginForm').submit(function (e) {
    e.preventDefault(); // Evita que el formulario se envíe de forma tradicional

    const credenciales = {
      username: $('#loginEmail').val().trim(), // Valor del input con id 'loginEmail'
      password: $('#loginPassword').val()         // Valor del input con id 'loginPassword'
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
        $('#loginModal').modal('hide'); // Cierra el modal de login
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
      username: $('#regUsername').val().trim(),
      email: $('#regEmail').val().trim(),
      password: $('#regPassword').val()
    };

    const confirmPassword = $('#regConfirmPassword').val();

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
    if (!compararPasswords(nuevoUsuario.password, confirmPassword)) {
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
        alert(res.message || 'Usuario registrado correctamente. Ahora puedes iniciar sesión desde el botón "Login".');
      $('#form-registro')[0].reset();
      window.location.href = '/pages/index.html'; // Redirijo a index.html
      },


      error: function (xhr) {
        alert(xhr.responseJSON?.error || 'Error al registrar usuario');// Si hay error, mostramos el mensaje
      }
    });
  });

});
