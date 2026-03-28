import Api from "./api";

export const createReview = (data) =>
  Api.post("review/create", data);

export const getReviews = (id) =>
  Api.get(`review/${id}`);