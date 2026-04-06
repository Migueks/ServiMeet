// Importo multer para gestionar la subida de archivos en Express.
const multer = require("multer");

// Guardo temporalmente los archivos en memoria como buffer para poder procesarlos o subirlos después a Cloudinary.
const memoryStorage = multer.memoryStorage();

// Defino exactamente qué tipos de imagen permito.
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

// Filtro los archivos recibidos y solo permito imágenes válidas.
function fileFilter(req, file, cb) {
  // Compruebo que el MIME recibido esté dentro de los formatos permitidos.
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    const error = new Error("Solo se permiten imágenes JPG, PNG o WEBP");
    error.statusCode = 400;
    return cb(error);
  }

  // Si el archivo es válido, permito continuar con la subida.
  cb(null, true);
}

// Configuro el middleware de multer.
const upload = multer({
  storage: memoryStorage,
  fileFilter,
  limits: {
    // Limito el tamaño máximo del archivo a 5 MB.
    fileSize: 5 * 1024 * 1024,

    // Solo permito subir 1 archivo por petición.
    files: 1,

    // Limito la cantidad de campos normales del formulario.
    fields: 20,

    // Limito el total de partes del multipart (campos + archivos).
    parts: 25,
  },
});

// Exporto el middleware para usarlo en las rutas que necesiten subir imágenes.
module.exports = upload;
