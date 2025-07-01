document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('form-busqueda');

  // Función para hacer la búsqueda y mostrar resultados
  function buscarYMostrar(query, category) {
    fetch(`/buscar?q=${encodeURIComponent(query)}&category=${encodeURIComponent(category)}`)
      .then(res => res.json())
      .then(data => mostrarResultados(data))
      .catch(err => console.error('Error al obtener productos:', err));
  }

  // Detectamos si estamos en search.html
  const esSearchPage = window.location.pathname.endsWith('search.html');

  if (esSearchPage) {
    // En search.html hacemos búsqueda dinámica

    // 1. Interceptar submit para evitar recarga
    form.addEventListener('submit', e => {
      e.preventDefault();

      const query = form.q.value.trim();
      const category = form.category.value;

      buscarYMostrar(query, category);

      // Actualizar la URL en la barra sin recargar
      const newUrl = `${window.location.pathname}?q=${encodeURIComponent(query)}&category=${encodeURIComponent(category)}`;
      console.log('Nueva URL:', newUrl);
      window.history.replaceState(null, '', newUrl);
    });

    // 2. Si al cargar la página hay parámetros en la URL, hacer búsqueda inicial
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q') || '';
    const cat = params.get('category') || '';


      form.q.value = q;
      form.category.value = cat;
      buscarYMostrar(q, cat);

  }
});


function mostrarResultados(productos) {
  const contenedor = document.getElementById('resultados');
  if (!contenedor) {
    // Evitar error si no existe el contenedor en esta página
    return;
  }
  //Por defecto ordenamos por precio
    productos.sort((a, b) => {
    const precioA = a.offerPrice ?? a.price;
    const precioB = b.offerPrice ?? b.price;
    return precioA - precioB;
  });

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
