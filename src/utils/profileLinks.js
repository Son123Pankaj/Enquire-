const APP_SCHEME = "previewtax://";
const SHARE_BASE_URL = "https://previewtax.com";
const QR_BASE_URL = "https://api.qrserver.com/v1/create-qr-code/";

export const buildExpertDeepLink = (uid) => {
  if (!uid) {
    return "";
  }

  return `${APP_SCHEME}expert/${uid}`;
};

export const buildExpertShareUrl = (uid) => {
  if (!uid) {
    return "";
  }

  return `${SHARE_BASE_URL}/expert/${uid}`;
};

export const buildExpertShareMessage = ({ uid, name, link }) => {
  const deepLink = link || buildExpertShareUrl(uid);

  if (!deepLink) {
    return "";
  }

  const safeName = name?.trim() || "expert";
  return `Connect with ${safeName} on the PreviewTax app.\n${deepLink}`;
};

export const buildQrCodeUrl = (value, size = 512) => {
  if (!value) {
    return "";
  }

  const normalizedSize = Number.isFinite(size) ? size : 512;
  return `${QR_BASE_URL}?size=${normalizedSize}x${normalizedSize}&margin=24&data=${encodeURIComponent(
    value
  )}`;
};
