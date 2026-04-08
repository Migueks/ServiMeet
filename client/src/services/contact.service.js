// Importo la función genérica que centraliza las peticiones HTTP al backend.
import apiRequest from "../api/client";

// Función para enviar un mensaje desde el formulario de contacto.
// Recibe los datos del formulario y los manda al endpoint correspondiente.
export async function createContactMessage(contactData) {
  return apiRequest("/contact", {
    method: "POST",
    body: contactData,
  });
}
