import Api from "./api";
import { extractApiError } from "../utils/apiError";

export const signupUser = async (data) => {
  return await Api.post("auth/signup", data);
};

export const loginUser = async (data) => {
  return await Api.post("auth/login", data);
};

export const sendOtp = async (data) => {
  return await Api.post("otp/send", data);
};

export const verifyOtp = async (data) => {
  return await Api.post("otp/verify", data);
};

export const getProfile = async (id) => {
  return await Api.get(`accounts/${id}`);
};

export const forgotPassword = async (email) => {
  const response = await Api.post("auth/forgot_password", {
    account: { email },
  });
  return response.data || {};
};

export const confirmForgotPasswordOtp = async ({ email, otp }) => {
  const response = await Api.post("auth/otp_confirmation", {
    account: { email, otp },
  });
  return response.data || {};
};

export const verifyResetPasswordToken = async ({
  email,
  resetPasswordToken,
}) => {
  const response = await Api.post("auth/verify_reset_token", {
    account: {
      email,
      reset_password_token: resetPasswordToken,
    },
  });
  return response.data || {};
};

export const resetPassword = async ({
  email,
  resetPasswordToken,
  password,
  passwordConfirmation,
}) => {
  const response = await Api.patch("auth/reset_password", {
    account: {
      email,
      reset_password_token: resetPasswordToken,
      password,
      password_confirmation: passwordConfirmation,
    },
  });
  return response.data || {};
};

export const changePassword = async ({
  currentPassword,
  newPassword,
  confirmPassword,
  id,
}) => {
  const response = await Api.patch(`accounts/${id}/change_password`, {
    current_password: currentPassword,
    new_password: newPassword,
    confirm_password: confirmPassword,
  });
  return response.data || {};
};

const BUSINESS_FLAG_PATHS = [
  ["data", "is_business"],
  ["data", "account", "is_business"],
  ["data", "user", "is_business"],
  ["data", "profile", "is_business"],
  ["data", "data", "is_business"],
  ["data", "data", "account", "is_business"],
  ["data", "data", "user", "is_business"],
  ["is_business"],
  ["account", "is_business"],
  ["user", "is_business"],
];

const TOKEN_PATHS = [
  ["data", "token"],
  ["data", "access_token"],
  ["data", "data", "token"],
  ["data", "data", "access_token"],
  ["token"],
  ["access_token"],
];

const getValueAtPath = (source, path) =>
  path.reduce(
    (current, key) =>
      current !== undefined && current !== null ? current[key] : undefined,
    source
  );

export const extractAuthToken = (response) => {
  for (const path of TOKEN_PATHS) {
    const value = getValueAtPath(response, path);
    if (value) {
      return value;
    }
  }

  return null;
};

export const extractIsBusiness = (source) => {
  for (const path of BUSINESS_FLAG_PATHS) {
    const value = getValueAtPath(source, path);
    if (typeof value === "boolean") {
      return value;
    }
  }

  return null;
};

export const fetchCurrentUserProfile = async () => {
  const response = await getProfile();
  return response?.data;
};

export { extractApiError };
