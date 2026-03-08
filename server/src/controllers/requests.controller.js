const { z } = require("zod");
const prisma = require("../config/prisma");

// Esquema para crear una solicitud.
// Valida que se envíe un id de servicio válido y un mensaje con una longitud adecuada.
const createRequestSchema = z.object({
  serviceId: z.coerce.number().int().positive("El serviceId debe ser válido"), // Uso coerce para convertir a número valores que suelen llegar como texto desde el formulario.
  message: z
    .string()
    .trim()
    .min(3, "El mensaje debe tener al menos 3 caracteres")
    .max(500, "El mensaje no puede superar los 500 caracteres"),
});

// Esquema para actualizar el estado de una solicitud.
// Solo permite los estados definidos en el enum.
const updateRequestStatusSchema = z.object({
  status: z.enum(["PENDING", "ACCEPTED", "REJECTED", "DONE"], {
    errorMap: () => ({ message: "Estado no válido" }),
  }),
});

// Controlador para crear una nueva solicitud.
// Valida los datos recibidos, comprueba que el servicio exista y esté disponible, evita solicitudes duplicadas o sobre servicios propios, y crea la solicitud.
async function createRequest(req, res) {
  try {
    // Valido los datos recibidos en el body usando el esquema de Zod.
    const parsedData = createRequestSchema.safeParse(req.body);

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
    const { serviceId, message } = parsedData.data;

    // Busco el servicio solicitado para comprobar que exista.
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    // Si el servicio no existe, devuelvo un 404.
    if (!service) {
      return res.status(404).json({ message: "Servicio no encontrado" });
    }

    // Si el servicio existe pero no está activo, no permito crear la solicitud.
    if (!service.isActive) {
      return res
        .status(400)
        .json({ message: "El servicio no está disponible" });
    }

    // Impido que un profesional solicite su propio servicio.
    if (service.proId === req.user.id) {
      return res.status(400).json({
        message: "No puedes solicitar tu propio servicio",
      });
    }

    // Compruebo si el usuario ya tiene una solicitud activa para este servicio.
    const existingRequest = await prisma.request.findFirst({
      where: {
        serviceId,
        clientId: req.user.id,
        status: {
          in: ["PENDING", "ACCEPTED"],
        },
      },
    });

    // Si ya existe una solicitud activa, no permito crear otra.
    if (existingRequest) {
      return res.status(400).json({
        message: "Ya tienes una solicitud activa para este servicio",
      });
    }

    // Creo la nueva solicitud en la base de datos y la relaciono con el cliente, el profesional y el servicio.
    const request = await prisma.request.create({
      data: {
        message,
        serviceId,
        clientId: req.user.id,
        proId: service.proId,
      },
      include: {
        service: {
          select: {
            id: true,
            title: true,
            category: true,
            price: true,
            zone: true,
          },
        },
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
      },
    });

    // Si todo va bien, respondo con código 201 y la solicitud creada.
    return res.status(201).json({
      message: "Solicitud creada correctamente",
      request,
    });
  } catch (error) {
    // Si ocurre cualquier otro error, devuelvo un 500 junto con un mensaje y el detalle del error.
    return res.status(500).json({
      message: "Error al crear la solicitud",
      error: error.message,
    });
  }
}

// Controlador para obtener las solicitudes del cliente autenticado.
// Busca todas sus solicitudes, las ordena de más reciente a más antigua e incluye información básica del servicio y del profesional asociado.
async function getMyClientRequests(req, res) {
  try {
    // Consulto en la base de datos todas las solicitudes cuyo clientId coincide con el usuario autenticado.
    const requests = await prisma.request.findMany({
      where: {
        clientId: req.user.id,
      },

      // Ordeno las solicitudes por fecha de creación descendente para mostrar primero las más recientes.
      orderBy: {
        createdAt: "desc",
      },

      // Incluyo información básica del servicio solicitad y del profesional asociado a cada solicitud.
      include: {
        service: {
          select: {
            id: true,
            title: true,
            category: true,
            price: true,
            zone: true,
            imageUrl: true,
          },
        },
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

    // Si todo va bien, respondo con código 200 y las solicitudes encontradas.
    return res.status(200).json({ requests });
  } catch (error) {
    // Si ocurre un error durante la consulta, devuelvo un 500 junto con un mensaje y el detalle del error.
    return res.status(500).json({
      message: "Error al obtener las solicitudes del cliente",
      error: error.message,
    });
  }
}

// Controlador para obtener las solicitudes del profesional autenticado.
// Busca todas las solicitudes recibidas por sus servicios, las ordena de más reciente a más antigua e incluye información básica del servicio y del cliente asociado.
async function getMyProRequests(req, res) {
  try {
    // Consulto en la base de datos todas las solicitudes cuyo proId coincide con el usuario autenticado.
    const requests = await prisma.request.findMany({
      where: {
        proId: req.user.id,
      },
      // Ordeno las solicitudes por fecha de creación descendente para mostrar primero las más recientes.
      orderBy: {
        createdAt: "desc",
      },
      // Incluyo información básica del servicio solicitado y del cliente que ha creado cada solicitud.
      include: {
        service: {
          select: {
            id: true,
            title: true,
            category: true,
            price: true,
            zone: true,
            imageUrl: true,
          },
        },
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

    // Si todo va bien, respondo con código 200 y las solicitudes encontradas.
    return res.status(200).json({ requests });
  } catch (error) {
    // Si ocurre un error durante la consulta, devuelvo un 500 junto con un mensaje y el detalle del error.
    return res.status(500).json({
      message: "Error al obtener las solicitudes del profesional",
      error: error.message,
    });
  }
}

// Controlador para actualizar el estado de una solicitud.
// Comprueba que el id sea válido, valida el nuevo estado recibido, verifica que la solicitud exista y que el usuario tenga permisos para cambiarla.
async function updateRequestStatus(req, res) {
  try {
    // Convierto el id recibido por params a número para poder usarlo en la consulta.
    const id = Number(req.params.id);

    // Compruebo que el id sea válido antes de consultar la base de datos.
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "ID de solicitud no válido" });
    }

    // Valido el estado recibido en el body usando el esquema correspondiente.
    const parsedData = updateRequestStatusSchema.safeParse(req.body);

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

    // Busco la solicitud actual para comprobar que exista.
    const existingRequest = await prisma.request.findUnique({
      where: { id },
    });

    // Si no existe ninguna solicitud con ese id, devuelvo un 404.
    if (!existingRequest) {
      return res.status(404).json({ message: "Solicitud no encontrada" });
    }

    // Compruebo si el usuario autenticado es el profesional propietario de la solicitud o un administrador.
    const isOwnerPro = existingRequest.proId === req.user.id;
    const isAdmin = req.user.role === "ADMIN";

    // Si no cumple ninguna de las dos condiciones, no permito la actualización.
    if (!isOwnerPro && !isAdmin) {
      return res.status(403).json({
        message: "No tienes permisos para actualizar esta solicitud",
      });
    }

    // Actualizo el estado de la solicitud con el valor ya validado.
    const updatedRequest = await prisma.request.update({
      where: { id },
      data: {
        status: parsedData.data.status,
      },
      include: {
        service: {
          select: {
            id: true,
            title: true,
            category: true,
            price: true,
            zone: true,
          },
        },
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
      },
    });

    // Si todo va bien, respondo con código 200 y la solicitud actualizada.
    return res.status(200).json({
      message: "Estado de la solicitud actualizado correctamente",
      request: updatedRequest,
    });
  } catch (error) {
    // Si ocurre un error durante la actualización, devuelvo un 500 junto con un mensaje y el detalle del error.
    return res.status(500).json({
      message: "Error al actualizar el estado de la solicitud",
      error: error.message,
    });
  }
}

// Exporto los controladores de solicitudes para poder utilizarlos en sus rutas correspondientes.
module.exports = {
  createRequest,
  getMyClientRequests,
  getMyProRequests,
  updateRequestStatus,
};
