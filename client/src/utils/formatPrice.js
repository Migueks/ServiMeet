// Esta función formatea un precio para mostrarlo de forma más limpia en la interfaz.
export default function formatPrice(value) {
  // Convierto el valor recibido a número.
  const numericValue = Number(value);

  // Si el valor no es un número válido, devuelvo 0€ por defecto.
  if (!Number.isFinite(numericValue)) {
    return "0€";
  }

  // Muestro siempre 2 decimales, pero si termina en .00 los elimino.
  return `${numericValue.toFixed(2).replace(/\.00$/, "")}€`;
}
