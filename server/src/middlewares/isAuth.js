// Middleware para proteger rutas con JSON Web Token (JWT).
// El objetivo es permitir el acceso SOLO si la petición trae un JWT válido.
// Se espera el header: Authorization: Bearer <token> (tipo de autenticación estándar para JWT).

const jwt = require("jsonwebtoken"); // Librería para verificar (y firmar) tokens JWT.

function isAuth(req, res, next) {
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

    // Guardo info mínima del usuario en req.user para usarla en controladores (ej: "/me").
    req.user = {
      id: Number(payload.sub), // "sub" = id del usuario (lo convierto a Number si en BD es Int)
      role: payload.role, // rol para controlar los permisos
    };

    // Paso al siguiente middleware/controlador
    return next();
  } catch (error) {
    // Si falla jwt.verify (token inválido, caducado, manipulado...), bloqueo el acceso.
    return res.status(401).json({ message: "Token inválido o caducado" });
  }
}

// Exporto el middleware para poder usarlo en rutas protegidas (router.get("/me", isAuth, me))
module.exports = isAuth;
