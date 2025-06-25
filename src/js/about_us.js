// /src/js/about_us.js
// Lógica de la página "Sobre Nosotros"
$(document).ready(function () {
  // Datos de los integrantes del equipo
  const integrantes = [
    {
      nombre: "Pablo Hernández",
      descripcion: "Especialista en baterías y equipos de sonido.",
      imagen: "../assets/images/team1.jpg",
    },
    {
      nombre: "David Santos Belmonte",
      descripcion: "Especialista en guitarra clásica y acústica.",
      imagen: "../assets/images/team2.jpg",
    },
    {
      nombre: "Angélica Libreros",
      descripcion: "Especialista en guitarra eléctrica.",
      imagen: "../assets/images/team3.jpg",
    },
    {
      nombre: "Antonio Fernández",
      descripcion: "Especialista en bajos y teclados.",
      imagen: "../assets/images/team3.jpg",
    },
  ];

  // Generar dinámicamente cada card del equipo con animaciones
  integrantes.forEach((persona, index) => {
    const delay = index * 200; // Delay progresivo para efecto escalonado

    // Crear la card con Animate.css y Bootstrap
    const card = $(`
      <div class="col-md-4 mb-4 animate__animated" style="animation-delay: ${delay}ms;">
        <div class="card h-100 shadow-sm">
          <img src="${persona.imagen}" class="card-img-top" alt="${persona.nombre}">
          <div class="card-body">
            <h5 class="card-title">${persona.nombre}</h5>
            <p class="card-text">${persona.descripcion}</p>
          </div>
        </div>
      </div>
    `).addClass("animate__fadeInUp");

    // Insertar la card en el contenedor del DOM
    $("#team-cards").append(card);
  });

  // Añadir efecto animado al pasar el ratón (hover) sobre cada card
  $(document).on("mouseenter", ".card", function () {
    $(this)
      .addClass("animate__pulse animate__fast")
      .css("transform", "scale(1.03)");
  });

  $(document).on("mouseleave", ".card", function () {
    $(this)
      .removeClass("animate__pulse")
      .css("transform", "scale(1)");
  });
});

// Función que se invoca al cargar el script de Google Maps (desde el callback de la URL)
window.initMap = function () {
  // Ubicación ficticia de la tienda: Calle ACDC, Leganés (coordenadas ficticias)
  const rairockLocation = { lat: 40.3270, lng: -3.7635 };

  // Crear el mapa en el contenedor con centro en la ubicación
  const map = new google.maps.Map(document.getElementById("map"), {
    center: rairockLocation,
    zoom: 15,
  });

  // Colocar un marcador en la ubicación
  new google.maps.Marker({
    position: rairockLocation,
    map: map,
    title: "RaiRock Music Store",
  });
};

