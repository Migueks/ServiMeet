// Middleware de autorización por rol.
// Permite el acceso solo si el usuario autenticado tiene uno de los roles permitidos.

function hasRole(...allowedRoles) {
  return (req, res, next) => {
    // isAuth debe ejecutarse antes para que exista "req.user".
    if (!req.user) {
      return res.status(401).json({ message: "No autorizado" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: "No tienes permisos para esta acción" });
    }

    return next();
  };
}

module.exports = hasRole;
