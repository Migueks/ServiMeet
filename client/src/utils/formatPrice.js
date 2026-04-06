export default function formatPrice(value) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return "0€";
  }

  return `${numericValue.toFixed(2).replace(/\.00$/, "")}€`;
}
