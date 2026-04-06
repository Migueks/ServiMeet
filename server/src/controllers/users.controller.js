const prisma = require("../config/prisma");
const { updateMyProfileSchema } = require("../schemas/users.schema");
const uploadToCloudinary = require("../utils/uploadToCloudinary");
const deleteFromCloudinary = require("../utils/deleteFromCloudinary");
const validateRealImageType = require("../utils/validateRealImageType");

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
// Recupera el id del usuario desde req.user, busca sus datos en la base de datos
// y devuelve únicamente campos seguros para no exponer información sensible.
async function getMyProfile(req, res) {
  try {
    // Obtengo el id del usuario autenticado desde req.user,
    // que ha sido añadido previamente por el middleware isAuth.
    const userId = req.user.id;

    // Busco al usuario en la base de datos y selecciono solo los campos
    // que se pueden devolver de forma segura en la respuesta.
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

    // Si el token es válido pero el usuario ya no existe en la base de datos,
    // devuelvo un 404 indicando que no se ha encontrado.
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Si todo va bien, respondo con código 200 y los datos del usuario.
    return res.status(200).json({ user });
  } catch (error) {
    // Muestro el error real solo en servidor para depuración.
    console.error("Error al obtener el perfil del usuario:", error);

    return res.status(500).json({
      message: "Error al obtener el perfil del usuario",
    });
  }
}

// Controlador para actualizar el perfil del usuario autenticado.
// Permite editar campos del perfil y, opcionalmente, subir un nuevo avatar.
async function updateMyProfile(req, res) {
  let uploadedAvatar = null;

  try {
    // Compruebo si el usuario ha enviado datos en el body.
    const hasBodyData = Object.keys(req.body).length > 0;

    // Compruebo si el usuario ha enviado un archivo de avatar.
    const hasAvatarFile = Boolean(req.file);

    // Si no llega ni texto ni archivo, devuelvo error 400.
    if (!hasBodyData && !hasAvatarFile) {
      return res.status(400).json({
        message: "Debes enviar al menos un campo para actualizar",
      });
    }

    // Valido los datos recibidos en el body con Zod.
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

    // Compruebo que el usuario autenticado siga existiendo en base de datos.
    // También recupero avatarId para poder borrar la imagen anterior si sube una nueva.
    const existingUser = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        avatarUrl: true,
        avatarId: true,
      },
    });

    // Si no existe, devuelvo 404.
    if (!existingUser) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Preparo un objeto con los datos validados que sí se pueden actualizar.
    const dataToUpdate = {
      ...parsedData.data,
    };

    // Si el usuario ha subido una nueva imagen de avatar...
    if (req.file) {
      // ...primero compruebo que el archivo sea realmente una imagen válida,
      // no solo por su extensión o su mimetype, sino por su contenido real.
      const isRealImage = await validateRealImageType(req.file);

      // Si el archivo no es una imagen válida, detengo el proceso y devuelvo un error al cliente.
      if (!isRealImage) {
        return res.status(400).json({
          message: "El archivo subido no es una imagen válida",
        });
      }

      // Si la imagen es válida, la subo a Cloudinary dentro de la carpeta de avatares de la aplicación.
      uploadedAvatar = await uploadToCloudinary(
        req.file.buffer,
        "servimeet/avatars",
      );

      // Guardo en los datos a actualizar tanto la URL pública de la imagen
      // como el public_id de Cloudinary, que servirá después para borrarla
      // o reemplazarla si hace falta.
      dataToUpdate.avatarUrl = uploadedAvatar.secure_url;
      dataToUpdate.avatarId = uploadedAvatar.public_id;
    }

    // Compruebo que, al final, exista al menos un campo válido para actualizar.
    if (Object.keys(dataToUpdate).length === 0) {
      return res.status(400).json({
        message: "Debes enviar al menos un campo válido para actualizar",
      });
    }

    // Actualizo el perfil del usuario con los datos preparados.
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: dataToUpdate,
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

    // Si se ha subido un avatar nuevo y el usuario ya tenía uno anterior,
    // intento borrar la imagen antigua de Cloudinary.
    // No rompo la respuesta si el borrado falla: el perfil ya está actualizado.
    if (uploadedAvatar && existingUser.avatarId) {
      try {
        await deleteFromCloudinary(existingUser.avatarId);
      } catch (cloudinaryDeleteError) {
        console.error(
          "No se pudo borrar el avatar anterior de Cloudinary:",
          cloudinaryDeleteError.message,
        );
      }
    }

    // Si todo sale bien, respondo con un 200 y el usuario actualizado.
    return res.status(200).json({
      message: "Perfil actualizado correctamente",
      user: updatedUser,
    });
  } catch (error) {
    // Si la subida a Cloudinary se hizo pero luego falló algo al actualizar en BD,
    // intento borrar el nuevo avatar para no dejar archivos huérfanos.
    if (uploadedAvatar?.public_id) {
      try {
        await deleteFromCloudinary(uploadedAvatar.public_id);
      } catch (cleanupError) {
        console.error(
          "No se pudo limpiar el nuevo avatar tras un error:",
          cleanupError.message,
        );
      }
    }

    // Si el email ya existe en otro usuario, Prisma lanza error de unique constraint.
    if (error.code === "P2002") {
      return res.status(409).json({
        message: "El email ya está en uso por otro usuario",
      });
    }

    // Muestro el error real solo en servidor para depuración.
    console.error("Error al actualizar el perfil:", error);

    return res.status(500).json({
      message: "Error al actualizar el perfil",
    });
  }
}

// Controlador para eliminar el avatar del usuario autenticado.
// Borra la referencia en base de datos y, si existe avatarId, intenta
// eliminar también la imagen de Cloudinary.
async function deleteMyAvatar(req, res) {
  try {
    // Busco al usuario autenticado y recupero sus datos de avatar.
    const existingUser = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        avatarUrl: true,
        avatarId: true,
      },
    });

    // Si no existe, devuelvo 404.
    if (!existingUser) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Si no tiene avatar actualmente, devuelvo 400.
    if (!existingUser.avatarUrl && !existingUser.avatarId) {
      return res.status(400).json({
        message: "No tienes ningún avatar para eliminar",
      });
    }

    // Primero limpio la base de datos para que el perfil quede correcto
    // aunque el borrado en Cloudinary falle después.
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        avatarUrl: null,
        avatarId: null,
      },
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

    // Si existía avatarId, intento borrar también la imagen en Cloudinary.
    // Si falla, no rompo la respuesta porque el perfil ya está limpio en BD.
    if (existingUser.avatarId) {
      try {
        await deleteFromCloudinary(existingUser.avatarId);
      } catch (cloudinaryDeleteError) {
        console.error(
          "No se pudo borrar el avatar de Cloudinary:",
          cloudinaryDeleteError.message,
        );
      }
    }

    // Respondo con el usuario actualizado.
    return res.status(200).json({
      message: "Avatar eliminado correctamente",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error al eliminar el avatar:", error);

    return res.status(500).json({
      message: "Error al eliminar el avatar",
    });
  }
}

// Controlador para obtener los servicios del profesional autenticado.
// Devuelve también la categoría, la ciudad, la media de valoración y el total de reseñas de cada servicio.
async function getMyServices(req, res) {
  try {
    // Busco en la base de datos todos los servicios cuyo propietario
    // sea el usuario autenticado y los ordeno del más reciente al más antiguo.
    const services = await prisma.service.findMany({
      where: { proId: req.user.id },
      orderBy: { createdAt: "desc" },
      include: {
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

        // Incluyo solo las puntuaciones de las reseñas para calcular después
        // la media y el número total de valoraciones.
        reviews: {
          where: {
            isVisible: true,
          },
          select: {
            rating: true,
          },
        },
      },
    });

    // Recorro los servicios para calcular la media de puntuación
    // y el total de reseñas de cada uno.
    const formattedServices = services.map((service) => {
      // Calculo la media de valoración y la cantidad de reseñas del servicio.
      const { averageRating, reviewsCount } = calculateRatingData(
        service.reviews,
      );

      // Separo el array reviews del resto de datos para no devolverlo
      // en la respuesta final.
      const { reviews, ...serviceWithoutReviews } = service;

      // Devuelvo un nuevo objeto con los datos del servicio
      // más la media de valoración y el número de reseñas.
      return {
        ...serviceWithoutReviews,
        averageRating,
        reviewsCount,
      };
    });

    // Si todo va bien, respondo con código 200 y los servicios formateados.
    return res.status(200).json({ services: formattedServices });
  } catch (error) {
    // Muestro el error real solo en servidor para depuración.
    console.error("Error al obtener los servicios del usuario:", error);

    return res.status(500).json({
      message: "Error al obtener los servicios del usuario",
    });
  }
}

// Controlador para obtener el resumen del panel del usuario autenticado.
// Devuelve estadísticas distintas según el rol del usuario.
async function getMyDashboard(req, res) {
  try {
    // Busco al usuario autenticado en la base de datos y selecciono
    // solo los campos seguros que quiero devolver.
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

    // Si el usuario es CLIENT, devuelvo estadísticas relacionadas con sus solicitudes y reseñas realizadas.
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

    // Si el usuario es PRO, devuelvo estadísticas relacionadas con sus servicios,
    // las solicitudes recibidas y las valoraciones recibidas.
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
        prisma.service.count({
          where: { proId: user.id, isActive: true },
        }),
        prisma.service.count({
          where: { proId: user.id, isActive: false },
        }),
        prisma.request.count({ where: { proId: user.id } }),
        prisma.request.count({
          where: { proId: user.id, status: "PENDING" },
        }),
        prisma.request.count({
          where: { proId: user.id, status: "ACCEPTED" },
        }),
        prisma.request.count({ where: { proId: user.id, status: "DONE" } }),
        prisma.request.count({
          where: { proId: user.id, status: "REJECTED" },
        }),
        prisma.request.count({
          where: { proId: user.id, status: "CANCELLED" },
        }),
        prisma.review.aggregate({
          where: {
            proId: user.id,
            isVisible: true,
          },
          _avg: {
            rating: true,
          },
          _count: {
            id: true,
          },
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
    // Muestro el error real solo en servidor para depuración.
    console.error("Error al obtener el dashboard del usuario:", error);

    return res.status(500).json({
      message: "Error al obtener el dashboard del usuario",
    });
  }
}

// Exporto los controladores del módulo users para utilizarlos en sus rutas.
module.exports = {
  getMyProfile,
  updateMyProfile,
  deleteMyAvatar,
  getMyServices,
  getMyDashboard,
};
