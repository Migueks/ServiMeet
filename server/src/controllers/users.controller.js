const { z } = require("zod");
const prisma = require("../config/prisma");

// Esquema para actualizar el perfil del usuario autenticado.
// Solo permite modificar campos del perfil. No permite cambiar ni el role ni la password desde esta ruta.
const updateMyProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .optional(),
  email: z.string().trim().email("El email no es válido").optional(),
  city: z.preprocess(
    // Si desde el formulario llega una cadena vacía (""),
    // la transformo a null para poder guardar "sin ciudad".
    (value) => (value === "" ? null : value),
    z
      .string()
      .trim()
      .min(2, "La ciudad debe tener al menos 2 caracteres")
      .nullable()
      .optional(),
  ),
  avatarUrl: z.preprocess(
    // Si desde el formulario llega una cadena vacía (""),
    // la transformo a null para poder guardar "sin avatar".
    (value) => (value === "" ? null : value),
    z
      .string()
      .trim()
      .url("El avatar debe ser una URL válida")
      .nullable()
      .optional(),
  ),
});

// Función auxiliar para calcular la media de valoración y el total de reseñas.
// La uso para no repetir esta lógica en varios controladores.
function calculateRatingData(reviews) {
  // Guardo el número total de reseñas recibidas.
  const reviewsCount = reviews.length;

  // Si no hay reseñas, devuelvo 0 como media y 0 como cantidad total.
  if (reviewsCount === 0) {
    return {
      averageRating: 0,
      reviewsCount: 0,
    };
  }

  // Sumo todas las puntuaciones de las reseñas.
  const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);

  // Calculo la media y la dejo con un decimal.
  const averageRating = Number((totalRating / reviewsCount).toFixed(1));

  // Devuelvo la media de puntuación y el total de reseñas.
  return {
    averageRating,
    reviewsCount,
  };
}

// Controlador para obtener el perfil del usuario autenticado.
// Recupera el id del usuario desde req.user, busca sus datos en la base de datos y devuelve únicamente campos seguros para no exponer información sensible.
async function getMyProfile(req, res) {
  try {
    // Obtengo el id del usuario autenticado desde req.user, que ha sido añadido previamente por el middleware isAuth.
    const userId = req.user.id;

    // Busco al usuario en la base de datos y selecciono solo los campos que se pueden devolver de forma segura en la respuesta.
    const user = await prisma.user.findUnique({
      where: { id: userId },
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

    // Si el token es válido pero el usuario ya no existe en la base de datos, devuelvo un 404 indicando que no se ha encontrado.
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Si todo va bien, respondo con código 200 y los datos del usuario.
    return res.status(200).json({ user });
  } catch (error) {
    // Si ocurre cualquier error durante la consulta, devuelvo un 500 junto con un mensaje y el detalle del error.
    return res.status(500).json({
      message: "Error al obtener el perfil del usuario",
      error: error.message,
    });
  }
}

// Controlador para actualizar el perfil del usuario autenticado.
// Permite editar nombre, email, ciudad y avatarUrl.
async function updateMyProfile(req, res) {
  try {
    // Compruebo que al menos se haya enviado un campo para actualizar.
    if (Object.keys(req.body).length === 0) {
      return res.status(400).json({
        message: "Debes enviar al menos un campo para actualizar",
      });
    }

    // Valido los datos recibidos con Zod.
    const parsedData = updateMyProfileSchema.safeParse(req.body);

    // Si la validación falla, devuelvo 400 con el detalle de errores.
    if (!parsedData.success) {
      return res.status(400).json({
        message: "Datos inválidos",
        errors: parsedData.error.issues.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        })),
      });
    }

    // Compruebo que, después de validar, siga habiendo al menos un campo válido para actualizar.
    if (Object.keys(parsedData.data).length === 0) {
      return res.status(400).json({
        message: "Debes enviar al menos un campo válido para actualizar",
      });
    }

    // Compruebo que el usuario autenticado siga existiendo.
    const existingUser = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!existingUser) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Actualizo únicamente campos seguros del perfil.
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: parsedData.data,
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

    // Si todo sale bien, respondo con un 200 y el usuario actualizado.
    return res
      .status(200)
      .json({ message: "Perfil actualizado correctamente", user: updatedUser });
  } catch (error) {
    // Si el email ya existe en otro usuario, Prisma lanza error de unique constraint.
    if (error.code === "P2002") {
      return res.status(409).json({
        message: "El email ya está en uso por otro usuario",
      });
    }

    return res.status(500).json({
      message: "Error al actualizar el perfil",
      error: error.message,
    });
  }
}

// Controlador para obtener los servicios del profesional autenticado.
// Busca primero los datos básicos del usuario y, según su rol, devuelve estadísticas diferentes para CLIENT, PRO o ADMIN.
async function getMyServices(req, res) {
  try {
    // Busco en la base de datos todos los servicios cuyo propietario sea el usuario autenticado y los ordeno del más reciente al más antiguo.
    const services = await prisma.service.findMany({
      where: { proId: req.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        reviews: {
          select: {
            rating: true,
          },
        },
      },
    });

    // Recorro los servicios para calcular la media de puntuación y el total de reseñas de cada uno.
    const formattedServices = services.map((service) => {
      // Calculo la media de valoración y la cantidad de reseñas del servicio.
      const { averageRating, reviewsCount } = calculateRatingData(
        service.reviews,
      );
      // Separo el array reviews del resto de datos para no devolverlo en la respuesta final.
      const { reviews, ...serviceWithoutReviews } = service;

      // Devuelvo un nuevo objeto con los datos del servicio más la media de valoración y el número de reseñas.
      return {
        ...serviceWithoutReviews,
        averageRating,
        reviewsCount,
      };
    });

    // Si todo va bien, respondo con código 200 y los servicios formateados.
    return res.status(200).json({ services: formattedServices });
  } catch (error) {
    // Si ocurre cualquier error durante la consulta, devuelvo un 500 junto con un mensaje y el detalle del error.
    return res.status(500).json({
      message: "Error al obtener los servicios del usuario",
      error: error.message,
    });
  }
}

// Controlador para obtener el resumen del panel del usuario autenticado.
// Devuelve estadísticas distintas según el rol del usuario.
async function getMyDashboard(req, res) {
  try {
    // Busco al usuario autenticado en la base de datos y selecciono solo los campos seguros que quiero devolver.
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        city: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    // Si el usuario no existe, devuelvo un 404.
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Si el usuario es CLIENT, devuelvo estadísticas de sus solicitudes y reseñas realizadas.
    if (user.role === "CLIENT") {
      // Lanzo todas las consultas en paralelo para mejorar el rendimiento.
      const [
        totalRequests,
        pendingRequests,
        acceptedRequests,
        completedRequests,
        rejectedRequests,
        cancelledRequests,
        reviewsGiven,
      ] = await Promise.all([
        prisma.request.count({ where: { clientId: user.id } }),
        prisma.request.count({
          where: { clientId: user.id, status: "PENDING" },
        }),
        prisma.request.count({
          where: { clientId: user.id, status: "ACCEPTED" },
        }),
        prisma.request.count({ where: { clientId: user.id, status: "DONE" } }),
        prisma.request.count({
          where: { clientId: user.id, status: "REJECTED" },
        }),
        prisma.request.count({
          where: { clientId: user.id, status: "CANCELLED" },
        }),
        prisma.review.count({ where: { clientId: user.id } }),
      ]);

      // Devuelvo el usuario y sus estadísticas como cliente.
      return res.status(200).json({
        user,
        stats: {
          totalRequests,
          pendingRequests,
          acceptedRequests,
          completedRequests,
          rejectedRequests,
          cancelledRequests,
          reviewsGiven,
        },
      });
    }

    // Si el usuario es PRO, devuelvo estadísticas de servicios, solicitudes recibidas y valoraciones recibidas.
    if (user.role === "PRO") {
      // Lanzo todas las consultas en paralelo para mejorar el rendimiento.
      const [
        totalServices,
        activeServices,
        inactiveServices,
        totalRequestsReceived,
        pendingRequestsReceived,
        acceptedRequestsReceived,
        completedJobs,
        rejectedRequestsReceived,
        cancelledRequestsReceived,
        reviewsSummary,
      ] = await Promise.all([
        prisma.service.count({ where: { proId: user.id } }),
        prisma.service.count({ where: { proId: user.id, isActive: true } }),
        prisma.service.count({ where: { proId: user.id, isActive: false } }),
        prisma.request.count({ where: { proId: user.id } }),
        prisma.request.count({ where: { proId: user.id, status: "PENDING" } }),
        prisma.request.count({ where: { proId: user.id, status: "ACCEPTED" } }),
        prisma.request.count({ where: { proId: user.id, status: "DONE" } }),
        prisma.request.count({ where: { proId: user.id, status: "REJECTED" } }),
        prisma.request.count({
          where: { proId: user.id, status: "CANCELLED" },
        }),
        prisma.review.aggregate({
          where: { proId: user.id },
          _avg: { rating: true },
          _count: { id: true },
        }),
      ]);

      // Devuelvo el usuario y sus estadísticas como profesional.
      return res.status(200).json({
        user,
        stats: {
          totalServices,
          activeServices,
          inactiveServices,
          totalRequestsReceived,
          pendingRequestsReceived,
          acceptedRequestsReceived,
          completedJobs,
          rejectedRequestsReceived,
          cancelledRequestsReceived,
          reviewsReceived: reviewsSummary._count.id,
          averageRating: Number((reviewsSummary._avg.rating || 0).toFixed(1)),
        },
      });
    }

    // Si el usuario es ADMIN, devuelvo estadísticas generales de la plataforma.
    if (user.role === "ADMIN") {
      // Lanzo todas las consultas en paralelo para mejorar el rendimiento.
      const [
        totalUsers,
        totalClients,
        totalPros,
        totalAdmins,
        totalServices,
        activeServices,
        totalRequests,
        pendingRequests,
        completedRequests,
        totalReviews,
      ] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { role: "CLIENT" } }),
        prisma.user.count({ where: { role: "PRO" } }),
        prisma.user.count({ where: { role: "ADMIN" } }),
        prisma.service.count(),
        prisma.service.count({ where: { isActive: true } }),
        prisma.request.count(),
        prisma.request.count({ where: { status: "PENDING" } }),
        prisma.request.count({ where: { status: "DONE" } }),
        prisma.review.count(),
      ]);

      // Devuelvo el usuario y las estadísticas generales como administrador.
      return res.status(200).json({
        user,
        stats: {
          totalUsers,
          totalClients,
          totalPros,
          totalAdmins,
          totalServices,
          activeServices,
          totalRequests,
          pendingRequests,
          completedRequests,
          totalReviews,
        },
      });
    }

    // Si el rol no coincide con ninguno de los esperados, devuelvo un error.
    return res.status(400).json({ message: "Rol de usuario no válido" });
  } catch (error) {
    // Si ocurre cualquier error durante el proceso, devuelvo un 500 junto con un mensaje y el detalle del error.
    return res.status(500).json({
      message: "Error al obtener el dashboard del usuario",
      error: error.message,
    });
  }
}

// Exporto los controladores del módulo users para utilizarlos en sus rutas.
module.exports = {
  getMyProfile,
  updateMyProfile,
  getMyServices,
  getMyDashboard,
};
