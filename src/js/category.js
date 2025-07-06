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