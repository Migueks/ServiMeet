const { z } = require("zod");

// Helper de Zod para convertir a booleano los valores que llegan desde FormData.
// Esto es útil porque FormData suele enviar los datos como texto, por ejemplo:
// "true" o "false", en lugar de true o false reales.
const booleanFromFormData = z.preprocess((value) => {
  // Si el valor ya es un booleano real, lo devuelvo tal cual.
  if (typeof value === "boolean") return value;

  // Si el valor llega como texto, lo normalizo para poder comprobarlo bien.
  if (typeof value === "string") {
    const normalizedValue = value.trim().toLowerCase();

    // Si el texto es "true", lo convierto a true.
    if (normalizedValue === "true") return true;

    // Si el texto es "false", lo convierto a false.
    if (normalizedValue === "false") return false;
  }

  // Si no coincide con ninguno de los casos anteriores, lo dejo pasar tal cual para que Zod lo valide después.
  return value;
}, z.boolean());

// Esquema para crear servicio
// Valida los datos necesarios para dar de alta un nuevo servicio y comprueba que tengan el formato y contenido esperados.
const createServiceSchema = z.object({
  title: z.string().trim().min(3, "El título debe tener al menos 3 caracteres"),
  description: z
    .string()
    .trim()
    .min(10, "La descripción debe tener al menos 10 caracteres"),
  categoryId: z.coerce
    .number()
    .int("La categoría debe ser válida")
    .positive("La categoría debe ser válida"),
  cityId: z.coerce
    .number()
    .int("La ciudad debe ser válida")
    .positive("La ciudad debe ser válida"),
  price: z.coerce.number().positive("El precio debe ser mayor que 0"), // Uso coerce para convertir a número valores que suelen llegar como texto desde el formulario.
});

// Esquema para actualizar servicio
// Valida los campos que se quieran modificar en un servicio existente, permitiendo actualizaciones parciales solo con los datos enviados.
const updateServiceSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "El título debe tener al menos 3 caracteres")
    .optional(),
  description: z
    .string()
    .trim()
    .min(10, "La descripción debe tener al menos 10 caracteres")
    .optional(),
  categoryId: z.coerce
    .number()
    .int("La categoría debe ser válida")
    .positive("La categoría debe ser válida")
    .optional(),
  cityId: z.coerce
    .number()
    .int("La ciudad debe ser válida")
    .positive("La ciudad debe ser válida")
    .optional(),
  price: z.coerce
    .number()
    .positive("El precio debe ser mayor que 0")
    .optional(), // Igual que arriba: convierto a número por si el valor llega como string en req.body.
  isActive: booleanFromFormData.optional(),
});

// Exporto los esquemas para poder reutilizarlos en el controller.
module.exports = {
  createServiceSchema,
  updateServiceSchema,
};
