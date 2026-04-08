// Esta función transforma el array de errores del backend
// en un objeto más fácil de usar en los formularios del frontend.
export default function buildFieldErrors(error) {
  // Creo un objeto vacío donde iré guardando cada error asociado a su campo.
  const nextErrors = {};

  // Si el error no trae un array de errores, devuelvo el objeto vacío.
  if (!error?.errors) {
    return nextErrors;
  }

  // Recorro todos los errores recibidos.
  error.errors.forEach((item) => {
    // Si el error tiene un campo asociado,
    // guardo su mensaje usando el nombre del campo como clave.
    if (item?.field) {
      nextErrors[item.field] = item.message;
    }
  });

  // Devuelvo el objeto final con los errores agrupados por campo.
  return nextErrors;
}
