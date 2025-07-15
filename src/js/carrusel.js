$(document).ready(function () {
    $.get('/api/products', function (productos) {
        if (!productos || productos.length === 0) return;

        // Con el segundo parámetro cambiamos el número de elementos que vamos a mostrar
        const seleccionados = seleccionarProductosAleatorios(productos, 6);

        let indicadoresHTML = '';
        let itemsHTML = '';

        seleccionados.forEach((producto, index) => {
            const activo = index === 0 ? 'active' : '';

            // Si está en oferta, genera el badge
            const badgeOferta = (producto.enOferta && producto.enOferta.toLowerCase() === "sí")
            ? `<div class="badge bg-danger text-white" style="z-index: 10;">🔥 En oferta</div>`
            : '';

            indicadoresHTML += `
                <button type="button"
                    data-bs-target="#carouselPrincipal"
                    data-bs-slide-to="${index}"
                    class="${activo} mx-1 p-1 rounded-circle small-indicator"
                    aria-current="${activo ? 'true' : 'false'}"
                    aria-label="Slide ${index + 1}">
                </button>
            `;


            itemsHTML += `
                <div class="carousel-item ${activo}">
                    <div class="position-relative w-100">
                        <a href="/pages/product-detail.html?productId=${producto.id}" aria-label="Ver detalle del producto ${producto.name}" class="d-block">
                        <img src="${producto.image}" class="d-block mx-auto w-100" alt="${producto.name}">
                        </a>
                        <div class="position-absolute top-0 start-50 translate-middle-x d-flex justify-content-center align-items-center gap-2 bg-dark bg-opacity-50 text-white rounded px-3 py-1 mt-3" style="max-width: 90%;">
                            <h5 class="mb-0 text-truncate" style="flex-grow: 1; margin-bottom: 0;">${producto.name}</h5>
                            ${badgeOferta}
                        </div>
                    </div>
                </div>
            `;
        });

        $('#carouselPrincipal .carousel-indicators').html(indicadoresHTML);
        $('#carouselPrincipal .carousel-inner').html(itemsHTML);

    });

    function seleccionarProductosAleatorios(lista, cantidad) {
        const copia = [...lista];
        const resultado = [];

        while (resultado.length < cantidad && copia.length > 0) {
            const index = Math.floor(Math.random() * copia.length);
            resultado.push(copia.splice(index, 1)[0]);
        }
        return resultado;
    }
});
