// Creo un router de Express.
const router = require("express").Router();

// Importo los controladores del módulo meta.
const {
  getAllCategories,
  getCategoryById,
  getAllCities,
  getCityById,
} = require("../controllers/meta.controller");

// Obtener todas las categorías.
router.get("/categories", getAllCategories);

// Obtener una categoría concreta por su id.
router.get("/categories/:id", getCategoryById);

// Obtener todas las ciudades.
router.get("/cities", getAllCities);

// Obtener una ciudad concreta por su id.
router.get("/cities/:id", getCityById);

module.exports = router;
