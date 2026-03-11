const multer = require("multer");

// Middleware global para manejar errores de la aplicación.
// Recibe el error lanzado en cualquier parte del flujo y devuelve una respuesta controlada al cliente.
function errorHandler(err, req, res, next) {
  // Muestro el error completo en consola para poder verlo mejor durante el desarrollo.
  console.error(err);

  // Compruebo si el error viene de Multer, que es la librería que uso para procesar la subida de archivos.
  if (err instanceof multer.MulterError) {
    // Si el error es porque el archivo supera el tamaño máximo permitido, devuelvo un 400 con un mensaje más claro para el cliente.
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        message: "La imagen no puede superar los 5 MB",
      });
    }

    // Para cualquier otro error de Multer, devuelvo también un 400 indicando que ha habido un problema al procesar el archivo.
    return res.status(400).json({
      message: "Error al procesar el archivo",
      error: err.message,
    });
  }

  // Si el error es personalizado y trae statusCode o status, uso ese código. Si no, devuelvo 500 por defecto.
  const statusCode = err.statusCode || err.status || 500;

  // Obtengo el mensaje del error si existe. Si no existe, uso un mensaje genérico de error interno del servidor.
  const message = err.message || "Error interno del servidor";

  // Creo un objeto de respuesta consistente con el mensaje principal.
  const response = { message };

  // Si la aplicación no está en producción, añado también el detalle del error para facilitar la depuración durante el desarrollo.
  if (process.env.NODE_ENV !== "production") {
    response.error = err.message;
  }

  // Devuelvo finalmente la respuesta con el código de estado correspondiente.
  return res.status(statusCode).json(response);
}

// Exporto el middleware para poder usarlo al final de la cadena de middlewares en Express.
module.exports = errorHandler;
