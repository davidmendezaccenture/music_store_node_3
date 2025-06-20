const express = require('express');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'src')));

// API para productos

// API para login y registro (usuarios en archivo JSON)

// Registrar usuario

// Login

// --- ENDPOINTS PARA EL CARRITO ---

// Obtener carrito del usuario

// Guardar carrito del usuario

// Redirigir la raíz al index.html de pages
app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, 'src/pages/index.html'));
});

// Puerto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});