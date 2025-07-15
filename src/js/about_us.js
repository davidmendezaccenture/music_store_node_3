// /src/js/about_us.js
// Lógica de la página "Sobre Nosotros"
$(document).ready(function () {
  // Datos de los integrantes del equipo
  const integrantes = [
    {
      nombre: "Pablo Hernández",
      descripcion: "Especialista en baterías y equipos de sonido. Ingeniero de sonido con más de 10 años de experiencia en giras nacionales e internacionales.",
      imagen: "../assets/images/team1.jpg",
    },
    {
      nombre: "David Santos Belmonte",
      descripcion: "Especialista en guitarra clásica y acústica. Profesor y compositor con estilo fingerstyle y pasión por el flamenco moderno.",
      imagen: "../assets/images/team2.jpg",
    },
    {
      nombre: "Angélica Libreros",
      descripcion: "Especialista en guitarra eléctrica. Productora musical apasionada del metal alternativo y efectos analógicos.",
      imagen: "../assets/images/team_4.jpg",
    },
    {
      nombre: "Antonio Fernández",
      descripcion: "Especialista en bajos y teclados. Compositor profesional y experto en sintetizadores, grooves y armonías modernas.",
      imagen: "../assets/images/team3.jpg",
    },
  ];

  // Generar dinámicamente cada card del equipo
  integrantes.forEach((persona, index) => {
    const delay = index * 200; // efecto escalonado

    const card = $(`
      <div class="col-sm-6 col-lg-4 col-xl-3 mb-4 animate__animated animate__fadeInUp" style="animation-delay: ${delay}ms;">
        <div class="card h-100 shadow-sm border-0" tabindex="0" role="button" aria-label="Más información sobre ${persona.nombre}">
          <img src="${persona.imagen}" class="card-img-top img-fluid" alt="${persona.nombre}">
          <div class="card-body">
            <h5 class="card-title">${persona.nombre}</h5>
            <p class="card-text small">${persona.descripcion.slice(0, 100)}...</p>
            <button class="btn btn-outline-dark btn-sm w-100 btn-mas-info mt-2" 
              data-nombre="${persona.nombre}" 
              data-desc="${persona.descripcion}" 
              data-img="${persona.imagen}">
              Ver más
            </button>
          </div>
        </div>
      </div>
    `);

    $("#team-cards").append(card);
  });

  // Animación al pasar el ratón (hover)
  $(document).on("mouseenter", ".card", function () {
    $(this).addClass("animate__pulse animate__fast").css("transform", "scale(1.03)");
  });

  $(document).on("mouseleave", ".card", function () {
    $(this).removeClass("animate__pulse").css("transform", "scale(1)");
  });

  // Efecto al hacer clic en botón "Ver más" y mostrar el modal
  $(document).on("click", ".btn-mas-info", function () {
    const nombre = $(this).data("nombre");
    const descripcion = $(this).data("desc");
    const imagen = $(this).data("img");

    $("#modalIntegranteLabel").text(nombre);
    $("#modalDesc").text(descripcion);
    $("#modalImg")
    .attr("src", imagen)
    .attr("alt", nombre)
    .css({
      width: "100%",
      maxHeight: "400px",
      objectFit: "contain",
      display: "block",
      margin: "0 auto",
    });


    $("#modalIntegrante").modal("show");
  });
});

// Función para inicializar Google Maps
window.initMap = function () {
  // Ubicación ficticia: Calle ACDC, Leganés
  const rairockLocation = { lat: 40.3270, lng: -3.7635 };

  // Crear el mapa
  const map = new google.maps.Map(document.getElementById("map"), {
    center: rairockLocation,
    zoom: 15,
  });

  // Contenido de la ventana emergente
  const infoContent = `
    <div style="max-width: 250px;">
      <h6 class="mb-1">Fuzzr Music Store</h6>
      <p class="mb-0"><strong>Dirección:</strong> Calle ACDC, Leganés<br>
      <strong>Horario:</strong> Lunes a Sábado, 10:00 - 20:00<br>
      <strong>Tel:</strong> 911 123 456</p>
    </div>
  `;

  const infoWindow = new google.maps.InfoWindow({
    content: infoContent,
  });

  // Crear el marcador
  const marker = new google.maps.Marker({
    position: rairockLocation,
    map: map,
    title: "Fuzzr Music Store - Calle ACDC, Leganés",
    animation: google.maps.Animation.DROP
  });

  // Mostrar infoWindow al hacer clic
  marker.addListener("click", () => {
    infoWindow.open(map, marker);
  });
};



