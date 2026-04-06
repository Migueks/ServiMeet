const { z } = require("zod");

// Valido y normalizo el email.
const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Email no válido")
  .max(254, "Email demasiado largo");

// Valido la contraseña con requisitos de seguridad.
const passwordSchema = z
  .string()
  .min(8, "La contraseña debe tener al menos 8 caracteres")
  .max(72, "La contraseña es demasiado larga")
  .regex(/[a-z]/, "Debe incluir una letra minúscula")
  .regex(/[A-Z]/, "Debe incluir una letra mayúscula")
  .regex(/\d/, "Debe incluir un número")
  .regex(/[^A-Za-z0-9]/, "Debe incluir un símbolo")
  .refine((p) => !/\s/.test(p), "No puede contener espacios");

// Schema para register
const registerSchema = z.object({
  name: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: emailSchema,
  password: passwordSchema,
  role: z.enum(["CLIENT", "PRO"]).optional(),
  city: z
    .string()
    .trim()
    .min(2, "La ciudad debe tener al menos 2 caracteres")
    .optional(),
});

// Schema para login
const loginSchema = z.object({
  email: emailSchema,
  password: z.string().trim().min(1, "Contraseña requerida"),
});

module.exports = {
  emailSchema,
  passwordSchema,
  registerSchema,
  loginSchema,
};
