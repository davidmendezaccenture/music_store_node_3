//Scripts propios del index

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
