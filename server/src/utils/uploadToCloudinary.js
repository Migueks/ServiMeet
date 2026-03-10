// Importo la instancia de Cloudinary ya configurada con las credenciales del proyecto.
const cloudinary = require("../config/cloudinary");

// Función para subir una imagen a Cloudinary a partir de un buffer.
// Recibe el archivo en memoria y, opcionalmente, la carpeta donde se guardará.
function uploadToCloudinary(fileBuffer, folder = "servimeet/services") {
  return new Promise((resolve, reject) => {
    // Compruebo que exista un buffer válido antes de intentar la subida.
    if (!fileBuffer) {
      return reject(
        new Error("No se ha proporcionado ningún archivo para subir"),
      );
    }

    // Creo un stream de subida a Cloudinary indicando la carpeta de destino y que el recurso que voy a subir es una imagen.
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
      },
      (error, result) => {
        // Si Cloudinary devuelve un error, rechazo la promesa.
        if (error) return reject(error);

        // Si la subida se completa correctamente, resuelvo la promesa con el resultado.
        return resolve(result);
      },
    );

    // Envío el buffer al stream para iniciar la subida.
    stream.end(fileBuffer);
  });
}

// Exporto la función para reutilizarla en controladores o servicios.
module.exports = uploadToCloudinary;
