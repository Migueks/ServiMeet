const { z } = require("zod");

// Esquema para crear una reseña
// Valida que se envíe un id de solicitud válido, una puntuación entre 1 y 5 y un comentario con una longitud adecuada.
const createReviewSchema = z.object({
  requestId: z.coerce.number().int().positive("El requestId debe ser válido"), // Uso coerce para convertir a número valores que suelen llegar como texto desde el formulario.
  rating: z.coerce
    .number()
    .int("La puntuación debe ser un número entero")
    .min(1, "La puntuación mínima es 1")
    .max(5, "La puntuación máxima es 5"),
  comment: z
    .string()
    .trim()
    .min(3, "El comentario debe tener al menos 3 caracteres")
    .max(500, "El comentario no puede superar los 500 caracteres"),
});

// Exporto el esquema para reutilizarlo dentro del controller.
module.exports = {
  createReviewSchema,
};
