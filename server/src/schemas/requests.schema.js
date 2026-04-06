const { z } = require("zod");

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
  status: z.enum(["PENDING", "ACCEPTED", "REJECTED", "DONE", "CANCELLED"], {
    errorMap: () => ({ message: "Estado no válido" }),
  }),
});

// Exporto los esquemas para poder utilizarlos en el controller.
module.exports = {
  createRequestSchema,
  updateRequestStatusSchema,
};
