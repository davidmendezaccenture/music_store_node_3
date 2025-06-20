// auth.js - Este archivo gestiona la autenticación de usuarios, incluyendo funciones para iniciar sesión, cerrar sesión y validar credenciales.

document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    // Aquí iría la lógica de autenticación real
    console.log('Iniciando sesión con:', { email, password, rememberMe });
    
    // Simulación de login exitoso
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userEmail', email);
    
    // Cerrar modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
    modal.hide();
    
    // Actualizar UI
    updateAuthUI();
});

function updateAuthUI() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const loginButtons = document.querySelectorAll('[data-bs-target="#loginModal"]');
    
    if (isLoggedIn) {
        const userEmail = localStorage.getItem('userEmail');
        loginButtons.forEach(btn => {
            btn.innerHTML = `<i class="bi bi-person-fill"></i> ${userEmail.split('@')[0]}`;
            btn.classList.remove('btn-primary');
            btn.classList.add('btn-outline-light');
        });
    }
}

// Inicializar al cargar la página
document.addEventListener('DOMContentLoaded', updateAuthUI);