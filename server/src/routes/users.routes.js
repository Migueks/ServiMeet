// Creo un router de Express para definir las rutas de user.
const router = require("express").Router();

// Importo los controladores del módulo users.
const {
  getMyProfile,
  updateMyProfile,
  getMyServices,
  getMyDashboard,
} = require("../controllers/users.controller");

// Importo middlewares de autenticación y autorización.
const isAuth = require("../middlewares/isAuth");
const hasRole = require("../middlewares/hasRole");

// Ruta para obtener el perfil del usuario autenticado.
router.get("/me", isAuth, getMyProfile);
// Ruta para actualizar el perfil del usuario autenticado.
router.put("/me", isAuth, updateMyProfile);
// Ruta para obtener los servicios del usuario autenticado.
router.get("/me/services", isAuth, hasRole("PRO", "ADMIN"), getMyServices);
// Ruta para obtener el dashboard del usuario autenticado.
router.get(
  "/me/dashboard",
  isAuth,
  hasRole("CLIENT", "PRO", "ADMIN"),
  getMyDashboard,
);

// Exporto el router para poder usarlo en la configuración principal de rutas.
module.exports = router;
