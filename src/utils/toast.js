import { DeviceEventEmitter } from "react-native";

const TOAST_EVENT = "app:toast";

export const toastEventName = TOAST_EVENT;

const inferToastType = (message) => {
  const normalized = String(message || "").toLowerCase();

  if (
    /unable|failed|error|invalid|denied|forbidden|unauthorized|cannot|not found|required/.test(
      normalized
    )
  ) {
    return "error";
  }

  if (
    /success|updated|saved|created|sent|accepted|removed|downloaded|booked|started|ended|verified/.test(
      normalized
    )
  ) {
    return "success";
  }

  return "warning";
};

export const showToast = (message, durationOrOptions = 2400) => {
  if (!message) {
    return;
  }

  const options =
    typeof durationOrOptions === "number"
      ? { duration: durationOrOptions }
      : durationOrOptions || {};

  DeviceEventEmitter.emit(TOAST_EVENT, {
    message,
    duration: options.duration || 2400,
    type: options.type || inferToastType(message),
  });
};
