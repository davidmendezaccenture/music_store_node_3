document.addEventListener('DOMContentLoaded', () => {
  // Guardamos la última búsqueda

  const form = document.getElementById('form-busqueda');
  const esSearchPage = window.location.pathname.endsWith('search.html');

  const precioMinInput = document.getElementById('precio-min');
  const precioMaxInput = document.getElementById('precio-max');
  const ordenPrecioSelect = document.getElementById('orden-precio');
  const ordenValoracionSelect = document.getElementById('orden-valoracion');

  function buscarYMostrar(query, category) {
    fetch(`/buscar?q=${encodeURIComponent(query)}&category=${encodeURIComponent(category)}`)
      .then(res => res.json())
      .then(productos => {
        const estrellasSeleccionadas = obtenerEstrellasSeleccionadas();
        const minPrecio = parseFloat(precioMinInput.value);
        const maxPrecio = parseFloat(precioMaxInput.value);

        // Filtrado combinado por estrellas y precio
        let productosFiltrados = productos.filter(producto => {
          const ratingOk = estrellasSeleccionadas.length === 0 || estrellasSeleccionadas.includes(producto.rating);
          const precio = producto.offerPrice ?? producto.price;
          const precioOk = precio >= minPrecio && precio <= maxPrecio;

          return ratingOk && precioOk;
        });

        mostrarResultados(productosFiltrados);
      })
      .catch(err => console.error('Error al obtener productos:', err));
  }

  function obtenerEstrellasSeleccionadas() {
    const checkboxes = document.querySelectorAll('#filtro-estrellas input[type="checkbox"]');
    return Array.from(checkboxes)
      .filter(cb => cb.checked)
      .map(cb => parseInt(cb.value));
  }

  function mostrarResultados(productos) {
    const contenedor = document.getElementById('resultados');
    if (!contenedor) return;

    // Ordenar primero por precio y luego por valoraciones según los selectores
    productos.sort((a, b) => {
      const precioA = a.offerPrice ?? a.price;
      const precioB = b.offerPrice ?? b.price;

      let ordenPrecio;
      if (ordenPrecioSelect.value === 'asc') {
        ordenPrecio = precioA - precioB;
      } else {
        ordenPrecio = precioB - precioA;
      }

      if (ordenPrecio !== 0) {
        return ordenPrecio;
      }

      // Si precios iguales, ordenar por valoración
      if (ordenValoracionSelect.value === 'asc') {
        return a.rating - b.rating; // menor a mayor
      } else {
        return b.rating - a.rating; // mayor a menor
      }
    });

    contenedor.innerHTML = '';

    if (productos.length === 0) {
      contenedor.innerHTML = '<p class="no-encontrado">No se encontraron productos.</p>';
      return;
    }

    productos.forEach(producto => {
      const col = document.createElement('div');
      col.className = 'col producto-animado';  // añadida clase

      col.setAttribute('data-category', producto.category);

      const estrellas = '★'.repeat(producto.rating) + '☆'.repeat(5 - producto.rating);

      col.innerHTML = `
        <div class="card h-100" role="article">
          <img src="${producto.image.replace('..', '')}" class="card-img-top" alt="${producto.name}" />
          <div class="card-body">
            <div class="texto-precio">
              <h2 class="card-title h5">${producto.name}</h2>
              <p class="card-text">${producto.description}</p>
              <p class="card-text fw-bold precio" aria-label="Precio">${producto.offerPrice ?? producto.price}&nbsp;€</p>
              <p class="valoracion" aria-label="Valoración del producto">${estrellas}</p>
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

      // Pequeño delay para activar la animación
      setTimeout(() => {
        col.classList.add('visible');
      }, 10);
    });
  }

  if (esSearchPage) {
    form.addEventListener('submit', e => {
      e.preventDefault();

      const query = form.q.value.trim();
      const category = form.category.value;

      buscarYMostrar(query, category);

      const newUrl = `${window.location.pathname}?q=${encodeURIComponent(query)}&category=${encodeURIComponent(category)}`;
      window.history.replaceState(null, '', newUrl);
      // Guardamos la última búsqueda para volver desde el carrito
      localStorage.setItem('ultimaPagina', newUrl);
    });

    const params = new URLSearchParams(window.location.search);
    const q = params.get('q') || '';
    const cat = params.get('category') || '';

    form.q.value = q;
    form.category.value = cat;
    buscarYMostrar(q, cat);
  }

  const estrellaCheckboxes = document.querySelectorAll('#filtro-estrellas input[type="checkbox"]');
  estrellaCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', () => {
      const query = form.q.value.trim();
      const category = form.category.value;
      buscarYMostrar(query, category);
    });
  });

  // Filtrado y actualización por precio
  precioMinInput.addEventListener('input', actualizarYFiltrar);
  precioMaxInput.addEventListener('input', actualizarYFiltrar);

  // Ordenar por precio al cambiar el selector
  ordenPrecioSelect.addEventListener('change', () => {
    const query = form.q.value.trim();
    const category = form.category.value;
    buscarYMostrar(query, category);
  });

  // Ordenar por valoración al cambiar el selector
  ordenValoracionSelect.addEventListener('change', () => {
    const query = form.q.value.trim();
    const category = form.category.value;
    buscarYMostrar(query, category);
  });

  function actualizarYFiltrar() {
    document.getElementById('min-valor').textContent = precioMinInput.value;
    document.getElementById('max-valor').textContent = precioMaxInput.value;

    const query = form.q.value.trim();
    const category = form.category.value;
    buscarYMostrar(query, category);
  }
});
