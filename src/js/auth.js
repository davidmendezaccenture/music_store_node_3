// auth.js - Este archivo gestiona la autenticación de usuarios, incluyendo funciones para iniciar sesión, cerrar sesión y validar credenciales.
// Espera que el DOM esté cargado para empezar
$(document).ready(function () {

  // === LOGIN desde el modal===
$(document).on('submit', '#form-login', function(e) {
  console.log("Submit capturado");
  e.preventDefault();
  //Quitamos trim() del username, ya que si añadimos espacios lo da por válido, pero da inicialmente error aunque se conecta
  const username = $('#username').val();
  const password = $('#password').val();

  if (!username || !password) {
    alert('Por favor, completa todos los campos');
    return;
  }

  const body = { username, password };
  let carritoInvitado = [];
  let carritoUsuario = [];

  //Obtenemos el carrito del invitado
  fetch('/api/cart?user=guest')
    .then(res => {
      if (!res.ok) throw new Error('Error al obtener el carrito del invitado');
      return res.json();
    })
    .then(data => {
      carritoInvitado = data;
      
    //Borramos el carrito del invitado para que al hacer logout esté vacío
      return fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: 'guest', items: [] })
      });
    })
    .then(() => {
    //Completamos el login
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
      //Guardamos los datos los datos del usuario
      const usuario = data.user.username;
      localStorage.setItem('usuario', usuario);

      //Obtenemos el carrito del usuario
      return fetch(`/api/cart?user=${usuario}`)
        .then(res => {
          if (!res.ok) throw new Error('Error al obtener el carrito del usuario');
          return res.json();
        })
        .then(data => {
          carritoUsuario = data;
          //Actualizamos el contador del carrito
          const carritoFinal = unificarCarritos(carritoUsuario, carritoInvitado);
          actualizarContadorCarrito(calcularTotalItems(carritoFinal));

          // Guardamos el carrito unificado en el backend del usuario
          return fetch('/api/cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user: usuario, items: carritoFinal })
          }).then(() => {
            //Actualizamos el carrito
            carrito=carritoFinal;
            //Modal de bienvenida
            mostrarModalBienvenida(`Bienvenido ${usuario}`);
          });
        });
    })
    .catch(err => {
      console.error("Error en el proceso de login o carrito:", err);
      loginErrorModal.show();
    });

  //Función para unificar el contenido de los carritos
  function unificarCarritos(carritoUsuario, carritoInvitado) {
    const mapa = new Map();

    //Añadimos el carrito del usuario
    carritoUsuario.forEach(item => {
      mapa.set(item.id, { ...item });
    });

    //Añadimos el contenido del carrito de invitado. Si el elemento ya está, sumamos cantidades
    carritoInvitado.forEach(item => {
      if (mapa.has(item.id)) {
        mapa.get(item.id).cantidad += item.cantidad;
      } else {
        mapa.set(item.id, { ...item });
      }
    });
    return Array.from(mapa.values());
  }
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
  //Modal de error fuera del bloque catch. Si no, no se cierra del todo
  const loginErrorModal = new bootstrap.Modal(document.getElementById('loginErrorModal'));

});
