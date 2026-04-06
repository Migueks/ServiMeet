const jwt = require("jsonwebtoken"); // Librería para verificar tokens JWT.
const prisma = require("../config/prisma"); // Instancia de Prisma para consultar usuarios en la base de datos.

// Middleware opcional de autenticación.
// Si llega un token válido de un usuario activo, guardo req.user.
// Si no hay token, es inválido, el usuario no existe o está bloqueado, dejo continuar la petición como invitado.
async function optionalAuth(req, res, next) {
  try {
    // Leo el header Authorization (donde el cliente envía el token).
    const auth = req.headers.authorization;

    // Si no hay header o no empieza por "Bearer ", no obligo a autenticarse.
    // Simplemente dejo pasar la petición como usuario no autenticado.
    if (!auth || !auth.startsWith("Bearer ")) {
      return next();
    }

    // Compruebo que existe la clave secreta para verificar JWT.
    // Si no existe, es un fallo de configuración del servidor.
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: "JWT_SECRET no configurado" });
    }

    // Extraigo el token quitando el prefijo "Bearer ".
    // Ej: "Bearer eyJ..." --> "eyJ..."
    const token = auth.slice(7);

    // Verifico el token con la clave secreta.
    // Si el token es válido, obtengo el payload decodificado.
    // Si no lo es, saltará al catch y la petición seguirá como invitado.
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

    // Si el usuario no existe o está bloqueado, no guardo req.user.
    // En este middleware no devuelvo error: continúo como invitado.
    if (!authUser || authUser.isBlocked) {
      return next();
    }

    // Si todo es correcto, guardo la información mínima del usuario autenticado
    // para que los siguientes middlewares/controladores puedan usarla.
    req.user = {
      id: authUser.id,
      role: authUser.role,
    };

    // Continúo con la petición.
    return next();
  } catch (error) {
    // Si el token es inválido, ha caducado o ocurre cualquier error,
    // no corto la petición: simplemente continúo como invitado.
    return next();
  }
}

// Exporto el middleware para usarlo en rutas donde la autenticación sea opcional.
module.exports = optionalAuth;
