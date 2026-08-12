import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { navigateToLogin } from "../utils/navigationRef";
import { showToast } from "../utils/toast";

const API = axios.create({
  baseURL: "https://enquire-4kwv.onrender.com/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

API.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error?.response?.status === 401) {
      await AsyncStorage.multiRemove(["token", "is_business"]);
      showToast("Session expired. Please log in again.");
      navigateToLogin();
    }
    return Promise.reject(error);
  }
);

export default API;