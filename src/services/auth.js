import Api from "./api";

// 🔥 SIGNUP API
export const signupUser = async (data) => {
  return await Api.post("auth/signup", data); 
};

// 🔥 LOGIN API
export const loginUser = async (data) => {
  return await Api.post("auth/login", data);
};

// OTP APIs (optional)
export const sendOtp = async (data) => {
  return await Api.post("otp/send", data);
};

export const verifyOtp = async (data) => {
  return await Api.post("otp/verify", data);
};

// 🔥 GET PROFILE
export const getProfile = async () => {
  return await Api.get("auth/profile"); // ⚠️ backend endpoint confirm kar lena
};