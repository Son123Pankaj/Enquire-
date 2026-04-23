import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  PermissionsAndroid,
  Platform,
  TouchableOpacity,
  Image,
  Share,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import { getProfile } from "../services/profile";
import { getMyBusiness } from "../services/business";
import { hasNativeActions, shareImageFile } from "../native/nativeActions";
import {
  buildExpertDeepLink,
  buildExpertShareUrl,
  buildQrCodeUrl,
} from "../utils/profileLinks";
import { extractApiError } from "../utils/apiError";
import { showToast } from "../utils/toast";

const resolveRnfsModule = () => {
  try {
    const moduleRef = require("react-native-fs");
    return moduleRef?.default || moduleRef || null;
  } catch (_error) {
    return null;
  }
};

const ProfileQR = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [account, setAccount] = useState(null);
  const [sharing, setSharing] = useState(false);
  const [hasBusinessProfile, setHasBusinessProfile] = useState(false);
  const [profileLink, setProfileLink] = useState("");

  const qrCodeUrl = useMemo(() => buildQrCodeUrl(profileLink), [profileLink]);

  useEffect(() => {
    fetchProfileQr();
  }, []);

  const requestStoragePermission = async () => {
    if (Platform.OS !== "android" || Platform.Version > 28) {
      return true;
    }

    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      {
        title: "Storage Permission",
        message: "Storage permission is required to save the QR code.",
        buttonPositive: "Allow",
      }
    );

    return granted === PermissionsAndroid.RESULTS.GRANTED;
  };

  const fetchProfileQr = async () => {
    try {
      setLoading(true);
      setError("");

      const [profile, business] = await Promise.all([
        getProfile(),
        getMyBusiness(),
      ]);

      const nextExpertUid = business?.account?.uid || profile?.uid;
      const nextLink =
        business?.share_url ||
        business?.deep_link_url ||
        buildExpertShareUrl(nextExpertUid) ||
        buildExpertDeepLink(nextExpertUid);
      const canAccessQr = Boolean(nextExpertUid && nextLink);

      setAccount(profile);
      setHasBusinessProfile(canAccessQr);

      if (!canAccessQr) {
        setProfileLink("");
        return;
      }

      setProfileLink(nextLink || "");
    } catch (fetchError) {
      setError(extractApiError(fetchError, "Failed to load QR code"));
    } finally {
      setLoading(false);
    }
  };

  const downloadQrToFile = async () => {
    if (!qrCodeUrl) {
      throw new Error("QR code is not available");
    }

    const RNFS = resolveRnfsModule();

    if (!RNFS?.downloadFile || !RNFS?.exists || !RNFS?.mkdir) {
      throw new Error("QR sharing is currently unavailable.");
    }

    const fileName = `previewtax-profile-qr-${Date.now()}.png`;
    const directoryPath =
      Platform.OS === "android"
        ? RNFS.CachesDirectoryPath || RNFS.TemporaryDirectoryPath
        : RNFS.TemporaryDirectoryPath || RNFS.CachesDirectoryPath;

    if (!directoryPath) {
      throw new Error("Temporary storage is not available");
    }

    const directoryExists = await RNFS.exists(directoryPath);
    if (!directoryExists) {
      await RNFS.mkdir(directoryPath);
    }

    const filePath = `${directoryPath}/${fileName}`;
    const result = await RNFS.downloadFile({
      fromUrl: qrCodeUrl,
      toFile: filePath,
      background: true,
      discretionary: true,
    }).promise;

    if (result?.statusCode && result.statusCode >= 400) {
      throw new Error("Unable to prepare QR image");
    }

    return filePath;
  };

  const handleDownloadQr = async () => {
    try {
      if (!hasBusinessProfile) {
        showToast("This feature is available exclusively to Expert users.");
        return;
      }

      if (!qrCodeUrl) {
        showToast("QR code is not available");
        return;
      }

      const RNFS = resolveRnfsModule();

      if (!RNFS?.downloadFile || !RNFS?.exists || !RNFS?.mkdir) {
        showToast("QR download is currently unavailable.");
        return;
      }

      const hasPermission = await requestStoragePermission();

      if (!hasPermission) {
        showToast("Storage permission denied");
        return;
      }

      const fileName = `enquire-profile-qr-${Date.now()}.png`;
      const directoryPath =
        Platform.OS === "android"
          ? RNFS.DownloadDirectoryPath ||
            `${RNFS.ExternalStorageDirectoryPath}/Download`
          : RNFS.DocumentDirectoryPath;

      const directoryExists = await RNFS.exists(directoryPath);
      if (!directoryExists) {
        await RNFS.mkdir(directoryPath);
      }

      const filePath = `${directoryPath}/${fileName}`;
      const result = await RNFS.downloadFile({
        fromUrl: qrCodeUrl,
        toFile: filePath,
      }).promise;

      if (result?.statusCode && result.statusCode >= 400) {
        throw new Error("Unable to download QR code");
      }

      showToast(
        Platform.OS === "android"
          ? "QR saved to Downloads"
          : "QR saved successfully"
      );
    } catch (downloadError) {
      showToast(downloadError?.message || "Unable to save QR code");
    }
  };

  const handleShareQr = async () => {
    try {
      if (!hasBusinessProfile) {
        showToast("This feature is available exclusively to Expert users.");
        return;
      }

      setSharing(true);
      const filePath = await downloadQrToFile();
      const shareMessage =
        "Connect with me on the PreviewTax app by scanning this QR code.";
      if (Platform.OS === "android") {
        if (!hasNativeActions) {
          throw new Error("QR sharing is currently unavailable.");
        }

        await shareImageFile({
          filePath,
          message: shareMessage,
          title: account?.full_name || "PreviewTax Profile",
        });
      } else {
        await Share.share({
          title: account?.full_name || "PreviewTax Profile",
          message: shareMessage,
          url: `file://${filePath}`,
        });
      }
    } catch (shareError) {
      showToast(shareError?.message || "Unable to share profile");
    } finally {
      setSharing(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={20} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile QR Code</Text>
        <View style={styles.headerSpacer} />
      </View>

      {loading ? (
        <View style={styles.contentState}>
          <ActivityIndicator size="large" color="#f59e0b" />
        </View>
      ) : error ? (
        <View style={styles.contentState}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <View style={styles.contentWrap}>
          <View style={styles.card}>
            <Text style={styles.subtitle}>
              {hasBusinessProfile
                ? "Let clients connect with you on PreviewTax by scanning your expert QR code."
                : "This feature is available exclusively to Expert users."}
            </Text>

            {hasBusinessProfile ? (
              <>
                <View style={styles.qrBox}>
                  {qrCodeUrl ? (
                    <>
                      <Image source={{ uri: qrCodeUrl }} style={styles.qrImage} />
                      <View style={styles.logoBadge}>
                        <Image
                          source={require("../../assets/logo-1.webp")}
                          style={styles.logoImage}
                        />
                      </View>
                    </>
                  ) : (
                    <Text style={styles.qrFallbackText}>QR code not available</Text>
                  )}
                </View>

                <Text style={styles.fullNameText}>
                  {account?.full_name?.trim() || "User"}
                </Text>

                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={handleShareQr}
                  disabled={sharing}
                >
                  <Icon name="share-2" size={18} color="#fff" />
                  <Text style={styles.primaryButtonText}>
                    {sharing ? "Preparing QR..." : "Share QR"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={handleDownloadQr}
                >
                  <Icon name="download" size={18} color="#0f172a" />
                  <Text style={styles.secondaryButtonText}>Download QR</Text>
                </TouchableOpacity>
              </>
            ) : null}
          </View>
        </View>
      )}
    </View>
  );
};

export default ProfileQR;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    backgroundColor: "#fff",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  headerSpacer: {
    width: 40,
  },
  contentWrap: {
    flex: 1,
    justifyContent: "center",
  },
  contentState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 22,
    margin: 18,
    alignItems: "center",
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 22,
    color: "#64748b",
    textAlign: "center",
    marginBottom: 16,
  },
  qrBox: {
    width: 260,
    height: 260,
    borderRadius: 22,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
    overflow: "hidden",
  },
  qrImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  logoBadge: {
    position: "absolute",
    width: 42,
    height: 42,
    borderRadius: 31,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#f8fafc",
    shadowColor: "#0f172a",
    shadowOpacity: 0.14,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  logoImage: {
    width: 42,
    height: 42,
    resizeMode: "contain",
    borderRadius: 36
  },
  qrFallbackText: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
  },
  fullNameText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 14,
    textAlign: "center",
  },
  linkCard: {
    width: "100%",
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    padding: 14,
  },
  linkLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  linkText: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 20,
    color: "#0f172a",
  },
  primaryButton: {
    width: "100%",
    marginTop: 16,
    backgroundColor: "#f97316",
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
    marginLeft: 8,
  },
  secondaryButton: {
    width: "100%",
    marginTop: 10,
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    color: "#0f172a",
    fontSize: 15,
    fontWeight: "700",
    marginLeft: 8,
  },
  errorText: {
    textAlign: "center",
    color: "#ef4444",
    fontSize: 15,
  },
});
