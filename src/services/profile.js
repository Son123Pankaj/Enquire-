import Api from "./api";

export const getProfile = () => Api.get("accounts/1");

export const updateProfile = (data) =>
  Api.patch("accounts/1", data);

export const changePassword = (data) =>
  Api.post("accounts/toggle_business", data);