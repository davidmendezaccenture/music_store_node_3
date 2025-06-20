// Importamos los módulos necesarios
const express = require('express'); // Framework para crear el servidor web
const path = require('path'); // Módulo para trabajar con rutas de archivos
const fs = require('fs'); // Módulo para leer y escribir archivos
const bodyParser = require('body-parser'); // Middleware para leer el cuerpo (body) de las peticiones

const app = express(); // Creamos una instancia de la aplicación Express

// Middleware que permite recibir datos en formato JSON desde el frontend
app.use(bodyParser.json());

// Servimos archivos estáticos desde la carpeta 'src'
// Esto incluye HTML, CSS, JS del frontend
app.use(express.static(path.join(__dirname, 'src')));

// -----------------------------
//         API DE PRODUCTOS
// -----------------------------

// GET /api/products - Devuelve todos los productos desde el archivo products.json
app.get('/api/products', (req, res) => {
  const productsPath = path.join(__dirname, 'src/assets/data/products.json');

  fs.readFile(productsPath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error leyendo products.json', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }

    const products = JSON.parse(data); // Convertimos el contenido del archivo a JSON
    res.json(products); // Enviamos los productos como respuesta
  });
});

// -----------------------------
//        REGISTRO DE USUARIOS
// -----------------------------

// POST /api/register - Registra un nuevo usuario si no existe previamente
app.post('/api/register', (req, res) => {
  const { username, email, password } = req.body;

  // Validamos que todos los campos obligatorios estén presentes
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }

  const usersPath = path.join(__dirname, './backend/data/users.json');

  fs.readFile(usersPath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error leyendo users.json', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }

    let users = [];
    try {
      users = JSON.parse(data);
    } catch {
      users = [];
    }

    const exists = users.find(u => u.username === username || u.email === email);

    if (exists) {
      return res.status(409).json({ error: 'Usuario o email ya existe' });
    }

    // Generamos un id nuevo (auto-incremental)
    const newId = users.length > 0 ? users[users.length - 1].id + 1 : 1;

    const newUser = { id: newId, username, email, password };

    users.push(newUser); // Agregamos el nuevo usuario

    fs.writeFile(usersPath, JSON.stringify(users, null, 2), err => {
      if (err) {
        console.error('Error escribiendo users.json', err);
        return res.status(500).json({ error: 'Error interno del servidor' });
      }

      res.status(201).json({ message: 'Usuario registrado con éxito' });
    });
  });
});

// -----------------------------
//          LOGIN DE USUARIOS
// -----------------------------

// POST /api/login - Verifica credenciales del usuario
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }

  const usersPath = path.join(__dirname, './backend/data/users.json');

  fs.readFile(usersPath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error leyendo users.json', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }

    let users = [];
    try {
      users = JSON.parse(data);
    } catch {
      users = [];
    }

    const user = users.find(u => u.username === username && u.password === password);

    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Enviamos info sin password
    res.json({ 
      id: user.id,
      username: user.username,
      email: user.email,
      message: 'Login correcto'
    });
  });
});

// -----------------------------
//         GESTIÓN DEL CARRITO
// -----------------------------

// GET /api/cart/:user - Devuelve el carrito del usuario (o del guest si no se indica)
app.get('/api/cart/:user', (req, res) => {
  const user = req.params.user || 'guest'; // Obtenemos el usuario desde la ruta
  const cartsPath = path.join(__dirname, 'backend/data/carts.json');

  fs.readFile(cartsPath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error leyendo carts.json', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }

    const carts = JSON.parse(data);
    res.json({ cart: carts[user] || [] }); // Enviamos el carrito en una propiedad 'cart'
  });
});

// POST /api/cart - Guarda el carrito de un usuario
app.post('/api/cart', (req, res) => {
  const { user, cart } = req.body;

  if (!user || !cart) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }

  const cartsPath = path.join(__dirname, 'backend/data/carts.json');

  fs.readFile(cartsPath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error leyendo carts.json', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }

    const carts = JSON.parse(data);
    carts[user] = cart; // Guardamos o actualizamos el carrito del usuario

    fs.writeFile(cartsPath, JSON.stringify(carts, null, 2), err => {
      if (err) {
        console.error('Error escribiendo carts.json', err);
        return res.status(500).json({ error: 'Error interno del servidor' });
      }

      res.json({ message: 'Carrito guardado con éxito' });
    });
  });
});

// -----------------------------
//    SERVIR LA PÁGINA PRINCIPAL
// -----------------------------

// GET / - Devuelve el archivo index.html al acceder a la raíz del sitio
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'src/pages/index.html'));
});

// -----------------------------
//           PUERTO DEL SERVIDOR
// -----------------------------

// Puerto por defecto: 3000 (o el que defina la variable de entorno)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
