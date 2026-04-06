// Lógica de autenticación:
// - register: valida datos, comprueba email único, hashea password y crea el usuario.
// - login: comprueba credenciales y devuelve un JWT.

// Librería para hashear y comparar contraseñas de forma segura.
const bcrypt = require("bcrypt");
// Librería para generar y verificar tokens JWT (autenticación).
const jwt = require("jsonwebtoken");

const prisma = require("../config/prisma");
const { registerSchema, loginSchema } = require("../schemas/auth.schema");

// Genero (firma) un JWT con la info mínima del usuario para autenticar y autorizar peticiones.
function signToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );
}

async function register(req, res) {
  try {
    // 1) Valido body.
    const result = registerSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message: "Datos inválidos",
        errors: result.error.issues.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        })),
      });
    }

    const data = result.data;

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

    // 4) Devuelvo usuario creado sin contraseña.
    return res.status(201).json({ user });
  } catch (error) {
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
    // 1) Valido body.
    const result = loginSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message: "Datos inválidos",
        errors: result.error.issues.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        })),
      });
    }

    const data = result.data;

    // 2) Busco usuario por email.
    const user = await prisma.user.findUnique({
      where: { email: data.email },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        city: true,
        password: true,
        isBlocked: true,
      },
    });

    // 3) Si no existe o la contraseña no coincide, devuelvo el mismo mensaje.
    if (!user) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    // Compruebo si la cuenta del usuario está bloqueada y mando mensaje.
    if (user.isBlocked) {
      return res.status(403).json({
        message: "Tu cuenta está bloqueada. Contacta con administración.",
      });
    }

    const ok = await bcrypt.compare(data.password, user.password);

    if (!ok) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    // 4) Firmo token y devuelvo datos seguros.
    const token = signToken(user);
    const { password, isBlocked, ...safeUser } = user;

    return res.status(200).json({ token, user: safeUser });
  } catch (error) {
    // Muestro el error real solo en servidor para depuración.
    console.error("Error en login:", error);

    return res.status(500).json({
      message: "Error interno del servidor",
    });
  }
}

module.exports = { register, login };
