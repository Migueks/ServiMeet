// Endpoints simples para comprobar que el backend funciona correctamente.

// Creo un router de Express.
const router = require("express").Router();

// Importo la instancia única de Prisma para hacer consultas a MySQL desde las rutas.
const prisma = require("../config/prisma");

// Endpoint GET "/health"
// Sirve para comprobar de forma rápida que la API está levantada.
router.get("/", (req, res) => {
  // Devuelvo un JSON con información básica de estado.
  return res.json({
    status: "ok",
    service: "ServiMeet API",
    timestamp: new Date().toISOString(),
  });
});

// Endpoint GET "/health/db"
// Solo lo expongo en desarrollo o si se habilita explícitamente por variable de entorno.
router.get("/db", async (req, res) => {
  // En producción oculto esta ruta salvo que yo quiera activarla manualmente.
  if (
    process.env.NODE_ENV === "production" &&
    process.env.ENABLE_DB_HEALTHCHECK !== "true"
  ) {
    return res.status(404).json({
      message: "Ruta no encontrada",
    });
  }

  try {
    // Hago una comprobación mínima contra la base de datos.
    // No expongo datos reales como número de usuarios ni información interna.
    await prisma.$queryRaw`SELECT 1`;

    return res.json({
      status: "ok",
      db: "connected",
    });
  } catch (error) {
    // Muestro el error real solo en servidor para depuración.
    console.error(
      "Error al comprobar la conexión con la base de datos:",
      error,
    );

    return res.status(500).json({
      status: "error",
      db: "not connected",
      message: "No se pudo comprobar la conexión con la base de datos",
    });
  }
});

// Exporto el router para poder importarlo y montarlo en el servidor principal.
module.exports = router;
