document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const query = params.get('q') || '';
  const category = params.get('category') || '';

  fetch(`/buscar?q=${encodeURIComponent(query)}&category=${encodeURIComponent(category)}`)
    .then(res => res.json())
    .then(data => mostrarResultados(data))
    .catch(err => console.error('Error al obtener productos:', err));
});

function mostrarResultados(productos) {
  const contenedor = document.getElementById('resultados');
  contenedor.innerHTML = ''; // Limpia resultados anteriores

  if (productos.length === 0) {
    contenedor.innerHTML = '<p>No se encontraron productos.</p>';
    return;
  }

  productos.forEach(producto => {
    const col = document.createElement('div');
    col.className = 'col';
    col.setAttribute('data-category', producto.category);

    col.innerHTML = `
      <div class="card h-100" role="article">
        <img src="${producto.image.replace('..', '')}" class="card-img-top" alt="${producto.name}" />
        <div class="card-body">
          <div class="texto-precio">
            <h2 class="card-title h5">${producto.name}</h2>
            <p class="card-text">${producto.description}</p>
            <p class="card-text fw-bold precio" aria-label="Precio">${producto.offerPrice ?? producto.price}&nbsp;€</p>
          </div>
          <div class="mt-auto">
            <button class="btn btn-primary agregar-carrito" aria-label="Añadir ${producto.name} a la cesta" data-id="${producto.id}">
              Añadir a la cesta
            </button>
          </div>
        </div>
      </div>
    `;

    contenedor.appendChild(col);
  });
}
