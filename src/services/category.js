import Api from "./api";

export const getCategories = async (query = "") => {
  try {
    const url = query ? `categories/?q=${query}` : "categories";
    const response = await Api.get(url);
    return Array.isArray(response.data?.categories)
      ? response.data.categories
      : [];
  } catch (error) {
    if (error.response?.status === 404) {
      return [];
    }

    throw error;
  }
};
