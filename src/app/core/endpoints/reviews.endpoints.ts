export const ReviewsEndpoints = [
  { baseUrl: "api", name: "reviews", alias: "getAllReviews", path: "", noToken: true, runAt: "onDemand" },
  { baseUrl: "api", name: "reviews/me", alias: "getMyReview", path: "", noToken: false, runAt: "onDemand" },
  { baseUrl: "api", name: "reviews", alias: "createReview", path: "", noToken: false, runAt: "onDemand" },
  { baseUrl: "api", name: "reviews", alias: "updateReview", path: "", noToken: false, runAt: "onDemand" },
];

export const ReviewsEndpointsMapping = {
  GetAllReviews: 'getAllReviews',
  GetMyReview: 'getMyReview',
  CreateReview: 'createReview',
  UpdateReview: 'updateReview',
};
