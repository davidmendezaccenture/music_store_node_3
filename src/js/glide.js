// Carga de carrusel de opiniones
$(document).ready(function () {
    $.getJSON("/assets/data/clients.json")
        .done(function (data) {
            const opinionesPositivas = data.filter(cliente =>
                cliente.estrellas === "⭐⭐⭐⭐☆" || cliente.estrellas === "⭐⭐⭐⭐⭐"
            );

            const opinionesAleatorias = opinionesPositivas
                .sort(() => 0.5 - Math.random())
                .slice(0, 9);

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

            function igualarAlturaTarjetas() {
                const tarjetas = document.querySelectorAll(".glide__slide .tarjeta-opinion");
                const maxAltura = Math.max(...Array.from(tarjetas).map(t => t.offsetHeight));
                tarjetas.forEach(t => (t.style.minHeight = `${maxAltura}px`));
            }

            glide.on(["mount.after"], igualarAlturaTarjetas);
            glide.mount();

            $(".glide__arrow--left").click(() => glide.go("<"));
            $(".glide__arrow--right").click(() => glide.go(">"));
        })
        .fail(function () {
            console.error("Error cargando clients.json");
        });

    $('#modals-container').load('../partials/modals.html');
});
