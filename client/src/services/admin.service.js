import apiRequest from "../api/client";

export async function getAdminUsers(token) {
  return apiRequest("/admin/users", {
    token,
  });
}

export async function toggleAdminUserBlocked(token, userId) {
  return apiRequest(`/admin/users/${userId}/toggle-block`, {
    method: "PATCH",
    token,
  });
}

export async function getAdminServices(token) {
  return apiRequest("/admin/services", {
    token,
  });
}

export async function toggleAdminServiceActive(token, serviceId) {
  return apiRequest(`/admin/services/${serviceId}/toggle-active`, {
    method: "PATCH",
    token,
  });
}

export async function getAdminRequests(token) {
  return apiRequest("/admin/requests", {
    token,
  });
}

export async function getAdminReviews(token) {
  return apiRequest("/admin/reviews", {
    token,
  });
}

export async function toggleAdminReviewVisibility(token, reviewId) {
  return apiRequest(`/admin/reviews/${reviewId}/toggle-visibility`, {
    method: "PATCH",
    token,
  });
}

export async function getAdminContactMessages(token) {
  return apiRequest("/admin/contact-messages", {
    token,
  });
}
