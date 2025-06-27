// auth.js - Este archivo gestiona la autenticación de usuarios, incluyendo funciones para iniciar sesión, cerrar sesión y validar credenciales.
// Espera que el DOM esté cargado para empezar
$(document).ready(function () {

  // === LOGIN desde el modal===
 $(document).on('submit', '#form-login', function(e){
    console.log("Submit capturado");
    e.preventDefault(); // Evita que el formulario se envíe de forma tradicional

    // Obtenemos los valores de los campos del formulario
    // Usamos .trim() para eliminar espacios al inicio y final
    const username = $('#username').val().trim(); // Solo username
    const password = $('#password').val();

    // Validación simple
    if (!username || !password) {
      alert('Por favor, completa todos los campos');
      return;
    }

    // Validar formato de username (opcional, si quieres puedes agregar una expresión regular)
    // if (!/^[a-zA-Z0-9_-]{3,20}$/.test(username)) {
    //   alert('El nombre de usuario no tiene un formato válido.');
    //   return;
    // }

    const body = { username, password };

    // Enviamos los datos al backend con fetch
    fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
      .then(res => {
        console.log("Respuesta recibida:", res);
        if (!res.ok) throw new Error('Usuario o contraseña incorrectos');
        return res.json();
      })
      .then(data => {
        console.log("Datos decodificados:", data);
        const usuario = data.user.username;

        console.log("Usuario logueado:", usuario);
        // Acceso concedido: redirigir a la página principal y almacenar usuario
        localStorage.setItem('usuario', data.user.username);
        alert("Bienvenido " + usuario);
        const referrer = document.referrer;
          window.location.href = "/pages/index.html";
      })
      .catch(err => {
        console.error("Error en el login:", err);

        // Mostrar modal de error
        var myModal = new bootstrap.Modal(document.getElementById('loginErrorModal'));
        myModal.show();
      });
  });

  // === REGISTRO ===
  $('#form-registro').submit(function (e) {
    e.preventDefault(); // Previene envío clásico (con recarga)
    
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
    // Validación básica
    if (!nuevoUsuario.username || !nuevoUsuario.email || !nuevoUsuario.birthdate || !nuevoUsuario.phone || !nuevoUsuario.postalcode || !nuevoUsuario.city || !nuevoUsuario.password) {
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
    // Validar fecha de nacimiento (mayor de 13 años)
    if (!/\d{4}-\d{2}-\d{2}/.test(nuevoUsuario.birthdate)) {
      alert('La fecha de nacimiento no es válida.');
      return;
    }
    // Validar teléfono (9 dígitos)
    if (!/^\d{9}$/.test(nuevoUsuario.phone)) {
      alert('El teléfono debe tener 9 dígitos.');
      return;
    }
    // Validar código postal (5 dígitos)
    if (!/^\d{5}$/.test(nuevoUsuario.postalcode)) {
      alert('El código postal debe tener 5 dígitos.');
      return;
    }
    // Validar ciudad (no vacía, solo letras y espacios)
    if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{2,40}$/.test(nuevoUsuario.city)) {
      alert('La ciudad debe tener entre 2 y 40 letras.');
      return;
    }
    // Validar password
    if (!validarPassword(nuevoUsuario.password)) {
      alert('La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número.');
      return;
    }
    // Confirmar que ambas contraseñas coinciden
    if (!compararPasswords(nuevoUsuario.password, confirmPassword)) {
      console.log(nuevoUsuario.password, confirmPassword);
      alert('Las contraseñas no coinciden.');
      return;
    }

    // Enviamos la solicitud al servidor
    $.ajax({
      url: '/api/register',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(nuevoUsuario),
      success: function (res) {
        alert(res.message || 'Usuario registrado correctamente');// Mostramos el mensaje de éxito
        $('#form-registro')[0].reset();
        // Redirige a index.html y abre la modal de login automáticamente
        window.location.href = 'index.html?showLogin=1';
      },
      error: function (xhr) {
        alert(xhr.responseJSON?.error || 'Error al registrar usuario');// Si hay error, mostramos el mensaje
      }
    });
  });

});
