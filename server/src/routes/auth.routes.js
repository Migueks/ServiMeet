// Rutas de autenticación: register y login (usuario logueado).

// Creo un router de Express
const router = require("express").Router();

// Importo los controladores de autenticación (registro, login y perfil del usuario autenticado)
const { register, login } = require("../controllers/auth.controller");

// Registro (creo usuario)
router.post("/register", register);

// Login (devuelve JWT)
router.post("/login", login);

module.exports = router;
