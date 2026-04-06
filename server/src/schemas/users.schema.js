const { z } = require("zod");

// Esquema para actualizar el perfil del usuario autenticado.
// Solo permite modificar campos del perfil.
// No permito cambiar ni el role ni la password desde esta ruta.
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
});

// Exporto los esquemas para poder reutilizarlos en el controller.
module.exports = {
  updateMyProfileSchema,
};
