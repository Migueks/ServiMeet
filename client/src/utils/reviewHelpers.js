// Esta función busca si una solicitud concreta ya tiene una reseña asociada.
export function getReviewForRequest(reviews, requestId) {
  // Devuelvo la reseña que coincida con el requestId recibido.
  // Si no existe, devuelvo null.
  return reviews.find((review) => review.requestId === requestId) || null;
}
