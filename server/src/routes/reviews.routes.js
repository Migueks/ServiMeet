// Creo el router de Express para definir las rutas de reseñas.
const router = require("express").Router();

// Importo los controladores con la lógica de cada endpoint de reseñas.
const {
  createReview,
  getReviewsByService,
  getMyReviews,
} = require("../controllers/reviews.controller");

// Importo los middlewares de autenticación y autorización.
const isAuth = require("../middlewares/isAuth");
const hasRole = require("../middlewares/hasRole");

// Ruta para crear una nueva reseña. Solo pueden acceder usuarios autenticados con rol CLIENT.
router.post("/", isAuth, hasRole("CLIENT"), createReview);

// Ruta para obtener las reseñas de un servicio concreto por su serviceId.
router.get("/service/:serviceId", getReviewsByService);

// Ruta para obtener las reseñas del usuario autenticado.
router.get(
  "/my-reviews",
  isAuth,
  hasRole("CLIENT", "PRO", "ADMIN"),
  getMyReviews,
);

// Exporto el router para poder usarlo en la configuración principal de rutas.
module.exports = router;
