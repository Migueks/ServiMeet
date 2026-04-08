// Importo la función genérica que centraliza las peticiones HTTP al backend.
import apiRequest from "../api/client";

// Función para obtener el listado público de servicios.
export async function getAllServices() {
  return apiRequest("/services");
}

// Función para obtener el detalle de un servicio concreto.
// Si se envía token, el backend también puede devolver información adaptada al usuario autenticado.
export async function getServiceById(id, token) {
  return apiRequest(`/services/${id}`, {
    token,
  });
}

// Función para obtener los servicios del usuario autenticado.
export async function getMyServices(token) {
  return apiRequest("/users/me/services", {
    token,
  });
}

// Función para crear un nuevo servicio.
// Puede enviar FormData si incluye imagen.
export async function createService(token, serviceData) {
  return apiRequest("/services", {
    method: "POST",
    token,
    body: serviceData,
  });
}

// Función para actualizar un servicio existente.
export async function updateService(token, id, serviceData) {
  return apiRequest(`/services/${id}`, {
    method: "PUT",
    token,
    body: serviceData,
  });
}

// Función para actualizar un servicio existente.
export async function deleteService(token, id) {
  return apiRequest(`/services/${id}`, {
    method: "DELETE",
    token,
  });
}
