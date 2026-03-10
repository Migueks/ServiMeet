// Rutas de autenticación: register, login y "me" (usuario logueado).

// Creo un router de Express
const router = require("express").Router();

// Importo los controladores de autenticación (registro, login y perfil del usuario autenticado)
const { register, login } = require("../controllers/auth.controller");
// Importo el middleware que verifica el token y protege rutas privadas
const isAuth = require("../middlewares/isAuth");

// Registro (creo usuario)
router.post("/register", register);

// Login (devuelve JWT)
router.post("/login", login);

module.exports = router;
