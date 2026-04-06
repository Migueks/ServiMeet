// Creo un router de Express.
const router = require("express").Router();

// Importo los controladores del módulo admin.
const {
  getAllUsers,
  toggleUserBlocked,
  getAllServicesAdmin,
  toggleServiceActive,
  getAllRequestsAdmin,
  getAllReviewsAdmin,
  toggleReviewVisibility,
  getAllContactMessagesAdmin,
} = require("../controllers/admin.controller");

// Importo middlewares de autenticación y autorización.
const isAuth = require("../middlewares/isAuth");
const hasRole = require("../middlewares/hasRole");

// Protejo todas las rutas de este router.
// Primero compruebo que el usuario esté autenticado y después que tenga el rol ADMIN.
router.use(isAuth, hasRole("ADMIN"));

// Ruta para que el admin vea todos los usuarios.
router.get("/users", getAllUsers);

// Ruta para que el admin bloquee o desbloquee un usuario concreto.
router.patch("/users/:id/toggle-block", toggleUserBlocked);

// Ruta para que el admin vea todos los servicios.
router.get("/services", getAllServicesAdmin);

// Ruta para que el admin active o desactive un servicio concreto.
router.patch("/services/:id/toggle-active", toggleServiceActive);

// Ruta para que el admin vea todas las solicitudes.
router.get("/requests", getAllRequestsAdmin);

// Ruta para que el admin vea todas las reseñas.
router.get("/reviews", getAllReviewsAdmin);

// Ruta para que el admin cambie la visibilidad de una reseña concreta.
router.patch("/reviews/:id/toggle-visibility", toggleReviewVisibility);

// Ruta para que el admin vea todos los mensajes de contacto.
router.get("/contact-messages", getAllContactMessagesAdmin);

// Exporto el router para usarlo en app.js o en el archivo principal del servidor.
module.exports = router;
