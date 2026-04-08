// Importo la función genérica que centraliza las peticiones HTTP al backend.
import apiRequest from "../api/client";

// Función para crear una nueva solicitud sobre un servicio.
// Envía el token del usuario autenticado y los datos de la solicitud.
export async function createRequest(token, requestData) {
  return apiRequest("/requests", {
    method: "POST",
    token,
    body: requestData,
  });
}

// Función para obtener las solicitudes hechas por el cliente autenticado.
export async function getMyClientRequests(token) {
  return apiRequest("/requests/my-client-requests", {
    token,
  });
}

// Función para obtener las solicitudes recibidas por el profesional autenticado.
export async function getMyProRequests(token) {
  return apiRequest("/requests/my-pro-requests", {
    token,
  });
}

// Función para actualizar el estado de una solicitud concreta.
// Recibe el id de la solicitud y el nuevo estado que se quiere aplicar.
export async function updateRequestStatus(token, requestId, status) {
  return apiRequest(`/requests/${requestId}/status`, {
    method: "PATCH",
    token,
    body: { status },
  });
}
