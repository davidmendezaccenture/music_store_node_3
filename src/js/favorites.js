// favorites.js
$(document).ready(function() {
    // Función para añadir/eliminar de favoritos
    window.addToFavorites = function(id, name, price, image) {
        const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        const existingIndex = favorites.findIndex(item => item.id === id);

        if (existingIndex >= 0) {
            favorites.splice(existingIndex, 1);
        } else {
            favorites.push({
                id: id,
                name: name,
                price: price,
                image: image
            });
        }

        localStorage.setItem('favorites', JSON.stringify(favorites));
        updateFavoritesCounter();
        return existingIndex < 0; // Devuelve true si se añadió, false si se eliminó
    };

    // Inicializar
    if (!localStorage.getItem('favorites')) {
        localStorage.setItem('favorites', JSON.stringify([]));
    }
    updateFavoritesCounter();
});