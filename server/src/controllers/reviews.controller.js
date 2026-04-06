const prisma = require("../config/prisma");
const { createReviewSchema } = require("../schemas/reviews.schema");

// Controlador para crear una nueva reseña.
// Valida los datos recibidos, comprueba que la solicitud exista y pertenezca al cliente autenticado,
// verifica que esté completada y que no tenga ya una reseña, y crea la reseña en la base de datos.
async function createReview(req, res) {
  try {
    // Valido los datos recibidos en el body usando el esquema de Zod.
    const parsedData = createReviewSchema.safeParse(req.body);

    // Si la validación falla, devuelvo un 400 con el detalle de los errores.
    if (!parsedData.success) {
      return res.status(400).json({
        message: "Datos inválidos",
        errors: parsedData.error.issues.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        })),
      });
    }

    // Extraigo los datos ya validados.
    const { requestId, rating, comment } = parsedData.data;

    // Busco la solicitud para comprobar que exista y obtengo también su reseña y servicio relacionados.
    const request = await prisma.request.findUnique({
      where: { id: requestId },
      include: {
        review: true,
        service: true,
      },
    });

    // Si la solicitud no existe, devuelvo un 404.
    if (!request) {
      return res.status(404).json({ message: "Solicitud no encontrada" });
    }

    // Solo permito crear la reseña al cliente propietario de la solicitud.
    if (request.clientId !== req.user.id) {
      return res.status(403).json({
        message: "No puedes añadir una reseña a una solicitud que no es tuya",
      });
    }

    // Solo permito crear reseñas a solicitudes que ya estén completadas.
    if (request.status !== "DONE") {
      return res.status(400).json({
        message: "Solo puedes añadir una reseña a solicitudes completadas",
      });
    }

    // Impido crear más de una reseña para la misma solicitud.
    if (request.review) {
      return res.status(400).json({
        message: "Esta solicitud ya tiene una reseña",
      });
    }

    // Creo la reseña en la base de datos y la relaciono con la solicitud, el servicio, el cliente y el profesional correspondiente.
    const review = await prisma.review.create({
      data: {
        rating,
        comment,
        requestId: request.id,
        serviceId: request.serviceId,
        clientId: request.clientId,
        proId: request.proId,
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            city: true,
          },
        },
        pro: {
          select: {
            id: true,
            name: true,
            city: true,
          },
        },
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
      },
    });

    // Si todo va bien, respondo con código 201 y la reseña creada.
    return res.status(201).json({
      message: "Reseña creada correctamente",
      review,
    });
  } catch (error) {
    // Muestro el error real solo en servidor para depuración.
    console.error("Error al crear la reseña:", error);

    return res.status(500).json({
      message: "Error al crear la reseña",
    });
  }
}

// Controlador para obtener las reseñas de un servicio.
// Comprueba que el id recibido sea válido, verifica que el servicio exista y devuelve sus reseñas ordenadas de más reciente a más antigua.
async function getReviewsByService(req, res) {
  try {
    // Convierto el id recibido por params a número para poder usarlo en la consulta.
    const serviceId = Number(req.params.serviceId);

    // Compruebo que el id del servicio sea válido antes de consultar la base de datos.
    if (Number.isNaN(serviceId)) {
      return res.status(400).json({ message: "ID de servicio no válido" });
    }

    // Busco el servicio para comprobar que exista.
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    // Si no existe ningún servicio con ese id, devuelvo un 404.
    if (!service) {
      return res.status(404).json({ message: "Servicio no encontrado" });
    }

    // Busco todas las reseñas asociadas al servicio y las ordeno de más reciente a más antigua.
    const reviews = await prisma.review.findMany({
      where: {
        serviceId,
        isVisible: true,
      },
      orderBy: { createdAt: "desc" },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            city: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Si todo va bien, respondo con código 200 y las reseñas encontradas.
    return res.status(200).json({ reviews });
  } catch (error) {
    // Muestro el error real solo en servidor para depuración.
    console.error("Error al obtener las reseñas del servicio:", error);

    return res.status(500).json({
      message: "Error al obtener las reseñas del servicio",
    });
  }
}

// Controlador para obtener las reseñas del usuario autenticado.
// Si es CLIENT, devuelve las reseñas que ha escrito.
// Si es PRO, devuelve las reseñas recibidas en sus servicios.
// Si es ADMIN, devuelve todas las reseñas.
async function getMyReviews(req, res) {
  try {
    // Inicializo el filtro vacío para construir la búsqueda según el rol del usuario.
    let whereClause = {};

    // Si el usuario es cliente, solo muestro las reseñas creadas por él.
    if (req.user.role === "CLIENT") {
      whereClause = { clientId: req.user.id, isVisible: true };
    } else if (req.user.role === "PRO") {
      // Si el usuario es profesional, solo muestro las reseñas recibidas por él.
      whereClause = { proId: req.user.id, isVisible: true };
    } else if (req.user.role === "ADMIN") {
      // Si el usuario es administrador, no aplico filtro y devuelvo todas las reseñas.
      whereClause = {};
    }

    // Busco las reseñas según el filtro construido, las ordeno de más reciente a más antigua
    // e incluyo información básica del cliente, profesional y servicio relacionados.
    const reviews = await prisma.review.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            city: true,
          },
        },
        pro: {
          select: {
            id: true,
            name: true,
            city: true,
          },
        },
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
      },
    });

    // Si todo va bien, respondo con código 200 y las reseñas encontradas.
    return res.status(200).json({ reviews });
  } catch (error) {
    // Muestro el error real solo en servidor para depuración.
    console.error("Error al obtener las reseñas:", error);

    return res.status(500).json({
      message: "Error al obtener las reseñas",
    });
  }
}

// Controlador para obtener las reseñas que se mostrarán en la home.
// Devuelvo reseñas reales de servicios activos, con comentario, priorizando mejor valoración y mayor actualidad.
// Intento no repetir servicio para que la home se vea más variada.
async function getHomeReviews(req, res) {
  try {
    // Busco reseñas con comentario asociadas a servicios activos.
    // Traigo más de las necesarias para poder filtrar sin repetir servicio.
    const reviews = await prisma.review.findMany({
      where: {
        isVisible: true,
        comment: {
          not: "",
        },
        service: {
          isActive: true,
        },
      },
      orderBy: [{ rating: "desc" }, { createdAt: "desc" }],
      take: 30,
      include: {
        client: {
          select: {
            id: true,
            name: true,
          },
        },
        service: {
          select: {
            id: true,
            title: true,
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
      },
    });

    const selected = [];
    const seenServices = new Set();

    // Primero intento quedarme con una sola reseña por servicio.
    for (const review of reviews) {
      if (!review.service?.id || seenServices.has(review.service.id)) {
        continue;
      }

      selected.push(review);
      seenServices.add(review.service.id);

      if (selected.length === 6) {
        break;
      }
    }

    // Si no llego a 6, completo con el resto aunque repitan servicio.
    if (selected.length < 6) {
      for (const review of reviews) {
        if (selected.some((item) => item.id === review.id)) {
          continue;
        }

        selected.push(review);

        if (selected.length === 6) {
          break;
        }
      }
    }

    return res.status(200).json({ reviews: selected });
  } catch (error) {
    console.error("Error al obtener las reseñas de la home:", error);

    return res.status(500).json({
      message: "Error al obtener las reseñas de la home",
    });
  }
}

// Exporto los controladores de reseñas para poder utilizarlos en sus rutas correspondientes.
module.exports = {
  createReview,
  getReviewsByService,
  getMyReviews,
  getHomeReviews,
};
