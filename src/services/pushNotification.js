import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API from "./api";
import { requestNotificationPermission } from "../utils/permissions";
import { showToast } from "../utils/toast";

const PUSH_TOKEN_KEY = "ENQUIRE_PUSH_TOKEN";

export async function getOrCreatePushToken() {
  try {
    let token = await AsyncStorage.getItem(PUSH_TOKEN_KEY);
    if (!token) {
      token = `push_${Platform.OS}_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
      await AsyncStorage.setItem(PUSH_TOKEN_KEY, token);
    }
    return token;
  } catch (error) {
    return `push_fallback_${Date.now()}`;
  }
}

export async function registerPushTokenWithBackend() {
  try {
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      console.log("Notification permission not granted");
    }

    const pushToken = await getOrCreatePushToken();
    const payload = {
      device_installation: {
        platform: Platform.OS === "ios" ? "ios" : "android",
        device_token: pushToken,
      },
    };

    const response = await API.post("/device_installations", payload);
    console.log("Push token registered successfully:", response.data);
    return response.data;
  } catch (error) {
    console.warn("Push token registration error:", error?.response?.data || error?.message);
    return null;
  }
}

export function showPushNotificationBanner({ title, body }) {
  if (!title && !body) return;
  const message = title ? `🔔 ${title}: ${body || ""}` : `🔔 ${body}`;
  showToast(message);
}

export async function initPushNotifications() {
  try {
    const userToken = await AsyncStorage.getItem("token");
    if (userToken) {
      await registerPushTokenWithBackend();
    }
  } catch (error) {
    console.warn("Init push notifications error:", error?.message);
  }
}
