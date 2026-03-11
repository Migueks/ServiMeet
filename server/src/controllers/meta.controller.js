const prisma = require("../config/prisma");

// Controlador para obtener todas las categorías disponibles.
// Devuelve el catálogo ordenado alfabéticamente para poder usarlo en formularios y filtros.
async function getAllCategories(req, res) {
  try {
    // Busco todas las categorías en la base de datos y las ordeno por nombre ascendente.
    const categories = await prisma.category.findMany({
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
      },
    });

    // Si todo va bien, respondo con un código 200 y el listado de categorías.
    return res.status(200).json({ categories });
  } catch (error) {
    // Si ocurre un error durante la consulta, devuelvo un 500 junto con un mensaje y el detalle del error.
    return res.status(500).json({
      message: "Error al obtener las categorías",
      error: error.message,
    });
  }
}

// Controlador para obtener una categoría concreta por su id.
// Comprueba que el id recibido sea válido y devuelve la categoría si existe.
async function getCategoryById(req, res) {
  try {
    // Convierto el id recibido por params a número para poder usarlo en la consulta.
    const id = Number(req.params.id);

    // Compruebo que el id sea válido antes de consultar la base de datos.
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "ID de categoría no válido" });
    }

    // Busco la categoría por su id.
    const category = await prisma.category.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
      },
    });

    // Si no existe ninguna categoría con ese id, devuelvo un 404.
    if (!category) {
      return res.status(404).json({ message: "Categoría no encontrada" });
    }

    // Si todo va bien, respondo con código 200 y la categoría encontrada.
    return res.status(200).json({ category });
  } catch (error) {
    // Si ocurre un error durante la consulta, devuelvo un 500 junto con un mensaje y el detalle del error.
    return res.status(500).json({
      message: "Error al obtener la categoría",
      error: error.message,
    });
  }
}

// Controlador para obtener todas las ciudades disponibles.
// Devuelve el catálogo ordenado alfabéticamente para poder usarlo en formularios y filtros.
async function getAllCities(req, res) {
  try {
    // Busco todas las ciudades en la base de datos y las ordeno por nombre ascendente.
    const cities = await prisma.city.findMany({
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
      },
    });

    // Si todo va bien, respondo con código 200 y el listado de ciudades.
    return res.status(200).json({ cities });
  } catch (error) {
    // Si ocurre un error durante la consulta, devuelvo un 500 junto con un mensaje y el detalle del error.
    return res.status(500).json({
      message: "Error al obtener las ciudades",
      error: error.message,
    });
  }
}

// Controlador para obtener una ciudad concreta por su id.
// Comprueba que el id recibido sea válido y devuelve la ciudad si existe.
async function getCityById(req, res) {
  try {
    // Convierto el id recibido por params a número para poder usarlo en la consulta.
    const id = Number(req.params.id);

    // Compruebo que el id sea válido antes de consultar la base de datos.
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "ID de ciudad no válido" });
    }

    // Busco la ciudad por su id.
    const city = await prisma.city.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
      },
    });

    // Si no existe ninguna ciudad con ese id, devuelvo un 404.
    if (!city) {
      return res.status(404).json({ message: "Ciudad no encontrada" });
    }

    // Si todo va bien, respondo con código 200 y la ciudad encontrada.
    return res.status(200).json({ city });
  } catch (error) {
    // Si ocurre un error durante la consulta, devuelvo un 500 junto con un mensaje y el detalle del error.
    return res.status(500).json({
      message: "Error al obtener la ciudad",
      error: error.message,
    });
  }
}

// Exporto los controladores del módulo meta para poder utilizarlos en sus rutas correspondientes.
module.exports = {
  getAllCategories,
  getCategoryById,
  getAllCities,
  getCityById,
};
