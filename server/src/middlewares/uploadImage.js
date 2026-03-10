// Importo multer para gestionar la subida de archivos en Express.
const multer = require("multer");

// Guardo temporalmente los archivos en memoria como buffer para poder procesarlos o subirlos después a Cloudinary.
const memoryStorage = multer.memoryStorage();

// Filtro los archivos recibidos y solo permito imágenes.
function fileFilter(req, file, cb) {
  // Compruebo que el tipo MIME del archivo empiece por "image/".
  if (!file.mimetype.startsWith("image/")) {
    return cb(new Error("Solo se permiten archivos de imagen"));
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
  },
});

// Exporto el middleware para usarlo en las rutas que necesiten subir imágenes.
module.exports = upload;
