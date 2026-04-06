import apiRequest from "../api/client";

export async function createReview(token, reviewData) {
  return apiRequest("/reviews", {
    method: "POST",
    token,
    body: reviewData,
  });
}

export async function getMyReviews(token) {
  return apiRequest("/reviews/my-reviews", {
    token,
  });
}

export async function getReviewsByService(serviceId) {
  return apiRequest(`/reviews/service/${serviceId}`);
}

export async function getHomeReviews() {
  return apiRequest("/reviews/home");
}
