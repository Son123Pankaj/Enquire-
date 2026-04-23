import Api from "./api";
import { emitProfileRefresh } from "../utils/appRefresh";

export const getProfile = async () => {
  const res = await Api.get("accounts/1");
  return res.data?.account || null;
};

export const updateProfile = async (data) => {
  const isFormData = typeof data?.append === "function";
  const payload = isFormData ? data : { account: data };
  const config = isFormData
    ? {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    : undefined;

  const res = await Api.patch("accounts/1", payload, config);
  const account = res.data?.account || null;
  emitProfileRefresh("profile");
  return account;
};

export const toggleBusinessAccount = async () => {
  const res = await Api.patch("accounts/toggle_business");
  return res.data;
};

export const getProfileById = async (id) => {
  try {
    const res = await Api.get(`accounts/${id}`);
    return res.data?.account || res.data;
  } catch (error) {
    if (error.response?.data) {
      return error.response.data;
    }
    throw error;
  }
};
