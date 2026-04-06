const { z } = require("zod");

// Esquema de validación para el formulario de contacto
const createContactSchema = z.object({
  // Campo nombre:
  // - Debe ser un texto
  // - Se eliminan espacios al principio y al final con trim()
  // - Mínimo 2 caracteres
  // - Máximo 80 caracteres
  name: z
    .string()
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(80, "El nombre no puede superar los 80 caracteres"),

  // Campo ciudad:
  // - Debe ser un texto
  // - Se eliminan espacios sobrantes
  // - Mínimo 2 caracteres
  // - Máximo 80 caracteres
  city: z
    .string()
    .trim()
    .min(2, "La ciudad debe tener al menos 2 caracteres")
    .max(80, "La ciudad no puede superar los 80 caracteres"),

  // Campo email:
  // - Debe ser un texto
  // - Se eliminan espacios al inicio y al final
  // - Debe tener formato válido de correo electrónico
  // - Longitud máxima de 254 caracteres
  email: z
    .string()
    .trim()
    .email("Introduce un email válido")
    .max(254, "El email es demasiado largo"),

  // Campo mensaje:
  // - Debe ser un texto
  // - Se eliminan espacios sobrantes
  // - Mínimo 10 caracteres para evitar mensajes demasiado cortos
  // - Máximo 1000 caracteres
  message: z
    .string()
    .trim()
    .min(10, "El mensaje debe tener al menos 10 caracteres")
    .max(1000, "El mensaje no puede superar los 1000 caracteres"),
});

module.exports = { createContactSchema };
