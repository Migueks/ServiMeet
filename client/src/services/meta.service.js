import apiRequest from "../api/client";

export async function getCities() {
  return apiRequest("/meta/cities");
}

export async function getCategories() {
  return apiRequest("/meta/categories");
}
