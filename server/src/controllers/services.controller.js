const prisma = require("../config/prisma");
const {
  createServiceSchema,
  updateServiceSchema,
} = require("../schemas/services.schema");

// Importo la utilidad que se encarga de subir imágenes a Cloudinary.
const uploadToCloudinary = require("../utils/uploadToCloudinary");
// Importo la utilidad que se encarga de borrar imágenes de Cloudinary.
const deleteFromCloudinary = require("../utils/deleteFromCloudinary");
// Importo la utilidad que se encarga de comprobar si el archivo subido es una imagen válida.
const validateRealImageType = require("../utils/validateRealImageType");

// Función auxiliar para calcular la media de puntuación y el total de reseñas.
// La creo para no repetir lógica en varios controladores.
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
// Incluye información básica del profesional asociado a cada servicio, su categoría, su ciudad y sus reseñas para calcular la media.
async function getAllServices(req, res) {
  try {
    // Consulto en la base de datos todos los servicios que estén activos.
    const services = await prisma.service.findMany({
      // Solo devuelvo los servicios activos.
      where: { isActive: true },

      // Ordeno los resultados por fecha de creación descendente.
      // Así los más nuevos aparecen primero.
      orderBy: { createdAt: "desc" },

      // Incluyo datos básicos del profesional relacionado con cada servicio,
      // su categoría, su ciudad y sus reseñas para calcular la media.
      include: {
        pro: {
          select: {
            id: true,
            name: true,
            city: true,
            avatarUrl: true,
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
    // Muestro el error real solo en servidor para depuración.
    console.error("Error al obtener los servicios:", error);

    return res.status(500).json({
      message: "Error al obtener los servicios",
    });
  }
}

// Controlador para obtener un servicio por su id.
// Busca el servicio en base de datos usando el id recibido en los parámetros.
// Incluye información básica del profesional, su categoría, su ciudad y sus reseñas asociadas.
async function getServiceById(req, res) {
  try {
    // Convierto el id recibido por params a número para poder consultarlo en la base de datos.
    const id = Number(req.params.id);

    // Compruebo que el id sea un número válido antes de hacer la consulta.
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "ID de servicio no válido" });
    }

    // Busco el servicio por su id e incluyo datos básicos del profesional,
    // la categoría, la ciudad y las reseñas relacionadas ordenadas de más reciente a más antigua.
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
        reviews: {
          where: {
            isVisible: true,
          },
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
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    // Si no existe ningún servicio con ese id, devuelvo un 404.
    if (!service) {
      return res.status(404).json({ message: "Servicio no encontrado" });
    }

    // Compruebo si el usuario autenticado es el propietario del servicio.
    const isOwner = req.user?.id === service.proId;
    // Compruebo si el usuario autenticado tiene rol de administrador.
    const isAdmin = req.user?.role === "ADMIN";

    // Si el servicio está inactivo, solo pueden verlo: su propietario o un administrador
    // Cualquier otro usuario recibirá un 404 como si el servicio no existiera.
    if (!service.isActive && !isOwner && !isAdmin) {
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
    // Muestro el error real solo en servidor para depuración.
    console.error("Error al obtener el servicio:", error);

    return res.status(500).json({
      message: "Error al obtener el servicio",
    });
  }
}

// Controlador para crear un nuevo servicio.
// Valida los datos recibidos, comprueba que existan la categoría y la ciudad,
// crea el servicio en la base de datos y devuelve también información básica del profesional que lo publica.
async function createService(req, res) {
  try {
    // Valido los datos recibidos en el body usando el esquema de Zod.
    // "price", "categoryId" y "cityId" se convierten automáticamente a número gracias a z.coerce.number().
    const parsedData = createServiceSchema.safeParse(req.body);

    // Si la validación falla, devuelvo un 400 con el detalle de los campos que no cumplen el esquema.
    if (!parsedData.success) {
      return res.status(400).json({
        message: "Datos inválidos",
        errors: parsedData.error.issues.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        })),
      });
    }

    // Extraigo los datos ya validados para trabajar con ellos de forma segura.
    const data = parsedData.data;

    // Compruebo que la categoría exista.
    const categoryExists = await prisma.category.findUnique({
      where: { id: data.categoryId },
    });

    if (!categoryExists) {
      return res.status(404).json({ message: "Categoría no encontrada" });
    }

    // Compruebo que la ciudad exista.
    const cityExists = await prisma.city.findUnique({
      where: { id: data.cityId },
    });

    if (!cityExists) {
      return res.status(404).json({ message: "Ciudad no encontrada" });
    }

    // Inicializo la URL y el identificador de la imagen en null por si no se ha subido ningún archivo.
    let imageUrl = null;
    let imageId = null;

    // Si el cliente ha enviado un archivo en req.file...
    if (req.file) {
      // ...compruebo primero que el contenido del archivo corresponda realmente a una imagen válida.
      const isRealImage = await validateRealImageType(req.file);

      // Si el archivo no es una imagen válida, detengo el proceso y devuelvo un error al cliente.
      if (!isRealImage) {
        return res.status(400).json({
          message: "El archivo subido no es una imagen válida",
        });
      }

      // Si la imagen es válida, la subo a Cloudinary.
      const uploadedImage = await uploadToCloudinary(req.file.buffer);

      // Guardo la URL pública segura de la imagen y su identificador
      // para poder almacenarlos después en la base de datos.
      imageUrl = uploadedImage.secure_url;
      imageId = uploadedImage.public_id;
    }

    // Creo el servicio en la base de datos con los datos validados y lo asocio al profesional autenticado mediante req.user.id.
    const service = await prisma.service.create({
      data: {
        title: data.title,
        description: data.description,
        categoryId: data.categoryId,
        cityId: data.cityId,
        price: data.price,
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

    // Al crearse un servicio nuevo todavía no tiene reseñas, así que devuelvo la media a 0 y el contador a 0.
    return res.status(201).json({
      message: "Servicio creado correctamente",
      service: {
        ...service,
        averageRating: 0,
        reviewsCount: 0,
      },
    });
  } catch (error) {
    // Muestro el error real solo en servidor para depuración.
    console.error("Error al crear el servicio:", error);

    return res.status(500).json({
      message: "Error al crear el servicio",
    });
  }
}

// Controlador para actualizar un servicio existente.
// Comprueba que el id sea válido, verifica que el servicio exista y que el usuario tenga permisos para editarlo, valida los datos recibidos, comprueba si la nueva categoría y la nueva ciudad existen, gestiona una posible nueva imagen y actualiza el servicio.
async function updateService(req, res) {
  let uploadedImage = null;

  try {
    // Convierto el id recibido por params a número para poder consultarlo en la consulta.
    const id = Number(req.params.id);

    // Compruebo que el id sea válido antes de consultar la base de datos.
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "ID de servicio no válido" });
    }

    // Compruebo que la petición incluya al menos un campo para actualizar.
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
    const parsedData = updateServiceSchema.safeParse(req.body);

    // Si la validación falla, devuelvo un 400 con el detalle de los campos que no cumplen el esquema.
    if (!parsedData.success) {
      return res.status(400).json({
        message: "Datos inválidos",
        errors: parsedData.error.issues.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        })),
      });
    }

    // Extraigo los datos validados.
    const data = parsedData.data;

    // Compruebo que, después de validar, siga habiendo al menos un campo válido para actualizar.
    if (Object.keys(data).length === 0 && !req.file) {
      return res.status(400).json({
        message:
          "Debes enviar al menos un campo válido o una imagen para actualizar",
      });
    }

    // Si se quiere cambiar la categoría, compruebo que exista.
    if (data.categoryId !== undefined) {
      const categoryExists = await prisma.category.findUnique({
        where: { id: data.categoryId },
      });

      if (!categoryExists) {
        return res.status(404).json({ message: "Categoría no encontrada" });
      }
    }

    // Si se quiere cambiar la ciudad, compruebo que exista.
    if (data.cityId !== undefined) {
      const cityExists = await prisma.city.findUnique({
        where: { id: data.cityId },
      });

      if (!cityExists) {
        return res.status(404).json({ message: "Ciudad no encontrada" });
      }
    }

    const normalizedData = { ...data };

    // Guardo el id de la imagen antigua por si luego hay que borrarla tras actualizar la BD.
    const oldImageId = existingService.imageId;

    // Si se ha enviado una nueva imagen...
    if (req.file) {
      // ...compruebo primero que el archivo sea realmente una imagen válida antes de subirlo a Cloudinary.
      const isRealImage = await validateRealImageType(req.file);

      // Si el archivo no es una imagen válida, detengo el proceso y devuelvo un error al cliente.
      if (!isRealImage) {
        return res.status(400).json({
          message: "El archivo subido no es una imagen válida",
        });
      }

      // Si la imagen es válida, la subo a Cloudinary.
      uploadedImage = await uploadToCloudinary(req.file.buffer);

      // Guardo en los datos normalizados la URL pública segura de la imagen
      // y su identificador para poder almacenarlos después en la base de datos.
      normalizedData.imageUrl = uploadedImage.secure_url;
      normalizedData.imageId = uploadedImage.public_id;
    }

    // Actualizo el servicio en la base de datos con los datos validados e incluyo información básica del profesional asociado, la categoría, la ciudad y las reseñas para poder calcular la media.
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

    // Muestro el error real solo en servidor para depuración.
    console.error("Error al actualizar el servicio:", error);

    return res.status(500).json({
      message: "Error al actualizar el servicio",
    });
  }
}

// Controlador para retirar un servicio del marketplace sin borrarlo físicamente.
// En lugar de eliminar el registro, lo marco como inactivo para conservar solicitudes, reseñas e información histórica.
async function deleteService(req, res) {
  try {
    // Convierto el id recibido por params a número para poder usarlo en la consulta.
    const id = Number(req.params.id);

    // Compruebo que el id sea válido.
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "ID de servicio no válido" });
    }

    // Busco el servicio actual para comprobar que exista y validar si el usuario tiene permiso para retirarlo.
    const existingService = await prisma.service.findUnique({
      where: { id },
    });

    // Si no existe ningún servicio con ese id, devuelvo 404.
    if (!existingService) {
      return res.status(404).json({ message: "Servicio no encontrado" });
    }

    // Solo permito retirar el servicio a su propietario o a un ADMIN.
    if (existingService.proId !== req.user.id && req.user.role !== "ADMIN") {
      return res
        .status(403)
        .json({ message: "No puedes retirar este servicio" });
    }

    // Si ya estaba inactivo, no hago nada más.
    if (!existingService.isActive) {
      return res.status(200).json({
        message: "El servicio ya estaba retirado del marketplace",
      });
    }

    // Marco el servicio como inactivo en vez de borrarlo.
    // No elimino su imagen de Cloudinary porque el servicio podrá reactivarse después.
    const archivedService = await prisma.service.update({
      where: { id },
      data: {
        isActive: false,
      },
      include: {
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

    // Devuelvo confirmación.
    return res.status(200).json({
      message: "Servicio retirado del marketplace correctamente",
      service: archivedService,
    });
  } catch (error) {
    console.error("Error al retirar el servicio:", error);

    return res.status(500).json({
      message: "Error al retirar el servicio",
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
