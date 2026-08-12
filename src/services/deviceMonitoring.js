import { AppState, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API from "./api";

const DEVICE_UUID_KEY = "ENQUIRE_DEVICE_UUID";
const APP_VERSION = "1.0.0";
const APP_BUILD = 1;

export async function getOrCreateDeviceUuid() {
  try {
    let uuid = await AsyncStorage.getItem(DEVICE_UUID_KEY);
    if (!uuid) {
      uuid = `dev_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
      await AsyncStorage.setItem(DEVICE_UUID_KEY, uuid);
    }
    return uuid;
  } catch (error) {
    return `dev_fallback_${Date.now()}`;
  }
}

export async function collectDeviceMetadata() {
  const uuid = await getOrCreateDeviceUuid();
  const manufacturer = Platform.select({ android: "Android", ios: "Apple" }) || "Generic";
  const model = Platform.constants?.Model || Platform.select({ android: "Mobile", ios: "iPhone" }) || "Device";
  const android_version = String(Platform.Version || "14");
  const android_api_level = typeof Platform.Version === "number" ? Platform.Version : 34;

  return {
    device_uuid: uuid,
    manufacturer,
    model,
    android_version,
    android_api_level,
    app_version: APP_VERSION,
    app_build: APP_BUILD,
    network_type: "Wi-Fi / Cellular",
  };
}

export async function syncDevice(pushToken = null) {
  try {
    const metadata = await collectDeviceMetadata();
    if (pushToken) {
      metadata.push_token = pushToken;
    }

    const response = await API.post("/device_monitoring/sync", metadata);
    return response.data;
  } catch (error) {
    console.warn("Device sync error:", error?.message);
    return null;
  }
}

export async function logActivity(event, title = null, metadata = {}) {
  try {
    const uuid = await getOrCreateDeviceUuid();
    const payload = {
      device_uuid: uuid,
      event,
      title: title || event,
      metadata,
    };

    const response = await API.post("/device_monitoring/activity", payload);
    return response.data;
  } catch (error) {
    console.warn("Activity logging error:", error?.message);
    return null;
  }
}

export async function fetchUserActivityLogs(page = 1, perPage = 20) {
  try {
    const response = await API.get(`/activity_logs?page=${page}&per_page=${perPage}`);
    return response.data;
  } catch (error) {
    throw error;
  }
}

let appStateSubscription = null;

export function initAppStateMonitoring() {
  if (appStateSubscription) return;

  let lastState = AppState.currentState;

  appStateSubscription = AppState.addEventListener("change", (nextAppState) => {
    if (lastState.match(/inactive|background/) && nextAppState === "active") {
      logActivity("APP_FOREGROUND", "App Opened / Foreground");
    } else if (lastState === "active" && nextAppState.match(/inactive|background/)) {
      logActivity("APP_BACKGROUND", "App Backgrounded");
    }
    lastState = nextAppState;
  });

  // Log initial app open
  syncDevice();
  logActivity("APP_OPEN", "App Opened");
}
