// Importo la instancia de Cloudinary ya configurada con las credenciales del proyecto.
const cloudinary = require("../config/cloudinary");

// Función auxiliar para borrar una imagen de Cloudinary a partir de su publicId.
async function deleteFromCloudinary(publicId) {
  // Si no recibo un publicId, no intento borrar nada y devuelvo null.
  if (!publicId) return null;

  // Llamo a Cloudinary para destruir la imagen.
  // "invalidate: true" sirve para invalidar la caché del CDN y que deje de mostrarse si estaba cacheada.
  const result = await cloudinary.uploader.destroy(publicId, {
    invalidate: true,
  });

  // Devuelvo la respuesta de Cloudinary para que quien llame a la función pueda comprobar si el borrado se ha realizado correctamente.
  return result;
}

// Exporto la función para poder usarla en otros archivos, por ejemplo en controladores.
module.exports = deleteFromCloudinary;
