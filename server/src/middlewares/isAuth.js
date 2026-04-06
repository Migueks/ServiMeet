// Middleware para proteger rutas con JSON Web Token (JWT).
// El objetivo es permitir el acceso SOLO si la petición trae un JWT válido
// y además comprobar que el usuario sigue existiendo en base de datos y no está bloqueado.
// Se espera el header: Authorization: Bearer <token> (tipo de autenticación estándar para JWT).

const jwt = require("jsonwebtoken"); // Librería para verificar (y firmar) tokens JWT.
const prisma = require("../config/prisma"); // Instancia de Prisma para consultar usuarios en la base de datos.

async function isAuth(req, res, next) {
  try {
    // Primero compruebo que existe la clave secreta para verificar JWT.
    // Si no existe, es porque hay un fallo de configuración en el servidor.
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: "JWT_SECRET no configurado" });
    }

    // Leo el header Authorization (donde el cliente envía el token).
    const auth = req.headers.authorization;

    // Si no hay header o no empieza por "Bearer ", la petición no está autenticada.
    if (!auth || !auth.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No autorizado" });
    }

    // Extraigo el token quitando el prefijo "Bearer ".
    // Ej: "Bearer eyJ..." --> "eyJ..."
    const token = auth.slice(7);

    // Verifico el token con la clave secreta:
    // - Si el token es válido, devuelve el payload decodificado.
    // - Si es inválido o está caducado, lanza un error y saltará al catch.
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // Busco al usuario real en la base de datos usando el id guardado en el token.
    // Así compruebo que sigue existiendo y recupero también su rol y si está bloqueado.
    const authUser = await prisma.user.findUnique({
      where: { id: Number(payload.sub) },
      select: {
        id: true,
        role: true,
        isBlocked: true,
      },
    });

    // Si el usuario del token ya no existe en base de datos, bloqueo el acceso.
    if (!authUser) {
      return res.status(401).json({ message: "Usuario no encontrado" });
    }

    // Si la cuenta está bloqueada por administración, no permito continuar.
    if (authUser.isBlocked) {
      return res.status(403).json({
        message: "Tu cuenta está bloqueada. Contacta con administración.",
      });
    }

    // Guardo info mínima del usuario autenticado en req.user
    // para usarla después en controladores y middlewares de roles.
    req.user = {
      id: authUser.id,
      role: authUser.role,
    };

    // Paso al siguiente middleware/controlador.
    return next();
  } catch (error) {
    // Si falla jwt.verify (token inválido, caducado, manipulado...)
    // o ocurre cualquier error durante la autenticación, bloqueo el acceso.
    return res.status(401).json({ message: "Token inválido o caducado" });
  }
}

// Exporto el middleware para poder usarlo en rutas protegidas.
module.exports = isAuth;
