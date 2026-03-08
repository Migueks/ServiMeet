// Creo el router de Express para definir las rutas de servicios.
const router = require("express").Router();

// Importo los controladores con la lógica de cada endpoint de solicitudes.
const {
  createRequest,
  getMyClientRequests,
  getMyProRequests,
  updateRequestStatus,
} = require("../controllers/requests.controller");

// Importo los middlewares de autenticación y autorización.
const isAuth = require("../middlewares/isAuth");
const hasRole = require("../middlewares/hasRole");

// Ruta para crear una nueva solicitud.
router.post("/", isAuth, hasRole("CLIENT"), createRequest);

// Ruta para obtener las solicitudes del cliente autenticado.
router.get(
  "/my-client-requests",
  isAuth,
  hasRole("CLIENT"),
  getMyClientRequests,
);

// Ruta para obtener las solicitudes recibidas por el profesional autenticado.
router.get(
  "/my-pro-requests",
  isAuth,
  hasRole("PRO", "ADMIN"),
  getMyProRequests,
);

// Ruta para actualizar el estado de una solicitud.
router.patch(
  "/:id/status",
  isAuth,
  hasRole("PRO", "ADMIN"),
  updateRequestStatus,
);

// Exporto el router para poder usarlo en la configuración principal de rutas.
module.exports = router;
