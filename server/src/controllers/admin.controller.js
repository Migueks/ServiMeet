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
        isBlocked: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Si todo va bien, devuelvo un 200 junto con la lista de usuarios.
    return res.status(200).json({ users });
  } catch (error) {
    // Muestro el error real solo en servidor para depuración.
    console.error("Error al obtener los usuarios:", error);

    return res.status(500).json({
      message: "Error al obtener los usuarios",
    });
  }
}

// Controlador para bloquear o desbloquear un usuario.
// No permito que un administrador se bloquee a sí mismo.
async function toggleUserBlocked(req, res) {
  try {
    // Obtengo el id que llega por parámetro en la URL y lo convierto a número.
    const id = Number(req.params.id);

    // Si el id no es un número válido, devuelvo error 400.
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "ID de usuario no válido" });
    }

    // Busco el usuario en la base de datos para comprobar que existe
    // y para saber cuál es su estado actual (bloqueado o no).
    const existingUser = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        city: true,
        avatarUrl: true,
        isBlocked: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Si el usuario no existe, devuelvo error 404.
    if (!existingUser) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Evito que el administrador autenticado se bloquee a sí mismo.
    // Así no pierde acceso al panel por error.
    if (existingUser.id === req.user.id) {
      return res.status(400).json({
        message: "No puedes bloquear tu propia cuenta de administrador",
      });
    }

    // Invierto el valor actual de isBlocked:
    // - si estaba en false, pasa a true
    // - si estaba en true, pasa a false
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        isBlocked: !existingUser.isBlocked,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        city: true,
        avatarUrl: true,
        isBlocked: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Devuelvo 200 con un mensaje dinámico según el nuevo estado del usuario
    // y los datos actualizados para refrescar el panel de administración.
    return res.status(200).json({
      message: `Usuario ${updatedUser.isBlocked ? "bloqueado" : "desbloqueado"} correctamente`,
      user: updatedUser,
    });
  } catch (error) {
    // Muestro el error real solo en servidor para depuración.
    console.error("Error al cambiar el estado del usuario:", error);

    return res.status(500).json({
      message: "Error al cambiar el estado del usuario",
    });
  }
}

// Controlador para que el admin vea todos los servicios, estén activos o no.
// Incluyo datos básicos del profesional, la categoría, la ciudad y un resumen de valoraciones.
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
        // Incluyo la categoría relacionada del servicio.
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        // Incluyo la ciudad relacionada del servicio.
        city: {
          select: {
            id: true,
            name: true,
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
    // Muestro el error real solo en servidor para depuración.
    console.error("Error al obtener los servicios:", error);

    return res.status(500).json({
      message: "Error al obtener los servicios",
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

    // Busco el servicio actual para comprobar que exista y obtener también sus reseñas,
    // la categoría, la ciudad y los datos básicos del profesional.
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
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        city: {
          select: {
            id: true,
            name: true,
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
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        city: {
          select: {
            id: true,
            name: true,
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
    // Muestro el error real solo en servidor para depuración.
    console.error("Error al cambiar el estado del servicio:", error);

    return res.status(500).json({
      message: "Error al cambiar el estado del servicio",
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
            price: true,
            imageUrl: true,
            isActive: true,
            category: {
              select: {
                id: true,
                name: true,
              },
            },
            city: {
              select: {
                id: true,
                name: true,
              },
            },
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
    // Muestro el error real solo en servidor para depuración.
    console.error("Error al obtener las solicitudes:", error);

    return res.status(500).json({
      message: "Error al obtener las solicitudes",
    });
  }
}

// Controlador para que el admin vea todas las reseñas de la plataforma.
// Incluyo información básica del servicio, cliente y profesional.
async function getAllReviewsAdmin(req, res) {
  try {
    // Busco todas las reseñas en la base de datos.
    // Las ordeno desde la más reciente hasta la más antigua.
    const reviews = await prisma.review.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        // Incluyo información básica del servicio asociado a cada reseña.
        service: {
          select: {
            id: true,
            title: true,
            price: true,
            imageUrl: true,
            category: {
              select: {
                id: true,
                name: true,
              },
            },
            city: {
              select: {
                id: true,
                name: true,
              },
            },
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
        // Incluyo datos básicos del profesional que recibió la reseña.
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
    // Muestro el error real solo en servidor para depuración.
    console.error("Error al obtener las reseñas:", error);

    return res.status(500).json({
      message: "Error al obtener las reseñas",
    });
  }
}

// Controlador para cambiar la visibilidad de una reseña.
async function toggleReviewVisibility(req, res) {
  try {
    // Obtengo el id que llega por parámetro en la URL y lo convierto a número.
    const id = Number(req.params.id);

    // Si el id no es un número válido, devuelvo error 400.
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "ID de reseña no válido" });
    }

    // Busco la reseña en la base de datos para comprobar que existe
    // y para saber cuál es su visibilidad actual.
    // Incluyo también la información relacionada que necesita el panel admin:
    // servicio, cliente y profesional.
    const existingReview = await prisma.review.findUnique({
      where: { id },
      include: {
        service: {
          select: {
            id: true,
            title: true,
            price: true,
            imageUrl: true,
            category: {
              select: {
                id: true,
                name: true,
              },
            },
            city: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            city: true,
          },
        },
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

    // Si la reseña no existe, devuelvo error 404.
    if (!existingReview) {
      return res.status(404).json({ message: "Reseña no encontrada" });
    }

    // Invierto el valor actual de isVisible:
    // - si estaba en true, pasa a false (oculta)
    // - si estaba en false, pasa a true (visible otra vez)
    const updatedReview = await prisma.review.update({
      where: { id },
      data: {
        isVisible: !existingReview.isVisible,
      },
      include: {
        service: {
          select: {
            id: true,
            title: true,
            price: true,
            imageUrl: true,
            category: {
              select: {
                id: true,
                name: true,
              },
            },
            city: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            city: true,
          },
        },
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

    // Devuelvo 200 con un mensaje dinámico según el nuevo estado de la reseña
    // y la reseña actualizada para refrescar el panel de administración.
    return res.status(200).json({
      message: `Reseña ${updatedReview.isVisible ? "mostrada" : "ocultada"} correctamente`,
      review: updatedReview,
    });
  } catch (error) {
    // Muestro el error real solo en servidor para depuración.
    console.error("Error al cambiar la visibilidad de la reseña:", error);

    return res.status(500).json({
      message: "Error al cambiar la visibilidad de la reseña",
    });
  }
}

// Controlador para que un administrador obtenga todos los mensajes enviados desde el formulario de contacto.
async function getAllContactMessagesAdmin(req, res) {
  try {
    // Busco todos los mensajes de contacto en la base de datos y los ordeno del más reciente al más antiguo.
    const contactMessages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
    });

    // Devuelvo la lista de mensajes con respuesta OK
    return res.status(200).json({ contactMessages });
  } catch (error) {
    // Muestro el error real solo en servidor para depuración.
    console.error("Error al obtener los mensajes de contacto:", error);

    return res.status(500).json({
      message: "Error al obtener los mensajes de contacto",
    });
  }
}

// Exporto los controladores del módulo admin para poder utilizarlos en sus rutas correspondientes.
module.exports = {
  getAllUsers,
  toggleUserBlocked,
  getAllServicesAdmin,
  toggleServiceActive,
  getAllRequestsAdmin,
  getAllReviewsAdmin,
  toggleReviewVisibility,
  getAllContactMessagesAdmin,
};
