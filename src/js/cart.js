// Este archivo maneja la lógica de la cesta de la compra

// Actualizar contador del carrito
function updateCartCounter() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    document.getElementById('cartCounter').textContent = cart.reduce((total, item) => total + item.quantity, 0);
}

// Inicializar al cargar la página
document.addEventListener('DOMContentLoaded', updateCartCounter);