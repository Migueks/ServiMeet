// Lógica de autenticación:
// - register: valida datos, comprueba email único, hashea password y crea el usuario.
// - login: comprueba credenciales y devuelve un JWT.
// - me: devuelve datos del usuario autenticado.

// Librería para hashear y comparar contraseñas de forma segura.
const bcrypt = require("bcrypt");
// Librería para generar y verificar tokens JWT (autenticación).
const jwt = require("jsonwebtoken");
// Zod: validación de datos de entrada (schemas) para requests.
const { z } = require("zod");

const prisma = require("../config/prisma");

// Valido y normalizo el email con zod.
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

// Valido el body del registro de usuario.
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

// Valido el body del login.
const loginSchema = z.object({
  email: emailSchema,
  password: z.string().trim().min(1, "Contraseña requerida"),
});

// Genero (firma) un JWT con la info mínima del usuario para autenticar y autorizar peticiones.
function signToken(user) {
  return jwt.sign(
    {
      // Payload del token: guardo solo lo necesario para identificar y autorizar al usuario.
      sub: user.id, // "subject": identificador único del usuario.
      role: user.role, // rol para controlar permisos (CLIENT/PRO/ADMIN).
    },
    process.env.JWT_SECRET, // clave secreta usada para firmar el token (debe estar en .env).
    { expiresIn: "7d" }, // El token expira en 7 días.
  );
}

async function register(req, res) {
  try {
    // 1) Valido body.
    const data = registerSchema.parse(req.body);

    // 2) Hasheo la contraseña.
    const passwordHash = await bcrypt.hash(data.password, 10);

    // 3) Creo usuario.
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: passwordHash,
        role: data.role || "CLIENT",
        city: data.city || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        city: true,
        createdAt: true,
      },
    });

    // 4) devuelvo usuario creado sin la contraseña (No se selecciona en el "select").
    return res.status(201).json({ user });
  } catch (error) {
    // Zod llanza errores de validación con una estructura propia.
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: "Datos inválidos",
        errors: error.issues.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        })),
      });
    }

    // Si Prisma lanza un error de restricción UNIQUE (email duplicado).
    if (error.code === "P2002" && error.meta?.target?.includes("email")) {
      return res
        .status(409)
        .json({ message: "Ese correo electrónico ya está registrado." });
    }

    return res
      .status(500)
      .json({ message: "Error en el registro", error: error.message });
  }
}

async function login(req, res) {
  try {
    // 1) Valido body (y normalizo email con emailSchema dentro de loginSchema).
    const data = loginSchema.parse(req.body);

    // 2) Busco usuario por email.
    // Selecciono solo lo necesario (incluyo contraseña para comparar).
    const user = await prisma.user.findUnique({
      where: { email: data.email },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        city: true,
        password: true,
      },
    });

    // 3) Si no existe o la contraseña no coincide, devuelvo el mismo mensaje para no dar pistas.
    if (!user) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    const ok = await bcrypt.compare(data.password, user.password);
    if (!ok) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    // 4) Firmo token y devuelvo los datos del usuario (sin contraseña).
    const token = signToken(user);

    const { password, ...safeUser } = user;

    return res.status(200).json({ token, user: safeUser });
  } catch (error) {
    // Errores de validación (Zod).
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: "Datos inválidos",
        errors: error.issues.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        })),
      });
    }

    return res
      .status(500)
      .json({ message: "Error en login", error: error.message });
  }
}

// Exporto los controladores para usarlos en las rutas de /auth
module.exports = { register, login };
