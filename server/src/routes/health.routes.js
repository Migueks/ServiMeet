// src/routes/health.routes.js
// Endpoint simple para comprobar que el backend funciona correctamente.

// Creo un router de Express
const router = require("express").Router();

// Endpoint GET "/" (se usará como /health)
router.get("/", (req, res) => {
  // Devuelvo un JSON con información básica de estado para comprobar que la API funciona
  res.json({
    status: "ok", // estado simple
    service: "ServiMeet API", // nombre del servicio
    timestamp: new Date().toISOString(), // fecha/hora actual en formato ISO
  });
});

// Exporto el router para poder importarlo y montarlo en el servidor principal
module.exports = router;
