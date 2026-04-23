export const extractApiError = (error, fallbackMessage = "Something went wrong") => {
  const responseData = error?.response?.data;

  if (Array.isArray(responseData?.errors) && responseData.errors.length > 0) {
    return responseData.errors[0];
  }

  if (typeof responseData?.errors === "string" && responseData.errors.trim()) {
    return responseData.errors;
  }

  if (typeof responseData?.message === "string" && responseData.message.trim()) {
    return responseData.message;
  }

  if (typeof error?.message === "string" && error.message.trim()) {
    return error.message;
  }

  return fallbackMessage;
};
