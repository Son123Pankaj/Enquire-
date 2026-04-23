import { NativeModules, Platform } from "react-native";

const nativeActions = NativeModules.NativeActions;

export const hasNativeActions = Boolean(nativeActions);

export const pickPdfDocument = async () => {
  if (Platform.OS !== "android" || !nativeActions?.pickPdf) {
    return null;
  }

  return nativeActions.pickPdf();
};

export const shareImageFile = async ({
  filePath,
  message,
  title,
}) => {
  if (Platform.OS !== "android" || !nativeActions?.shareImage) {
    return false;
  }

  await nativeActions.shareImage(filePath, message, title);
  return true;
};
