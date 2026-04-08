// Importo la función genérica que centraliza las peticiones HTTP al backend.
import apiRequest from "../api/client";

// Función para obtener el listado de usuarios desde el panel de administración.
export async function getAdminUsers(token) {
  return apiRequest("/admin/users", {
    token,
  });
}

// Función para bloquear o desbloquear un usuario desde el panel de administración.
export async function toggleAdminUserBlocked(token, userId) {
  return apiRequest(`/admin/users/${userId}/toggle-block`, {
    method: "PATCH",
    token,
  });
}

// Función para obtener el listado de servicios desde el panel de administración.
export async function getAdminServices(token) {
  return apiRequest("/admin/services", {
    token,
  });
}

// Función para activar o desactivar un servicio desde el panel de administración.
export async function toggleAdminServiceActive(token, serviceId) {
  return apiRequest(`/admin/services/${serviceId}/toggle-active`, {
    method: "PATCH",
    token,
  });
}

// Función para obtener todas las solicitudes desde el panel de administración.
export async function getAdminRequests(token) {
  return apiRequest("/admin/requests", {
    token,
  });
}

// Función para obtener todas las reseñas desde el panel de administración.
export async function getAdminReviews(token) {
  return apiRequest("/admin/reviews", {
    token,
  });
}

// Función para ocultar o volver visible una reseña desde el panel de administración.
export async function toggleAdminReviewVisibility(token, reviewId) {
  return apiRequest(`/admin/reviews/${reviewId}/toggle-visibility`, {
    method: "PATCH",
    token,
  });
}

// Función para obtener los mensajes de contacto desde el panel de administración.
export async function getAdminContactMessages(token) {
  return apiRequest("/admin/contact-messages", {
    token,
  });
}
