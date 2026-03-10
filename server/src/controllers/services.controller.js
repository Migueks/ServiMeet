const { z } = require("zod");
const prisma = require("../config/prisma");

// Importo la utilidad que se encarga de subir imágenes a Cloudinary.
const uploadToCloudinary = require("../utils/uploadToCloudinary");
// Importo la utilidad que se encarga de borrar imágenes de Cloudinary.
const deleteFromCloudinary = require("../utils/deleteFromCloudinary");

// Esquema para crear servicio
// Valida los datos necesarios para dar de alta un nuevo servicio y comprueba que tengan el formato y contenido esperados.
const createServiceSchema = z.object({
  title: z.string().trim().min(3, "El título debe tener al menos 3 caracteres"),
  description: z
    .string()
    .trim()
    .min(10, "La descripción debe tener al menos 10 caracteres"),
  category: z.string().trim().min(2, "La categoría es obligatoria"),
  price: z.coerce.number().positive("El precio debe ser mayor que 0"), // Uso coerce para convertir a número valores que suelen llegar como texto desde el formulario.
  zone: z.string().trim().min(2, "La zona es obligatoria"),
});

// Esquema para actualizar servicio
// Valida los campos que se quieran modificar en un servicio existente, permitiendo actualizaciones parciales solo con los datos enviados.
const updateServiceSchema = z.object({
  title: z.string().trim().min(3).optional(),
  description: z.string().trim().min(10).optional(),
  category: z.string().trim().min(2).optional(),
  price: z.coerce.number().positive().optional(), // Igual que arriba: convierto a número por si el valor llega como string en req.body.
  zone: z.string().trim().min(2).optional(),
  isActive: z.boolean().optional(),
});

// Función auxiliar para calcular la media de puntuación y el total de reseñas.
// La creo para no repetir lógica en varios controladores
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

// Controlador para obtener todos los servicios activos.
// Busca los servicios en base de datos, los ordena del más reciente al más antiguo.
// Incluye información básica del profesional asociado a cada servicio.
async function getAllServices(req, res) {
  try {
    // Consulto en la base de datos todos los servicios que estén activos.
    const services = await prisma.service.findMany({
      // Solo devuelvo los servicios activos.
      where: { isActive: true },

      // Ordeno los resultados por fecha de creación descendente.
      // Así los más nuevos aparecen primero.
      orderBy: { createdAt: "desc" },

      // Incluyo datos básicos del profesional relacionado con cada servicio.
      include: {
        pro: {
          select: {
            id: true,
            name: true,
            city: true,
            avatarUrl: true,
          },
        },
        reviews: {
          select: {
            rating: true,
          },
        },
      },
    });

    // Recorro cada servicio para calcular su media de valoración y el total de reseñas.
    // Después elimino el array reviews del listado para que la respuesta quede más limpia.
    const formattedServices = services.map((service) => {
      // Calculo la puntuación media y la cantidad de reseñas del servicio.
      const { averageRating, reviewsCount } = calculateRatingData(
        service.reviews,
      );

      // Separo las reseñas del resto de datos para no devolverlas en la respuesta final.
      const { reviews, ...serviceWithoutReviews } = service;

      // Devuelvo un nuevo objeto con los datos del servicio
      // junto con la media de puntuación y el total de reseñas.
      return {
        ...serviceWithoutReviews,
        averageRating,
        reviewsCount,
      };
    });

    // Si todo va bien, respondo con código 200 y los servicios obtenidos.
    return res.status(200).json({ services: formattedServices });
  } catch (error) {
    // Si ocurre un error durante la consulta, devuelvo un 500 junto un mensaje y el detalle del error
    return res.status(500).json({
      message: "Error al obtener los servicios",
      error: error.message,
    });
  }
}

// Controlador para obtener un servicio por su id.
// Busca el servicio en base de datos usando el id recibido en los parámetros.
// Incluye información básica del profesional y sus reseñas asociadas.
async function getServiceById(req, res) {
  try {
    // Convierto el id recibido por params a número para poder consultarlo en la base de datos.
    const id = Number(req.params.id);

    // Compruebo que el id sea un número válido antes de hacer la consulta.
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "ID de servicio no válido" });
    }

    // Busco el servicio por su id e incluyo datos básicos del profesional
    // y las reseñas relacionadas ordenadas de más reciente a más antigua.
    const service = await prisma.service.findUnique({
      where: { id },
      include: {
        pro: {
          select: {
            id: true,
            name: true,
            city: true,
            avatarUrl: true,
          },
        },
        reviews: {
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
            client: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    // Si no existe ningún servicio con ese id, devuelvo un 404.
    if (!service) {
      return res.status(404).json({ message: "Servicio no encontrado" });
    }

    // Calculo la media y el número total de reseñas del servicio.
    const { averageRating, reviewsCount } = calculateRatingData(
      service.reviews,
    );

    // Si todo va bien, respondo con código 200 y el servicio encontrado.
    return res.status(200).json({
      service: {
        ...service,
        averageRating,
        reviewsCount,
      },
    });
  } catch (error) {
    // Si ocurre un error durante la consulta, devuelvo un 500 junto con un mensaje y el detalle del error.
    return res.status(500).json({
      message: "Error al obtener el servicio",
      error: error.message,
    });
  }
}

// Controlador para crear un nuevo servicio.
// Valida los datos recibidos, crea el servicio en la base de datos y devuelve también información básica del profesional que lo publica.
async function createService(req, res) {
  try {
    // Valido los datos recibidos en el body usando el esquema de Zod.
    // "price" se convierte automáticamente a número gracias a z.coerce.number().
    const data = createServiceSchema.parse(req.body);

    // Inicializo la URL y el identificador de la imagen en null por si no se ha subido ningún archivo.
    let imageUrl = null;
    let imageId = null;

    // Si llega un archivo en req.file, lo subo a Cloudinary y guardo la URL segura y el identificador público de la imagen.
    if (req.file) {
      const uploadedImage = await uploadToCloudinary(req.file.buffer);

      imageUrl = uploadedImage.secure_url;
      imageId = uploadedImage.public_id;
    }

    // Creo el servicio en la base de datos con los datos validados y lo asocio al profesional autenticado mediante req.user.id.
    const service = await prisma.service.create({
      data: {
        title: data.title,
        description: data.description,
        category: data.category,
        price: data.price,
        zone: data.zone,
        imageUrl,
        imageId,
        proId: req.user.id,
      },
      include: {
        pro: {
          select: {
            id: true,
            name: true,
            city: true,
          },
        },
      },
    });

    // Al crearse un servicio nuevo todavía no tiene reseñas,
    // así que devuelvo la media a 0 y el contador a 0.
    return res.status(201).json({
      message: "Servicio creado correctamente",
      service: {
        ...service,
        averageRating: 0,
        reviewsCount: 0,
      },
    });
  } catch (error) {
    // Si la validación de Zod falla, devuelvo un 400 con el detalle de los campos que no cumplen el esquema.
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: "Datos inválidos",
        errors: error.issues.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        })),
      });
    }

    // Si ocurre cualquier otro error, devuelvo un 500 junto con un mensaje y el detalle del error.
    return res.status(500).json({
      message: "Error al crear el servicio",
      error: error.message,
    });
  }
}

// Controlador para actualizar un servicio existente.
// Comprueba que el id sea válido, verifica que el servicio exista y que el usuario
// tenga permisos para editarlo, valida los datos recibidos y actualiza el servicio.
async function updateService(req, res) {
  let uploadedImage = null;

  try {
    // Convierto el id recibido por params a número para poder consultarlo en la consulta.
    const id = Number(req.params.id);

    // Compruebo que el id sea válido antes de consultar la base de datos.
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "ID de servicio no válido" });
    }

    // Compruebo que la petición incluya al menos un campo para actualizar
    // Evito responder como si se hubiera modificado algo cuando no se ha enviado ningún dato.
    if (Object.keys(req.body).length === 0 && !req.file) {
      return res.status(400).json({
        message: "Debes enviar al menos un campo o una imagen para actualizar",
      });
    }

    // Busco el servicio actual para comprobar que exista y poder validar si el usuario tiene permiso para editarlo.
    const existingService = await prisma.service.findUnique({
      where: { id },
    });

    // Si no existe ningún servicio con ese id, devuelvo un 404.
    if (!existingService) {
      return res.status(404).json({ message: "Servicio no encontrado" });
    }

    // Solo permito editar el servicio a su propietario o a un usuario con rol ADMIN.
    if (existingService.proId !== req.user.id && req.user.role !== "ADMIN") {
      return res
        .status(403)
        .json({ message: "No puedes editar este servicio" });
    }

    // Valido los datos recibidos en el body usando el esquema de actualización.
    const data = updateServiceSchema.parse(req.body);

    // Compruebo que, después de validar, siga habiendo al menos un campo válido para actualizar.
    if (Object.keys(data).length === 0 && !req.file) {
      return res.status(400).json({
        message:
          "Debes enviar al menos un campo válido o una imagen para actualizar",
      });
    }

    const normalizedData = {
      ...data,
      // Si imageUrl llega como cadena vacía, la convierto a null para guardar que el servicio no tiene imagen.
      ...(data.imageUrl === "" ? { imageUrl: null } : {}),
    };

    // Guardo el id de la imagen antigua por si luego hay que borrarla tras actualizar la BD.
    const oldImageId = existingService.imageId;

    // Si se ha enviado una nueva imagen, la subo a Cloudinary para guardar después su URL e identificador en la base de datos.
    if (req.file) {
      uploadedImage = await uploadToCloudinary(req.file.buffer);

      normalizedData.imageUrl = uploadedImage.secure_url;
      normalizedData.imageId = uploadedImage.public_id;
    }

    // Actualizo el servicio en la base de datos con los datos validados e incluyo información básica del profesional asociado y las reseñas para poder calcular la media.
    const updatedService = await prisma.service.update({
      where: { id },
      data: normalizedData,
      include: {
        pro: {
          select: {
            id: true,
            name: true,
            city: true,
          },
        },
        reviews: {
          select: {
            rating: true,
          },
        },
      },
    });

    // Si la BD se ha actualizado bien y había imagen antigua, intento borrarla después.
    if (uploadedImage && oldImageId) {
      try {
        await deleteFromCloudinary(oldImageId);
      } catch (cloudinaryError) {
        console.error(
          "No se pudo borrar la imagen antigua de Cloudinary:",
          cloudinaryError.message,
        );
      }
    }

    // Calculo la media y el total de reseñas del servicio actualizado.
    const { averageRating, reviewsCount } = calculateRatingData(
      updatedService.reviews,
    );

    // Quito el array reviews de la respuesta para devolver un objeto más limpio.
    const { reviews, ...serviceWithoutReviews } = updatedService;

    // Si todo va bien, respondo con código 200 y el servicio actualizado.
    return res.status(200).json({
      message: "Servicio actualizado correctamente",
      service: {
        ...serviceWithoutReviews,
        averageRating,
        reviewsCount,
      },
    });
  } catch (error) {
    // Si ya se había subido una imagen nueva pero ha fallado después, intento borrarla para no dejar archivos huérfanos en Cloudinary.
    if (uploadedImage?.public_id) {
      try {
        await deleteFromCloudinary(uploadedImage.public_id);
      } catch (cloudinaryError) {
        console.error(
          "No se pudo borrar la imagen nueva tras el error:",
          cloudinaryError.message,
        );
      }
    }

    // Si la validación de Zod falla, devuelvo un 400 con el detalle de los campos que no cumplen el esquema.
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: "Datos inválidos",
        errors: error.issues.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        })),
      });
    }

    // Si ocurre cualquier otro error, devuelvo un 500 junto con un mensaje y el detalle del error.
    return res.status(500).json({
      message: "Error al actualizar el servicio",
      error: error.message,
    });
  }
}

// Controlador para eliminar un servicio existente.
// Comprueba que el id sea válido, verifica que el servicio exista y que el usuario
// tenga permisos para eliminarlo antes de borrarlo de la base de datos.
async function deleteService(req, res) {
  try {
    // Convierto el id recibido por params a número para poder consultarlo en la consulta.
    const id = Number(req.params.id);

    // Compruebo que el id sea válido antes de consultar la base de datos.
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "ID de servicio no válido" });
    }

    // Busco el servicio actual para comprobar que exista y poder validar si el usuario tiene permiso para eliminarlo.
    const existingService = await prisma.service.findUnique({
      where: { id },
    });

    // Si no existe ningún servicio con ese id, devuelvo un 404.
    if (!existingService) {
      return res.status(404).json({ message: "Servicio no encontrado" });
    }

    // Solo permito eliminar el servicio a su propietario o a un usuario con rol ADMIN.
    if (existingService.proId !== req.user.id && req.user.role !== "ADMIN") {
      return res
        .status(403)
        .json({ message: "No puedes eliminar este servicio" });
    }

    // Guardo el imageId antiguo para intentar borrar la imagen después de eliminar el servicio de la BD.
    const oldImageId = existingService.imageId;

    // Elimino el servicio de la base de datos.
    await prisma.service.delete({
      where: { id },
    });

    // Si el servicio tenía imagen en Cloudinary, intento borrarla después.
    if (oldImageId) {
      try {
        await deleteFromCloudinary(oldImageId);
      } catch (cloudinaryError) {
        console.error(
          "No se pudo borrar la imagen de Cloudinary:",
          cloudinaryError.message,
        );
      }
    }

    // Si todo va bien, respondo con código 200 y un mensaje de confirmación.
    return res
      .status(200)
      .json({ message: "Servicio eliminado correctamente" });
  } catch (error) {
    // Si ocurre cualquier error durante el proceso, devuelvo un 500 junto con un mensaje y el detalle del error.
    return res.status(500).json({
      message: "Error al eliminar el servicio",
      error: error.message,
    });
  }
}

// Exporto los controladores de servicios para poder utilizarlos en sus rutas correspondientes.
module.exports = {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
};
