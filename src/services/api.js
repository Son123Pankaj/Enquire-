import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API = axios.create({
  baseURL: "https://enquire-4kwv.onrender.com/api/v1", // 🔥 BACKEND URL
  headers: {
    "Content-Type": "application/json",
  },
});

// 🔥 TOKEN AUTO ATTACH (har request me token jayega)
API.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // 🔐 token attach
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default API;