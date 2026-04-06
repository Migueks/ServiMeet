import apiRequest from "../api/client";

export async function createContactMessage(contactData) {
  return apiRequest("/contact", {
    method: "POST",
    body: contactData,
  });
}
