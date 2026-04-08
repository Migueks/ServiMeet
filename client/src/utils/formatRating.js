// Esta función formatea una puntuación para mostrarla con un decimal.
export default function formatRating(value) {
  // Convierto el valor recibido a número.
  const numericValue = Number(value);

  // Si el valor no es válido, devuelvo 0.0 por defecto.
  if (!Number.isFinite(numericValue)) {
    return "0.0";
  }

  // Devuelvo la puntuación con un decimal fijo.
  return numericValue.toFixed(1);
}
