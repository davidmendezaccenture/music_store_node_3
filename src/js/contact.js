//logica pagina de contacto
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    
    // Validación al enviar el formulario
    contactForm.addEventListener('submit', function(event) {
        event.preventDefault();
        event.stopPropagation();
        
        // Validar todos los campos
        const isValid = validateForm();
        
        if (isValid) {
            // Simular envío (en producción sería una petición AJAX)
            alert('¡Gracias por tu mensaje! Nos pondremos en contacto contigo pronto.');
            contactForm.reset();
            
            // Quitar clases de invalid
            const invalidElements = contactForm.querySelectorAll('.is-invalid');
            invalidElements.forEach(el => el.classList.remove('is-invalid'));
        }
    });
    
    // Validación en tiempo real para campos obligatorios
    const requiredFields = contactForm.querySelectorAll('[required]');
    requiredFields.forEach(field => {
        field.addEventListener('input', function() {
            if (this.value.trim() !== '') {
                this.classList.remove('is-invalid');
            }
        });
    });
    
    // Validación personalizada para el teléfono
    const phoneField = document.getElementById('phone');
    if (phoneField) {
        phoneField.addEventListener('input', function() {
            if (this.value.trim() !== '' && !this.checkValidity()) {
                this.classList.add('is-invalid');
            } else {
                this.classList.remove('is-invalid');
            }
        });
    }
});

function validateForm() {
    const contactForm = document.getElementById('contactForm');
    let isValid = true;
    
    // Validar campos requeridos
    const requiredFields = contactForm.querySelectorAll('[required]');
    requiredFields.forEach(field => {
        if (field.value.trim() === '' || !field.checkValidity()) {
            field.classList.add('is-invalid');
            isValid = false;
        }
    });
    
    // Validar teléfono si tiene contenido
    const phoneField = document.getElementById('phone');
    if (phoneField && phoneField.value.trim() !== '' && !phoneField.checkValidity()) {
        phoneField.classList.add('is-invalid');
        isValid = false;
    }
    
    return isValid;
}