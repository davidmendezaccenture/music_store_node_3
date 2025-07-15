// ✅ Obtiene el parámetro productId de la URL
function getProductIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return parseInt(params.get('productId'));
}

// ✅ Relación categoría → página
const categoriasPorPagina = {
  'guitar.html': ['acoustic-guitars', 'classical-guitars', 'electric-guitars', 'basses'],
  'drums.html': ['acoustic-drums', 'electronic-drums', 'set-platillos'],
  'keyboard.html': ['keyboards', 'synthesizers']
};

// ✅ Devuelve la página según la categoría
function obtenerPaginaPorCategoria(categoria) {
  for (const [pagina, categorias] of Object.entries(categoriasPorPagina)) {
    if (categorias.includes(categoria)) {
      return `/pages/${pagina}`;
    }
  }
  return '/pages/index.html'; // Fallback
}

// ✅ Carga y muestra el detalle del producto dinámicamente
async function loadProductDetail() {
  const id = getProductIdFromUrl();

  if (!id) return;

  try {
    const res = await fetch("../assets/data/products.json");
    const products = await res.json();
    const product = products.find((p) => p.id === id);

    if (!product) {
      document.getElementById("product-detail-container").innerHTML = `
        <div class="alert alert-danger">Producto no encontrado.</div>
      `;
      return;
    }

    // ✅ Renderizado del detalle del producto
    document.getElementById("product-detail-container").innerHTML = `
  <div class="card d-flex flex-column flex-md-row shadow-lg align-items-center align-md-items-start" style="max-width:900px;margin:auto;">
    <div class="d-flex align-items-stretch position-relative p-2" style="width:100%; max-width:300px; min-width:auto;">
      <img src="${product.image}" alt="${product.name}" class="img-fluid rounded" style="object-fit:cover; height:100%; max-width:300px; width:100%;">
      <button type="button" class="btn btn-light btn-sm position-absolute top-0 end-0 m-3" id="btnZoomImg" aria-label="Ampliar imagen">
        <i class="bi bi-search"></i>
      </button>
    </div>
    <div class="card-body d-flex flex-column justify-content-between">
      <div>
        <span class="badge bg-secondary mb-2 text-capitalize">${product.category.replace(/-/g, " ")}</span>
        <h2 class="card-title text-center">${product.name}</h2>
        <h3 class="text-primary fw-bold mb-2 text-center text-md-start" style="font-size:2rem;">
          <span class="fs-5 text-decoration-line-through text-muted ms-2">${product.price.toFixed(2)} €</span>
          ${
            product.offerPrice && product.offerPrice !== product.price
              ? product.offerPrice.toFixed(2) + " €"
              : ""
          }
        </h3>
        <h6 class="fw-bold mt-3 text-center text-md-start">Descripción</h6>
        <p class="card-text text-center text-md-start">${product.description}</p>
      </div>
      <div>
        <div class="d-flex gap-2 mb-3 justify-content-center justify-content-md-start">
          <button id="btnAgregarAlCarrito" class="btn btn-primary agregar-carrito" aria-label="Añadir ${product.name} a la cesta" data-id="${product.id}"><i class="bi bi-cart"></i>
            Añadir a la cesta
          </button>
          <a href="#" class="btn btn-outline-secondary boton-detalle" id="seguir-comprando"><i class="bi bi-bag"></i>
 Seguir comprando</a>
        </div>
        <div class="d-flex gap-4 mt-2 align-items-center justify-content-center justify-content-md-start">
          <span class="d-flex align-items-center gap-2"><i class="bi bi-truck fs-4 text-primary"></i><small>Envío gratuito</small></span>
          <span class="d-flex align-items-center gap-2"><i class="bi bi-arrow-repeat fs-4 text-primary"></i><small>Devolución fácil</small></span>
          <span class="d-flex align-items-center gap-2"><i class="bi bi-shield-check fs-4 text-primary"></i><small>Pago seguro</small></span>
        </div>
      </div>
    </div>
  </div>
    `;

    // ✅ Asignamos el enlace correcto al botón "Seguir comprando"
    const enlace = document.getElementById("seguir-comprando");
    if (enlace) {
      const ultimaPagina = localStorage.getItem("paginaProducto") || obtenerPaginaPorCategoria(product.category);
  
    // Reemplaza el comportamiento por navegación controlada
    enlace.addEventListener("click", (e) => {
      e.preventDefault(); // Previene navegación por defecto del <a>
      //Para indicar que venimos de product-details y recargar filtros en search
      localStorage.setItem('mantenerFiltros', 'true');
      window.location.href = ultimaPagina; // Navega a la URL guardada
    });
  }


    // ✅ Añadimos el event listener para agregar al carrito
    const btn = document.getElementById("btnAgregarAlCarrito");
    if (btn) {
      btn.addEventListener("click", () => {
        if (typeof addToCart === "function") {
          addToCart(product.id);
        } else {
          console.error("❌ No se encontró la función global addToCart.");
        }
      });
    }
  } catch (error) {
    console.error("❌ Error cargando producto:", error);
    document.getElementById("product-detail-container").innerHTML = `
      <div class="alert alert-danger">Error al cargar el producto.</div>
    `;
  }

  // ✅ Añado modal para ampliar imagen
    document.addEventListener("click", function (e) {
      // Detecta clic en el botón de la lupa
      if (e.target.closest("#btnZoomImg")) {
        // Obtiene la ruta de la imagen mostrada en la card
        const imgSrc = document.querySelector(
          "#product-detail-container img"
        ).src;
        // Asigna la ruta al modal
        document.getElementById("imgZoomModal").src = imgSrc;
        // Muestra el modal usando Bootstrap
        const modal = new bootstrap.Modal(
          document.getElementById("modalZoomImg")
        );
        modal.show();
      }
    });

}

// ✅ Ejecutamos al cargar la página
document.addEventListener('DOMContentLoaded', loadProductDetail);