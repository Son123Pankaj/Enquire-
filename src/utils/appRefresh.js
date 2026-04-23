import { DeviceEventEmitter } from "react-native";

const PROFILE_REFRESH_EVENT = "profile:refresh";

export const emitProfileRefresh = (source = "unknown") => {
  DeviceEventEmitter.emit(PROFILE_REFRESH_EVENT, {
    source,
    timestamp: Date.now(),
  });
};

export const subscribeProfileRefresh = (listener) =>
  DeviceEventEmitter.addListener(PROFILE_REFRESH_EVENT, listener);

