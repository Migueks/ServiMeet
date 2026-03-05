// Endpoints simples para comprobar que el backend funciona correctamente.

// Creo un router de Express
const router = require("express").Router();
// Importo la instancia única de Prisma para hacer consultas a MySQL desde las rutas.
const prisma = require("../config/prisma");

// Endpoint GET "/health"
router.get("/", (req, res) => {
  // Devuelvo un JSON con información básica de estado para comprobar que la API funciona
  res.json({
    status: "ok", // estado simple
    service: "ServiMeet API", // nombre del servicio
    timestamp: new Date().toISOString(), // fecha/hora actual en formato ISO
  });
});

// Endpoint GET "/health/db" -> Compruebo que Prisma consulta MySQL
router.get("/db", async (req, res) => {
  try {
    // Hago una consulta sencilla: contar cuántos usuarios hay en la tabla User
    const userCount = await prisma.user.count();
    // Si la consulta funciona, devuelvo estado OK e incluyo el recuento como prueba
    res.json({
      status: "ok",
      db: "connected",
      userCount,
    });
  } catch (error) {
    // Si falla (error de conexión, modelo inexistente, credenciales, etc.), devuelvo error 500
    res.status(500).json({
      status: "error",
      db: "not connected",
      message: error.message,
    });
  }
});

// Exporto el router para poder importarlo y montarlo en el servidor principal
module.exports = router;
