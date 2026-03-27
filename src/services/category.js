import Api from "./api";

export const getCategories = async (query = "") => {
  try {
    const url = query ? `categories/?q=${query}` : "categories";
    const response = await Api.get(url);
    return response.data.categories; // ✅ Corrected
  } catch (error) {
    console.log("Error fetching categories:", error);
    throw error;
  }
};