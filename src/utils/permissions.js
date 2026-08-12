import { PermissionsAndroid, Platform } from "react-native";

export async function requestCallPermissions(callType = "voice") {
  if (Platform.OS !== "android") {
    return true;
  }

  const permissions = [PermissionsAndroid.PERMISSIONS.RECORD_AUDIO];

  if (callType === "video") {
    permissions.push(PermissionsAndroid.PERMISSIONS.CAMERA);
  }

  if (Platform.Version >= 31 && PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT) {
    permissions.push(PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT);
  }

  try {
    const granted = await PermissionsAndroid.requestMultiple(permissions);
    const audioGranted =
      granted[PermissionsAndroid.PERMISSIONS.RECORD_AUDIO] ===
      PermissionsAndroid.RESULTS.GRANTED;

    const cameraGranted =
      callType !== "video" ||
      granted[PermissionsAndroid.PERMISSIONS.CAMERA] ===
        PermissionsAndroid.RESULTS.GRANTED;

    return audioGranted && cameraGranted;
  } catch (error) {
    console.warn("Call permissions error:", error);
    return false;
  }
}

export async function requestCameraPermission() {
  if (Platform.OS !== "android") {
    return true;
  }

  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA,
      {
        title: "Camera Permission Required",
        message: "App needs access to your camera to take profile & document photos.",
        buttonPositive: "Allow",
        buttonNegative: "Cancel",
      }
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch (error) {
    return false;
  }
}

export async function requestLocationPermission() {
  if (Platform.OS !== "android") {
    return true;
  }

  try {
    const granted = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
    ]);

    return (
      granted[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] ===
        PermissionsAndroid.RESULTS.GRANTED ||
      granted[PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION] ===
        PermissionsAndroid.RESULTS.GRANTED
    );
  } catch (error) {
    return false;
  }
}

export async function requestGalleryPermission() {
  if (Platform.OS !== "android") {
    return true;
  }

  try {
    if (Platform.Version >= 33 && PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }

    if (Platform.Version <= 32 && PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }

    return true;
  } catch (error) {
    return false;
  }
}

export async function requestNotificationPermission() {
  if (Platform.OS !== "android") {
    return true;
  }

  try {
    if (Platform.Version >= 33 && PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  } catch (error) {
    return false;
  }
}
