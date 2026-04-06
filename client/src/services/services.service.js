import apiRequest from "../api/client";

export async function getAllServices() {
  return apiRequest("/services");
}

export async function getServiceById(id, token) {
  return apiRequest(`/services/${id}`, {
    token,
  });
}

export async function getMyServices(token) {
  return apiRequest("/users/me/services", {
    token,
  });
}

export async function createService(token, serviceData) {
  return apiRequest("/services", {
    method: "POST",
    token,
    body: serviceData,
  });
}

export async function updateService(token, id, serviceData) {
  return apiRequest(`/services/${id}`, {
    method: "PUT",
    token,
    body: serviceData,
  });
}

export async function deleteService(token, id) {
  return apiRequest(`/services/${id}`, {
    method: "DELETE",
    token,
  });
}
