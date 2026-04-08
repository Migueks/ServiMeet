// Importo la función genérica que centraliza las peticiones HTTP al backend.
import apiRequest from "../api/client";

// Función para registrar un nuevo usuario.
// Recibe los datos del formulario y los envía al endpoint de registro.
export async function registerUser(userData) {
  return apiRequest("/auth/register", {
    method: "POST",
    body: userData,
  });
}

// Función para iniciar sesión.
// Recibe las credenciales del usuario y las envía al endpoint de login.
export async function loginUser(credentials) {
  return apiRequest("/auth/login", {
    method: "POST",
    body: credentials,
  });
}

// Función para obtener el perfil del usuario autenticado.
// Envía el token al backend para que identifique al usuario actual.
export async function getMyProfile(token) {
  return apiRequest("/users/me", {
    method: "GET",
    token,
  });
}
