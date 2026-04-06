const API_URL = import.meta.env.VITE_API_URL || "";

async function apiRequest(endpoint, options = {}) {
  const { method = "GET", body, token, headers = {} } = options;

  const config = {
    method,
    headers: {
      ...headers,
    },
  };

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (body !== undefined) {
    const isFormData = body instanceof FormData;

    if (isFormData) {
      config.body = body;
    } else {
      config.headers["Content-Type"] = "application/json";
      config.body = JSON.stringify(body);
    }
  }

  const normalizedBaseUrl = API_URL.replace(/\/+$/, "");
  const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const requestUrl = normalizedBaseUrl
    ? `${normalizedBaseUrl}${normalizedEndpoint}`
    : normalizedEndpoint;

  const response = await fetch(requestUrl, config);

  const contentType = response.headers.get("content-type");
  const isJson = contentType && contentType.includes("application/json");
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    const error = new Error(
      data?.message || "Ha ocurrido un error en la petición",
    );

    error.status = response.status;
    error.errors = data?.errors || [];
    error.data = data;

    throw error;
  }

  return data;
}

export default apiRequest;
