//Scripts propios del index

//Carga de carrusel de opiniones
$(document).ready(function () {
    $.getJSON("/assets/data/clients.json")
    .done(function (data) {
        // Seleccionamos 9 opiniones aleatorias
        const opinionesAleatorias = data.sort(() => 0.5 - Math.random()).slice(0, 9);
        const $slidesContainer = $(".glide__slides");
        opinionesAleatorias.forEach(function (cliente) {
            const $li = $(`
                <li class="glide__slide">
                    <div class="tarjeta-opinion">
                        <p class="texto mb-4">${cliente.opinion}</p>
                        <div class="usuario d-flex align-items-center mt-auto">
                            <img
                                src="${cliente.urlImagen}"
                                alt="Foto de ${cliente.nombre}"
                                class="foto-usuario rounded-circle me-3">
                            <div class="info-usuario">
                                <p class="nombre mb-0 fw-semibold">${cliente.nombre}</p>
                                <p class="profesion mb-0 text-muted">${cliente.profesion}</p>
                                <div class="estrellas text-warning">${cliente.estrellas}</div>
                            </div>
                        </div>
                    </div>
                </li>
            `);
            $slidesContainer.append($li);
        });
        const glide = new Glide(".glide", {
            type: "carousel",
            perView: 3,
            gap: 30,
            breakpoints: {
                992: { perView: 2 },
                768: { perView: 1 },
            },
        });
        /*Función para igualar la alturas de todas las tarjetas una vez cargadas. Si cambiamos a tamaño estándar y añadimos alguna opción de visualización del texto de aquellas con más texto, se puede eliminar */
        function igualarAlturaTarjetas() {
            const tarjetas = document.querySelectorAll(".glide__slide .tarjeta-opinion");
            /*Obtenemos las alturas de todas las tarjetas y almacenamos el valor mayor, que aplicamos como altura mínima a todas las tarjetas*/
            const maxAltura = Math.max(...Array.from(tarjetas).map(t => t.offsetHeight));
            tarjetas.forEach(t => (t.style.maxHeight = `${maxAltura}px`));
            }
        /*Se ejecuta la función de igualar alturas cuando se crea el carrusel*/
        glide.on(["mount.after"], igualarAlturaTarjetas);
        glide.mount();
        // Flechas
        $(".glide__arrow--left").click(() => glide.go("<"));
        $(".glide__arrow--right").click(() => glide.go(">"));
    })
    .fail(function () {
        console.error("Error cargando clients.json");
    });
});

//Guardamos página actual
document.addEventListener('DOMContentLoaded', () => {
    localStorage.setItem('ultimaPagina', window.location.pathname + window.location.search);
});

// Añadir el año actual automáticamente
document.getElementById('currentYear').textContent = new Date().getFullYear();

//Filtro por categorías
document.getElementById('categoria').addEventListener('change', function () {
    const categoria = this.value;
    document.querySelectorAll('[data-category]').forEach(card => {
        if (categoria === 'Todas' || card.getAttribute('data-category') === categoria) {
            card.style.display = '';
        } else {
            card.style.display = 'none';
        }
    });
});
