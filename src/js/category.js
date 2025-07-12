//Filtro por categorías
const categoriaBtn = document.getElementById('categoria');
if(categoriaBtn){
    categoriaBtn.addEventListener('change', function () {
    const categoria = this.value;
    document.querySelectorAll('[data-category]').forEach(card => {
        if (categoria === 'Todas' || card.getAttribute('data-category') === categoria) {
            card.style.display = '';
        } else {
            card.style.display = 'none';
        }
    });
});
}