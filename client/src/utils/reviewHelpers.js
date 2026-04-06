export function getReviewForRequest(reviews, requestId) {
  return reviews.find((review) => review.requestId === requestId) || null;
}
