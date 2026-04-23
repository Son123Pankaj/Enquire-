import Api from "./api";
import { emitProfileRefresh } from "../utils/appRefresh";

export const createBusiness = async (data) => {
  const isFormData = typeof data?.append === "function";
  const config = isFormData
    ? {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    : undefined;

  const res = await Api.post("business_profiles", data, config);
  emitProfileRefresh("business");
  return res.data;
};

export const getBusiness = async (query = "") =>{
  try {
    const url = query ? `business_profiles/?q=${query}` : "business_profiles";
    const response = await Api.get(url);
    return response.data || {};
    } catch (error) {
      if (error.response?.data) {
        return error.response.data;
      }
      throw error;
    }
}

export const getBusinessById = async (id) => {
  try {
    const res = await Api.get(`business_profiles/${id}`);
    return res.data;
  } catch (error) {
    if (error.response?.data) {
      return error.response.data;
    }
    throw error;
  }
};

export const getBusinessByUid = async (uid) => {
  try {
    const res = await Api.get(`business_profiles/uid/${uid}`);
    return res.data;
  } catch (error) {
    if (error.response?.data) {
      return error.response.data;
    }
    throw error;
  }
};

export const updateBusiness = async (id, data) => {
  const isFormData = typeof data?.append === "function";
  const config = isFormData
    ? {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    : undefined;

  const res = await Api.patch(`business_profiles/${id}`, data, config);
  emitProfileRefresh("business");
  return res.data;
};

export const unfavoriteBusiness = async (id) => {
  const res = await Api.delete(`business_profiles/${id}/unfavorite`);
  return res.data;
};

export const favoriteBusiness = async (id) => {
  const res = await Api.post(`business_profiles/${id}/favorite`);
  return res.data;
};

export const getFavoriteBusinesses = async () => {
  try {
    const res = await Api.get("favorites");
    return res.data || {};
  } catch (error) {
    if (error.response?.data) {
      return error.response.data;
    }
    throw error;
  }
};

export const getQRCode = async (id) => {
  const res = await Api.get(`business_profiles/${id}/qr_code`);
  return res.data;
};

export const getMyBusiness = async () => {
  const res = await Api.get("accounts/1");
  const businessProfile = res.data?.account?.business_profile;

  if (!businessProfile?.id) {
    return null;
  }

  const detailRes = await Api.get(`business_profiles/${businessProfile.id}`);
  return detailRes.data?.business_profile || businessProfile;
};
