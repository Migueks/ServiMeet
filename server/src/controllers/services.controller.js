const { z, includes } = require("zod");
const prisma = require("../config/prisma");

// Esquema para crear servicio
const createServiceSchema = z.object({
  title: z.string().trim().min(3, "El título debe tener al menos 3 caracteres"),
  description: z
    .string()
    .trim()
    .min(10, "La descripción debe tener al menos 10 caracteres"),
  category: z.string().trim().min(2, "La categoría es obligatoria"),
  price: z.coerce.number().positive("El precio debe ser mayor que 0"), // Uso coerce para convertir a número valores que suelen llegar como texto desde el formulario.
  zone: z.string().trim().min(2, "La zona es obligatoria"),
  imageUrl: z.preprocess(
    // Uso preprocess para que si llega "" desde el formulario se transforme en undefined y no falle al no ser obligatoria.
    (value) => (value === "" ? undefined : value),
    z.string().trim().url("La imagen debe ser una URL válida").optional(),
  ),
});

// Esquema para actualizar servucio
const updateServiceSchema = z.object({
  title: z.string().trim().min(3).optional(),
  description: z.string().trim().min(10).optional(),
  category: z.string().trim().min(2).optional(),
  price: z.coerce.number().positive().optional(), // Igual que arriba: convierto a número por si el valor llega como string en req.body.
  zone: z.string().trim().min(2).optional(),
  imageUrl: z
    .union([
      z.string().trim().url("La imagen debe ser una URL válida"), // Permito una URL válida si el usuario quiere guardar una imagen.
      z.literal(""), // También permito una cadena vacía por si el campo llega vacío desde el formulario.
    ])
    .optional(),
  isActive: z.boolean().optional(),
});

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
      },
    });

    // Si todo va bien, respondo con código 200 y los servicios obtenidos.
    return res.status(200).json({ services });
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
// INcluye información básica del profesional y sus reseñas asociadas.
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

    // Si todo va bien, respondo con código 200 y el servicio encontrado.
    return res.status(200).json({ service });
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
  // Valido los datos recibidos en el body usando el esquema de Zod.
  // "price" se convierte automáticamente a número gracias a z.coerce.number().
  try {
    const data = createServiceSchema.parse(req.body);

    // Creo el servicio en la base de datos con los datos validados y lo asocio al profesional autenticado mediante req.user.id.
    const service = await prisma.service.create({
      data: {
        title: data.title,
        description: data.description,
        category: data.category,
        price: data.price,
        zone: data.zone,
        imageUrl: data.imageUrl || null, // Si no se ha enviado imagen, guardo null en la base de datos.
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

    // Si todo va bien, respondo con código 201 y el servicio creado.
    return res.status(201).json({
      message: "Servicio creado correctamente",
      service,
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
  try {
    // Convierto el id recibido por params a número para poder consultarlo en la consulta.
    const id = Number(req.params.id);

    // Compruebo que el id sea válido antes de consultar la base de datos.
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "ID de servicio no válido" });
    }

    // Compruebo que la petición incluya al menos un campo para actualizar
    // Evito responder como si se hubiera modificado algo cuando no se ha enviado ningún dato.
    if (Object.keys(req.body).length === 0) {
      return res.status(400).json({
        message: "Debes enviar al menos un campo para actualizar",
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

    const normalizedData = {
      ...data,
      // Si imageUrl llega como cadena vacía, la convierto a null para guardar que el servicio no tiene imagen.
      ...(data.imageUrl === "" ? { imageUrl: null } : {}),
    };

    // Actualizo el servicio en la base de datos con los datos validados e incluyo información básica del profesional asociado.
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
      },
    });

    // Si todo va bien, respondo con código 200 y el servicio actualizado.
    return res.status(200).json({
      message: "Servicio actualizado correctamente",
      service: updatedService,
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

    console.error(error);
    console.error(error.stack);

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

    // Elimino el servicio de la base de datos.
    await prisma.service.delete({
      where: { id },
    });

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
