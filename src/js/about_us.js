// /src/js/about_us.js

$(document).ready(function () {
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

  // Insertar cards con animación de entrada
  integrantes.forEach((persona, index) => {
    const delay = index * 200; // para escalonar las animaciones

    const card = $(`
      <div class="col-md-4 mb-4 animate__animated" style="animation-delay:${delay}ms">
        <div class="card h-100 shadow-sm">
          <img src="${persona.imagen}" class="card-img-top" alt="${persona.nombre}">
          <div class="card-body">
            <h5 class="card-title">${persona.nombre}</h5>
            <p class="card-text">${persona.descripcion}</p>
          </div>
        </div>
      </div>
    `).addClass("animate__fadeInUp");

    $("#team-cards").append(card);
  });

  // Hover con animación usando animate.css
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

// Inicializar Google Maps (llamado por el callback)
window.initMap = function () {
  const rairockLocation = { lat: 40.4168, lng: -3.7038 }; // Madrid ficticio
  const map = new google.maps.Map(document.getElementById("map"), {
    center: rairockLocation,
    zoom: 14,
  });

  new google.maps.Marker({
    position: rairockLocation,
    map: map,
    title: "RaiRock Music Store",
  });
};
