import apiRequest from "../api/client";

export async function createRequest(token, requestData) {
  return apiRequest("/requests", {
    method: "POST",
    token,
    body: requestData,
  });
}

export async function getMyClientRequests(token) {
  return apiRequest("/requests/my-client-requests", {
    token,
  });
}

export async function getMyProRequests(token) {
  return apiRequest("/requests/my-pro-requests", {
    token,
  });
}

export async function updateRequestStatus(token, requestId, status) {
  return apiRequest(`/requests/${requestId}/status`, {
    method: "PATCH",
    token,
    body: { status },
  });
}
