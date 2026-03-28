import Api from "./api";

export const createBusiness = (data) =>
  Api.post("business_profiles", data);

export const getBusiness = () =>
  Api.get("business/me");

export const updateBusiness = (data) =>
  Api.patch("business_profiles/1", data);