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
    const res = await fetch('../assets/data/products.json');
    const products = await res.json();
    const product = products.find(p => p.id === id);

    if (!product) {
      document.getElementById('product-detail-container').innerHTML = `
        <div class="alert alert-danger">Producto no encontrado.</div>
      `;
      return;
    }

    // ✅ Renderizado del detalle del producto
    document.getElementById("product-detail-container").innerHTML = `
      <div class="card flex-row shadow-lg" style="max-width:900px;margin:auto;">
        <div class="d-flex align-items-stretch" style="width:300px;min-width:300px;">
          <img src="${product.image}" alt="${product.name}" class="img-fluid rounded-start" style="object-fit:cover;height:100%;width:100%;">
        </div>
        <div class="card-body d-flex flex-column justify-content-between">
          <div>
            <span class="badge bg-secondary mb-2 text-capitalize">${product.category.replace(/-/g, " ")}</span>
            <h2 class="card-title">${product.name}</h2>
            <h3 class="text-primary fw-bold mb-2" style="font-size:2rem;">
              ${
                product.offerPrice && product.offerPrice !== product.price
                  ? "€" + product.offerPrice.toFixed(2)
                  : ""
              }
              <span class="fs-5 text-decoration-line-through text-muted ms-2">€${product.price.toFixed(2)}</span>
            </h3>
            <h6 class="fw-bold mt-3">Descripción</h6>
            <p class="card-text">${product.description}</p>
          </div>
          <div>
            <div class="d-flex gap-2 mb-3">
              <button id="btnAgregarAlCarrito" class="btn btn-primary" aria-label="Añadir ${product.name} a la cesta" data-id="${product.id}">
                Añadir a la cesta
              </button>
              <a href="#" class="btn btn-outline-dark" id="seguir-comprando">Seguir comprando</a>
            </div>
            <div class="d-flex gap-4 mt-2 align-items-center">
              <span><i class="bi bi-truck fs-4 text-primary"></i><br><small>Envío gratuito</small></span>
              <span><i class="bi bi-arrow-repeat fs-4 text-primary"></i><br><small>Devolución fácil</small></span>
              <span><i class="bi bi-shield-check fs-4 text-primary"></i><br><small>Pago seguro</small></span>
            </div>
          </div>
        </div>
      </div>
    `;

    // ✅ Asignamos el enlace correcto al botón "Seguir comprando"
  const enlace = document.getElementById('seguir-comprando');
if (enlace) {
  const ultimaPagina = localStorage.getItem('ultimaPagina');
  enlace.href = ultimaPagina || obtenerPaginaPorCategoria(product.category);
}

    // ✅ Añadimos el event listener para agregar al carrito
    const btn = document.getElementById('btnAgregarAlCarrito');
    if (btn) {
      btn.addEventListener('click', () => {
        if (typeof addToCart === 'function') {
          addToCart(product.id);
        } else {
          console.error('❌ No se encontró la función global addToCart.');
        }
      });
    }

  } catch (error) {
    console.error("❌ Error cargando producto:", error);
    document.getElementById('product-detail-container').innerHTML = `
      <div class="alert alert-danger">Error al cargar el producto.</div>
    `;
  }
}

// ✅ Ejecutamos al cargar la página
document.addEventListener('DOMContentLoaded', loadProductDetail);