// Rutas de contacto: envío de mensajes desde el formulario.

// Creo un router de Express
const router = require("express").Router();

// Importo el controlador que crea el mensaje de contacto
const { createContactMessage } = require("../controllers/contact.controller");

// Envío de mensaje de contacto
router.post("/", createContactMessage);

module.exports = router;
