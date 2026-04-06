import apiRequest from "../api/client";

export async function getMyProfile(token) {
  return apiRequest("/users/me", {
    token,
  });
}

export async function updateMyProfile(token, profileData) {
  return apiRequest("/users/me", {
    method: "PUT",
    token,
    body: profileData,
  });
}

export async function deleteMyAvatar(token) {
  return apiRequest("/users/me/avatar", {
    method: "DELETE",
    token,
  });
}

export async function getMyDashboard(token) {
  return apiRequest("/users/me/dashboard", {
    token,
  });
}

export async function getMyServices(token) {
  return apiRequest("/users/me/services", {
    token,
  });
}
