// Importo la función genérica que centraliza las peticiones HTTP al backend.
import apiRequest from "../api/client";

// Función para obtener la lista de ciudades disponibles.
// Hace una petición al endpoint de metadatos de ciudades.
export async function getCities() {
  return apiRequest("/meta/cities");
}

// Función para obtener la lista de ciudades disponibles.
// Hace una petición al endpoint de metadatos de ciudades.
export async function getCategories() {
  return apiRequest("/meta/categories");
}
