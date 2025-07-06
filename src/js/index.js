//Scripts propios del index

//Guardamos página actual
document.addEventListener('DOMContentLoaded', () => {
    localStorage.setItem('ultimaPagina', window.location.pathname + window.location.search);
});

// Añadir el año actual automáticamente
document.getElementById('currentYear').textContent = new Date().getFullYear();


