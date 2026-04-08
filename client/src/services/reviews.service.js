// Importo la función genérica que centraliza las peticiones HTTP al backend.
import apiRequest from "../api/client";

// Función para crear una nueva reseña.
// Envía el token del usuario autenticado junto con los datos de la reseña.
export async function createReview(token, reviewData) {
  return apiRequest("/reviews", {
    method: "POST",
    token,
    body: reviewData,
  });
}

// Función para obtener las reseñas del usuario autenticado.
export async function getMyReviews(token) {
  return apiRequest("/reviews/my-reviews", {
    token,
  });
}

// Función para obtener las reseñas de un servicio concreto.
export async function getReviewsByService(serviceId) {
  return apiRequest(`/reviews/service/${serviceId}`);
}

// Función para obtener las reseñas destacadas o visibles en la home.
export async function getHomeReviews() {
  return apiRequest("/reviews/home");
}
