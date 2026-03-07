// Creo el router de Express para definir las rutas de servicios.
const router = require("express").Router();

// Importo los controladores con la lógica de cada endpoint de servicios.
const {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
} = require("../controllers/services.controller");

// Importo los middlewares de autenticación y autorización.
const isAuth = require("../middlewares/isAuth");
const hasRole = require("../middlewares/hasRole");

// Ruta para obtener todos los servicios activos.
router.get("/", getAllServices);

// Ruta para obtener un servicio concreto por su id.
router.get("/:id", getServiceById);

// Ruta para crear un nuevo servicio. Solo pueden acceder usuarios autenticados con rol PRO o ADMIN.
router.post("/", isAuth, hasRole("PRO", "ADMIN"), createService);

// Ruta para actualizar un servicio existente. Requiere que el usuario esté autenticado.
router.put("/:id", isAuth, updateService);

// Ruta para eliminar un servicio existente. Requiere que el usuario esté autenticado.
router.delete("/:id", isAuth, deleteService);

// Exporto el router para poder usarlo en la configuración principal de rutas.
module.exports = router;
