// Valido el tipo real del archivo leyendo su contenido,
// no solo el MIME enviado por el cliente.
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

async function validateRealImageType(file) {
  // Si no existe archivo o no hay buffer, lo considero inválido.
  if (!file?.buffer) return false;

  // Import dinámico porque "file-type" funciona como ESM.
  const { fileTypeFromBuffer } = await import("file-type");

  // Detecto el tipo real leyendo la firma del archivo.
  const detectedType = await fileTypeFromBuffer(file.buffer);

  // Si no se puede detectar, no acepto el archivo.
  if (!detectedType) return false;

  // Solo permito los formatos definidos.
  return ALLOWED_MIME_TYPES.includes(detectedType.mime);
}

module.exports = validateRealImageType;
