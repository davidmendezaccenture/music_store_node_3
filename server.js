const express = require("express");
const path = require("path");
const fs = require("fs");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const app = express();
app.use(bodyParser.json());

// Servir archivos estáticos

app.use(express.static(path.join(__dirname, "src")));

// API para productos
// Obtener todos los productos
app.get("/api/products", (req, res) => {
  // Leer el archivo de productos (catálogo)
  fs.readFile(
    path.join(__dirname, "src/assets/data/products.json"),
    "utf8",
    (err, data) => {
      // Si ocurre un error al leer el archivo, devolver error 500
      if (err) {
        console.error("Error al leer el archivo de productos:", err);
        return res.status(500).json({ error: "Error interno del servidor" });
      }
      try {
        // Intentar parsear el JSON de productos
        const products = JSON.parse(data);
        // Devolver el catálogo de productos como respuesta JSON
        res.json(products);
      } catch (parseError) {
        // Si el JSON está corrupto, devolver error
        console.error("Error al parsear el JSON de productos:", parseError);
        res
          .status(500)
          .json({ error: "Error al procesar los datos de productos" });
      }
    }
  );
});

// API para login y registro (usuarios en archivo JSON)
// Registrar un nuevo usuario
app.post("/api/register", (req, res) => {
  // Extraer los datos del body de la petición
  const { username, password, email, birthdate, phone, postalcode, city } = req.body;

  // Validar que todos los campos obligatorios estén presentes
  if (!username || !password || !email) {
    return res.status(400).json({
      error: "Los campos username, password y email son obligatorios.",
    });
  }

  // Validar formato de email simple
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res
      .status(400)
      .json({ error: "El Email no tiene un formato válido." });
  }

  // Ruta al archivo donde se almacenan los usuarios
  const usersPath = path.join(__dirname, "backend/data/users.json");

  // Leer el archivo de usuarios
  fs.readFile(usersPath, "utf8", (err, data) => {
    // Si ocurre un error distinto a que el archivo no exista, devolver error
    if (err && err.code !== "ENOENT") {
      console.error("Error al leer el archivo de usuarios:", err);
      return res.status(500).json({ error: "Error interno del servidor" });
    }

    let users = [];
    if (data) {
      try {
        // Intentar parsear el JSON de usuarios
        users = JSON.parse(data);
      } catch (parseError) {
        // Si el JSON está corrupto, devolver error
        return res
          .status(500)
          .json({ error: "Error al procesar los datos de usuarios" });
      }
    }

    // Comprobar si el username o email ya existen en la base de datos
    const exists = users.some(
      (u) => u.username === username || u.email === email
    );
    if (exists) {
      return res.status(409).json({ error: "El usuario o email ya existen." });
    }

    // Añadir el nuevo usuario al array
    bcrypt.hash(password, 10, (err, hash) => {
      if (err) {
        return res
          .status(500)
          .json({ error: "Error al encriptar la contraseña." });
      }
      users.push({
        username,
        password: hash,
        email,
        birthdate,
        phone,
        postalcode,
        city
      });

      // Guardar el array actualizado en el archivo
      fs.writeFile(usersPath, JSON.stringify(users, null, 2), (err) => {
        if (err) {
          return res
            .status(500)
            .json({ error: "No se pudo guardar el usuario." });
        }
        // Responder con éxito
        res.status(201).json({ message: "Usuario registrado correctamente." });
      });
    });
  });
});

// Login
app.post("/api/login", (req, res) => {
  // Extraer los datos del body de la petición
  const { username, email, password } = req.body;

  // Validar que los campos obligatorios estén presentes
  if ((!username && !email) || !password) {
    return res.status(400).json({
      error: "Debes indicar usuario o email y la contraseña.",
    });
  }

  // // Validar formato de email simple, elimino al actualizar usando tambien nombre de usuario
  // const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  // if (!emailRegex.test(email)) {
  //   return res
  //     .status(400)
  //     .json({ error: "El Email no tiene un formato válido." });
  // }

  // Ruta al archivo donde se almacenan los usuarios
  const usersPath = path.join(__dirname, "backend/data/users.json");

  // Leer el archivo de usuarios
  fs.readFile(usersPath, "utf8", (err, data) => {
    // Si ocurre un error distinto a que el archivo no exista, devolver error
    if (err && err.code !== "ENOENT") {
      console.error("Error al leer el archivo de usuarios:", err);
      return res.status(500).json({ error: "Error interno del servidor" });
    }

    if (!data) {
      return res.status(404).json({ error: "No hay usuarios registrados." });
    }

    let users = [];
    try {
      // Intentar parsear el JSON de usuarios
      users = JSON.parse(data);
    } catch (parseError) {
      // Si el JSON está corrupto, devolver error
      return res
        .status(500)
        .json({ error: "Error al procesar los datos de usuarios" });
    }

    // Buscar el usuario por email o nombre de usuario y contraseña
    const user = users.find(
      (u) =>
        (username && u.username === username) || (email && u.email === email)
    );
    if (!user) {
      return res.status(401).json({ error: "Credenciales inválidas." });
    }

    bcrypt.compare(password, user.password, (err, result) => {
      if (err) {
        return res
          .status(500)
          .json({ error: "Error al verificar la contraseña." });
      }
      if (!result) {
        return res.status(401).json({ error: "Credenciales inválidas." });
      }
      // Si las credenciales son correctas, devolver el usuario
      res.status(200).json({
        message: "Login exitoso.",
        user: {
          username: user.username,
          email: user.email,
          phone: user.phone,
          birthdate: user.birthdate,
          postalcode: user.postalcode,
          city: user.city,
        },
      });
    });
  });
});

// --- ENDPOINTS PARA RECUPERAR CONTRASEÑA ---

// Endpoint para recuperación de contraseña
app.post("/api/forgot-password", (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "El correo es obligatorio." });
  }

  // Ruta al archivo donde se almacenan los usuarios
  const usersPath = path.join(__dirname, "backend/data/users.json");

  fs.readFile(usersPath, "utf8", (err, data) => {
    if (err) {
      return res.status(500).json({ error: "Error interno del servidor." });
    }
    let users = [];
    if (data) {
      try {
        users = JSON.parse(data);
      } catch (parseError) {
        return res.status(500).json({ error: "Error al procesar los datos de usuarios." });
      }
    }

    const user = users.find(u => u.email === email);
    // Por seguridad, siempre respondemos igual aunque el email no exista
    // Aquí deberías generar un token y enviar el email real
    return res.status(200).json({
      message: "Si el correo existe, recibirás un enlace para restablecer tu contraseña."
    });
  });
});

// --- ENDPOINTS PARA EL CARRITO ---

// Obtener carrito del usuario
app.get("/api/cart", (req, res) => {
  const user = req.query.user || "guest"; // Por defecto, usuario invitado

  // Ruta al archivo donde se almacenan los carritos
  const cartsPath = path.join(__dirname, "backend/data/carts.json");
  // Leer el archivo de carritos
  fs.readFile(cartsPath, "utf8", (err, data) => {
    // Si ocurre un error al leer el archivo, devuelve error 500
    if (err) {
      console.error("Error al leer el archivo de carritos:", err);
      return res.status(500).json({ error: "Error interno del servidor" });
    }

    let carts = {};
    if (data) {
      try {
        // Intentar parsear el JSON de carritos
        carts = JSON.parse(data);
      } catch (parseError) {
        // Si el JSON está corrupto, devolver error
        return res
          .status(500)
          .json({ error: "Error al procesar los datos del carrito" });
      }
    }

    // Obtener el carrito del usuario (o array vacío si no existe)
    const cart = carts[user] || [];
    // Devolver el carrito del usuario
    res.status(200).json(cart);
  });
});

// Guardar carrito del usuario
app.post("/api/cart", (req, res) => {
  const user = req.body.user || "guest"; // Por defecto, usuario invitado
  const items = req.body.items || []; // Items del carrito
  // Validar que los items sean un array
  if (!Array.isArray(items)) {
    return res.status(400).json({ error: "Los items deben ser un array." });
  }

  // Ruta al archivo donde se almacenan los carritos
  const cartsPath = path.join(__dirname, "backend/data/carts.json");
  // Leer el archivo de carritos
  fs.readFile(cartsPath, "utf8", (err, data) => {
    if (err && err.code !== "ENOENT") {
      console.error("Error al leer el archivo de carritos:", err);
      return res.status(500).json({ error: "Error interno del servidor" });
    }

    let carts = {};
    if (data) {
      try {
        // Intentar parsear el JSON de carritos
        carts = JSON.parse(data);
      } catch (parseError) {
        // Si el JSON está corrupto, devolver error
        return res
          .status(500)
          .json({ error: "Error al procesar los datos del carrito" });
      }
    }

    // Actualizar el carrito del usuario
    carts[user] = items;
    // Guardar el carrito actualizado en el archivo
    fs.writeFile(cartsPath, JSON.stringify(carts, null, 2), (err) => {
      if (err) {
        console.error("Error al guardar el carrito:", err);
        return res
          .status(500)
          .json({ error: "No se pudo guardar el carrito." });
      }
      // Responder con éxito
      res.status(200).json({ message: "Carrito guardado correctamente." });
    });
  });
});

// Redirigir la raíz al index.html de pages
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "src/pages/index.html"));
});

module.exports = app; // Exportar la app para pruebas
// Esto permite que se pueda importar en tests u otros módulos si es necesario

// Para ejecutar el servidor directamente desde este archivo
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
  });
}

//Búsquedas dentro de la web
// Ruta de búsqueda
const productosPath = path.join(
  __dirname,
  "src",
  "assets",
  "data",
  "products.json"
);
const reseñasPath = path.join(
  __dirname,
  "src",
  "assets",
  "data",
  "clients.json"
); // <- tu archivo real

app.get("/buscar", (req, res) => {
  const query = req.query.q?.toLowerCase() || "";
  const category = req.query.category?.toLowerCase() || "";

  fs.readFile(productosPath, "utf8", (errProductos, dataProductos) => {
    if (errProductos) return res.status(500).send("Error al leer productos");

    fs.readFile(reseñasPath, "utf8", (errReviews, dataReviews) => {
      if (errReviews) return res.status(500).send("Error al leer opiniones");

      try {
        const productos = JSON.parse(dataProductos);
        const reseñas = JSON.parse(dataReviews);

        // Calcular promedio de estrellas por producto
        const ratingMap = {};
        reseñas.forEach((r) => {
          if (!ratingMap[r.producto]) {
            ratingMap[r.producto] = { total: 0, count: 0 };
          }
          const estrellasTexto = r.estrellas || "";
          const estrellasNum = estrellasTexto
            .split("")
            .filter((e) => e === "⭐").length;
          ratingMap[r.producto].total += estrellasNum;

          ratingMap[r.producto].count++;
        });

        // Añadir campo rating a cada producto
        productos.forEach((p) => {
          const datos = ratingMap[p.id];
          if (datos) {
            p.rating = Math.round(datos.total / datos.count);
          } else {
            p.rating = 0;
          }
        });

        // Filtrar por búsqueda
        const resultados = productos.filter((p) => {
          const nombreIncluye = !query || p.name?.toLowerCase().includes(query);
          const categoriaCoincide =
            !category || p.category?.toLowerCase() === category;
          return nombreIncluye && categoriaCoincide;
        });

        res.json(resultados);
      } catch (e) {
        res.status(500).send("Error al procesar datos");
      }
    });
  });
});
//Endpoint de cupones de descuento
app.get('/api/coupons', (req, res) => {
  const rutaCupones = path.join(__dirname, 'src', 'assets', 'data', 'coupons.json');
  console.log('Enviando archivo:', rutaCupones);
  res.sendFile(rutaCupones, err => {
    if (err) {
      console.error('Error enviando coupons.json:', err);
      res.status(500).json({ error: 'No se pudo cargar el archivo de cupones' });
    }
  });
});

//Endpoint de pedidos
// Obtener pedidos de un usuario
app.get("/api/orders", (req, res) => {
  const username = req.query.user;

  const ordersPath = path.join(__dirname, 'src', 'assets', 'data', 'orders.json');
  fs.readFile(ordersPath, "utf8", (err, data) => {
    if (err && err.code !== "ENOENT") {
      console.error("Error al leer pedidos:", err);
      return res.status(500).json({ error: "Error interno del servidor." });
    }

    let orders = [];
    if (data) {
      try {
        orders = JSON.parse(data);
      } catch (parseError) {
        return res.status(500).json({ error: "Error al procesar los pedidos." });
      }
    }

    if (username) {
      const userOrders = orders.filter(order => order.user === username);
      return res.json(userOrders);
    }

    // Si no se pasa ?user, devolver todos
    res.json(orders);
  });
});


// Crear o modificar un pedido
app.post("/api/orders", (req, res) => {
  const { id, user, items, precio, localizador, status } = req.body;

  if (!user || !Array.isArray(items)) {
    return res.status(400).json({ error: "Faltan datos: usuario o items inválidos." });
  }

  const ordersPath = path.join(__dirname, 'src', 'assets', 'data', 'orders.json');

  fs.readFile(ordersPath, "utf8", (err, data) => {
    if (err && err.code !== "ENOENT") {
      console.error("Error al leer pedidos:", err);
      return res.status(500).json({ error: "Error interno del servidor." });
    }

    let orders = [];
    if (data) {
      try {
        orders = JSON.parse(data);
      } catch (parseError) {
        return res.status(500).json({ error: "Error al procesar los pedidos." });
      }
    }

    if (id) {
      // Modificar pedido existente
      const index = orders.findIndex(order => order.id === id);
      if (index !== -1) {
        orders[index] = { ...orders[index], items, status: status || orders[index].status, localizador: localizador || orders[index].localizador };

        fs.writeFile(ordersPath, JSON.stringify(orders, null, 2), err => {
          if (err) {
            console.error("Error al guardar pedidos:", err);
            return res.status(500).json({ error: "No se pudo guardar el pedido." });
          }
          // Devolver el pedido modificado completo
          res.status(200).json(orders[index]);
        });
      } else {
        return res.status(404).json({ error: "Pedido no encontrado para modificar." });
      }
    } else {
      // Crear nuevo pedido
      const newOrder = {
        id: Date.now(),
        user,
        items,
        precio,
        localizador,
        status: status || ((user.metodoPago === 'transferencia' || user.metodoPago === 'bizum') ? 'pendiente' : 'pagado'),
        createdAt: new Date().toISOString()
      };
      orders.push(newOrder);

      fs.writeFile(ordersPath, JSON.stringify(orders, null, 2), err => {
        if (err) {
          console.error("Error al guardar pedidos:", err);
          return res.status(500).json({ error: "No se pudo guardar el pedido." });
        }
        // Devolver datos relevantes del nuevo pedido
        res.status(200).json({
          message: "Pedido guardado correctamente.",
          id: newOrder.id,
          createdAt: newOrder.createdAt,
          localizador: newOrder.localizador || null,
          status: newOrder.status
        });
      });
    }
  });
});
