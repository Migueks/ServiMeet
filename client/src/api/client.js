// Leo la URL base de la API desde las variables de entorno de Vite.
// Si no existe, uso cadena vacía para poder trabajar con rutas relativas.
const API_URL = import.meta.env.VITE_API_URL || "";

// Función genérica para hacer peticiones HTTP al backend.
// Recibe el endpoint y un objeto opcional con método, body, token y cabeceras.
async function apiRequest(endpoint, options = {}) {
  const { method = "GET", body, token, headers = {} } = options;

  // Configuración base de la petición.
  // Empiezo guardando el método HTTP y las cabeceras personalizadas recibidas.
  const config = {
    method,
    headers: {
      ...headers,
    },
  };

  // Si recibo un token, lo envío en la cabecera Authorization para las rutas que requieren autenticación.
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Si la petición lleva body, compruebo primero si es FormData.
  if (body !== undefined) {
    const isFormData = body instanceof FormData;

    if (isFormData) {
      // Si es FormData, lo envío tal cual.
      // No establezco Content-Type manualmente porque el navegador añade automáticamente el boundary correcto.
      config.body = body;
    } else {
      // Si no es FormData, asumo que son datos JSON.
      // Añado la cabecera adecuada y convierto el body a texto JSON.
      config.headers["Content-Type"] = "application/json";
      config.body = JSON.stringify(body);
    }
  }

  // Normalizo la URL base para evitar barras sobrantes al final.
  const normalizedBaseUrl = API_URL.replace(/\/+$/, "");

  // Normalizo el endpoint para asegurarme de que empieza por "/".
  const normalizedEndpoint = endpoint.startsWith("/")
    ? endpoint
    : `/${endpoint}`;

  // Construyo la URL final de la petición.
  // Si existe URL base, la concateno con el endpoint.
  // Si no, uso solo el endpoint como ruta relativa.
  const requestUrl = normalizedBaseUrl
    ? `${normalizedBaseUrl}${normalizedEndpoint}`
    : normalizedEndpoint;

  // Lanzo la petición HTTP al backend.
  const response = await fetch(requestUrl, config);

  // Compruebo si la respuesta viene en formato JSON.
  const contentType = response.headers.get("content-type");
  const isJson = contentType && contentType.includes("application/json");

  // Si la respuesta es JSON, la parseo.
  // Si no lo es, devuelvo null como contenido.
  const data = isJson ? await response.json() : null;

  // Si la respuesta no ha sido correcta, creo un error personalizado
  // con información útil para manejarlo desde la interfaz.
  if (!response.ok) {
    const error = new Error(
      data?.message || "Ha ocurrido un error en la petición",
    );

    // Añado propiedades extra al error para tener más contexto.
    error.status = response.status;
    error.errors = data?.errors || [];
    error.data = data;

    throw error;
  }

  // Si todo va bien, devuelvo los datos de la respuesta.
  return data;
}

// Exporto la función para reutilizarla en todos los services del proyecto.
export default apiRequest;
