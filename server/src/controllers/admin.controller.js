const { includes } = require("zod");
const prisma = require("../config/prisma");

// Función auxiliar para calcular la valoración media de un servicio y el número total de reseñas a partir de un array de reviews.
function calculateRatingData(reviews) {
  // Guardo cuántas reseñas tiene el servicio.
  const reviewsCount = reviews.length;

  // Si no hay reseñas, devuelvo media 0 y contador 0 para evitar dividir entre 0.
  if (reviewsCount === 0) {
    return {
      averageRating: 0,
      reviewsCount: 0,
    };
  }

  // Sumo todas las puntuaciones de las reseñas.
  const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);

  // Calculo la media de las valoraciones y la redondeo a 1 decimal.
  const averageRating = Number((totalRating / reviewsCount).toFixed(1));

  // Devuelvo la media y el número total de reseñas.
  return {
    averageRating,
    reviewsCount,
  };
}

// Controlador para que el admin vea todos los usuarios de la plataforma.
// Devuelvo solo campos seguros y útiles para administración.
async function getAllUsers(req, res) {
  try {
    // Busco todos los usuarios en la base de datos.
    // Los ordeno desde el más reciente al más antiguo según su fecha de creación.
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        city: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Si todo va bien, devuelvo un 200 junto con la lista de usuarios.
    return res.status(200).json({ users });
  } catch (error) {
    // Si ocurre algún error al consultar los usuarios, devuelvo un 500.
    return res.status(500).json({
      message: "Error al obtener los usuarios",
      error: error.message,
    });
  }
}

// Controlador para que el admin vea todos los servicios, estén activos o no.
// Incluyo datos básicos del profesional y un resumen de valoraciones.
async function getAllServicesAdmin(req, res) {
  try {
    // Busco todos los servicios en la base de datos.
    // Los ordeno desde el más reciente al más antiguo según su fecha de creación.
    const services = await prisma.service.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        // Incluyo datos básicos del profesional que creó el servicio.
        pro: {
          select: {
            id: true,
            name: true,
            email: true,
            city: true,
          },
        },
        // Incluyo solo la puntuación de cada reseña para calcular después la media de valoraciones y el número total de reviews.
        reviews: {
          select: {
            rating: true,
          },
        },
      },
    });

    // Recorro todos los servicios para añadirles la media de valoración y el número total de reseñas.
    const formattedServices = services.map((service) => {
      const { averageRating, reviewsCount } = calculateRatingData(
        service.reviews,
      );

      // Quito el array completo de reviews de la respuesta final para devolver un objeto más limpio.
      const { reviews, ...serviceWithoutReviews } = service;

      return {
        ...serviceWithoutReviews,
        averageRating,
        reviewsCount,
      };
    });

    // Si todo va bien, devuelvo un 200 junto con la lista de servicios formateados.
    return res.status(200).json({ services: formattedServices });
  } catch (error) {
    // Si ocurre algún error al consultar los servicios, devuelvo un 500.
    return res.status(500).json({
      message: "Error al obtener los servicios",
      error: error.message,
    });
  }
}

// Controlador para activar o desactivar un servicio.
// Hago un toggle del campo isActive: si estaba true pasa a false, y viceversa.
async function toggleServiceActive(req, res) {
  try {
    // Convierto el id recibido por params a número para poder consultarlo en la base de datos.
    const id = Number(req.params.id);

    // Compruebo que el id sea válido antes de consultar la base de datos.
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "ID de servicio no válido" });
    }

    // Busco el servicio actual para comprobar que exista y obtener también sus reseñas y los datos básicos del profesional.
    const existingService = await prisma.service.findUnique({
      where: { id },
      include: {
        reviews: {
          select: {
            rating: true,
          },
        },
        pro: {
          select: {
            id: true,
            name: true,
            city: true,
            email: true,
          },
        },
      },
    });

    // Si no existe ningún servicio con ese id, devuelvo un 404.
    if (!existingService) {
      return res.status(404).json({ message: "Servicio no encontrado" });
    }

    // Actualizo el campo isActive invirtiendo su valor actual.
    const updatedService = await prisma.service.update({
      where: { id },
      data: {
        isActive: !existingService.isActive,
      },
      include: {
        reviews: {
          select: {
            rating: true,
          },
        },
        pro: {
          select: {
            id: true,
            name: true,
            city: true,
            email: true,
          },
        },
      },
    });

    // Calculo la media de valoración y el número total de reseñas del servicio actualizado.
    const { averageRating, reviewsCount } = calculateRatingData(
      updatedService.reviews,
    );

    // Quito el array completo de reseñas de la respuesta para devolver un objeto más limpio.
    const { reviews, ...serviceWithoutReviews } = updatedService;

    // Si todo va bien, devuelvo un 200 junto con el servicio actualizado y un mensaje indicando si ha quedado activado o desactivado.
    return res.status(200).json({
      message: `Servicio ${
        updatedService.isActive ? "activado" : "desactivado"
      } correctamente`,
      service: {
        ...serviceWithoutReviews,
        averageRating,
        reviewsCount,
      },
    });
  } catch (error) {
    // Si ocurre cualquier error durante el proceso, devuelvo un 500.
    return res.status(500).json({
      message: "Error al cambiar el estado del servicio",
      error: error.message,
    });
  }
}

// Controlador para que el admin vea todas las solicitudes de la plataforma.
// Incluyo información básica del servicio relacionado, del cliente que hizo la solicitud
// y del profesional al que va dirigida.
async function getAllRequestsAdmin(req, res) {
  try {
    // Busco todas las solicitudes en la base de datos.
    // Las ordeno desde la más reciente hasta la más antigua según su fecha de creación.
    const requests = await prisma.request.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        // Incluyo información básica del servicio asociado a cada solicitud.
        service: {
          select: {
            id: true,
            title: true,
            category: true,
            price: true,
            zone: true,
            imageUrl: true,
            isActive: true,
          },
        },
        // Incluyo datos básicos del cliente que ha creado la solicitud.
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            city: true,
          },
        },
        // Incluyo datos básicos del profesional que recibe la solicitud.
        pro: {
          select: {
            id: true,
            name: true,
            email: true,
            city: true,
          },
        },
      },
    });

    // Si todo va bien, devuelvo un 200 junto con la lista de solicitudes.
    return res.status(200).json({ requests });
  } catch (error) {
    // Si ocurre algún error al consultar las solicitudes, devuelvo un 500.
    return res.status(500).json({
      message: "Error al obtener las solicitudes",
      error: error.message,
    });
  }
}

// Controlador para que le admin vea todas las reseñas de la plataforma.
// Incluyo información básica del servicio, cliente y profesional.
async function getAllReviewsAdmin(req, res) {
  try {
    // Busco todas las reseñas en la base de datos.
    // Las ordeno desde la más reciente hasta la más antigua según su fecha de creación.
    const reviews = await prisma.review.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        // Incluyo información básica del servicio asociado a cada reseña.
        service: {
          select: {
            id: true,
            title: true,
            category: true,
            price: true,
            zone: true,
          },
        },
        // Incluyo datos básicos del cliente que escribió la reseña.
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            city: true,
          },
        },
        // Incluyo datos básicos del profesional que recibe la reseña.
        pro: {
          select: {
            id: true,
            name: true,
            email: true,
            city: true,
          },
        },
      },
    });

    // Si todo va bien, devuelvo un 200 junto con la lista de reseñas.
    return res.status(200).json({ reviews });
  } catch (error) {
    // Si ocurre algún error al consultar las reseñas, devuelvo un 500.
    return res.status(500).json({
      message: "Error al obtener las reseñas",
      error: error.message,
    });
  }
}

// Exporto los controladores de admin para poder utilizarlos en sus rutas correspondientes.
module.exports = {
  getAllUsers,
  getAllServicesAdmin,
  toggleServiceActive,
  getAllRequestsAdmin,
  getAllReviewsAdmin,
};
