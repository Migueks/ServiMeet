// Importo la función genérica que centraliza las peticiones HTTP al backend.
import apiRequest from "../api/client";

// Función para obtener el perfil del usuario autenticado.
export async function getMyProfile(token) {
  return apiRequest("/users/me", {
    token,
  });
}

// Función para actualizar el perfil del usuario autenticado.
// Puede enviar datos normales o FormData si incluye imagen.
export async function updateMyProfile(token, profileData) {
  return apiRequest("/users/me", {
    method: "PUT",
    token,
    body: profileData,
  });
}

// Función para eliminar el avatar actual del usuario autenticado.
export async function deleteMyAvatar(token) {
  return apiRequest("/users/me/avatar", {
    method: "DELETE",
    token,
  });
}

// Función para obtener los datos generales del dashboard del usuario autenticado.
export async function getMyDashboard(token) {
  return apiRequest("/users/me/dashboard", {
    token,
  });
}

// Función para obtener los servicios creados por el usuario autenticado.
export async function getMyServices(token) {
  return apiRequest("/users/me/services", {
    token,
  });
}
