// Importo la versión 2 del SDK (Software Development Kit) de Cloudinary poder usar su configuración y sus métodos de subida, borrado y gestión de imágenes.
const cloudinary = require("cloudinary").v2;

// Configuro Cloudinary con variables de entorno privadas.
// Estas credenciales permiten al backend autenticarse.
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Exporto la instancia configurada de Cloudinary para reutilizarla en otros archivos.
module.exports = cloudinary;
