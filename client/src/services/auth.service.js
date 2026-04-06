import apiRequest from "../api/client";

export async function registerUser(userData) {
  return apiRequest("/auth/register", {
    method: "POST",
    body: userData,
  });
}

export async function loginUser(credentials) {
  return apiRequest("/auth/login", {
    method: "POST",
    body: credentials,
  });
}

export async function getMyProfile(token) {
  return apiRequest("/users/me", {
    method: "GET",
    token,
  });
}
