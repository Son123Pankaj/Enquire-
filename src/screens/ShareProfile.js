import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import { getProfile } from "../services/profile";
import { getMyBusiness } from "../services/business";
import {
  buildExpertDeepLink,
  buildExpertShareUrl,
  buildExpertShareMessage,
} from "../utils/profileLinks";
import { extractApiError } from "../utils/apiError";
import { showToast } from "../utils/toast";

export default function ShareProfile({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState(false);
  const [hasBusinessProfile, setHasBusinessProfile] = useState(false);
  const [expertUid, setExpertUid] = useState("");
  const [profileName, setProfileName] = useState("");
  const [profileLink, setProfileLink] = useState("");

  const handleNativeShare = useCallback(
    async (linkOverride) => {
      const linkToShare = linkOverride || profileLink;

      if (!hasBusinessProfile) {
        showToast("This feature is available exclusively to Expert users.");
        return;
      }

      if (!linkToShare) {
        showToast("Profile link is not available");
        return;
      }

      try {
        setSharing(true);
        await Share.share({
          title: profileName || "PreviewTax Profile",
          message: buildExpertShareMessage({
            uid: expertUid,
            name: profileName,
            link: linkToShare,
          }),
          url: linkToShare,
        });
      } catch (error) {
        showToast(error?.message || "Unable to share profile");
      } finally {
        setSharing(false);
      }
    },
    [expertUid, hasBusinessProfile, profileLink, profileName]
  );

  useEffect(() => {
    const prepareShareLink = async () => {
      try {
        setLoading(true);
        const [account, business] = await Promise.all([
          getProfile(),
          getMyBusiness(),
        ]);

        const nextExpertUid = business?.account?.uid || account?.uid;
        const fullName =
          account?.full_name?.trim() ||
          [account?.first_name, account?.last_name].filter(Boolean).join(" ") ||
          "Your profile";
        const shareLink =
          business?.share_url ||
          buildExpertShareUrl(nextExpertUid);
        const deepLink =
          business?.deep_link_url ||
          buildExpertDeepLink(nextExpertUid);
        const canShare = Boolean(nextExpertUid && (shareLink || deepLink));

        setProfileName(fullName);
        setExpertUid(String(nextExpertUid || ""));
        setProfileLink(shareLink || deepLink || "");
        setHasBusinessProfile(canShare);

      } catch (error) {
        showToast(extractApiError(error, "Unable to prepare profile sharing"));
      } finally {
        setLoading(false);
      }
    };

    prepareShareLink();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconWrap}>
          <Icon name="share-2" size={24} color="#f97316" />
        </View>
        <Text style={styles.title}>Share your profile</Text>
        <Text style={styles.subtitle}>
          {hasBusinessProfile
            ? "Share your expert profile professionally through WhatsApp, Gmail, Messages, or any installed app."
            : "This feature is available exclusively to Expert users."}
        </Text>

        {loading ? (
          <ActivityIndicator size="large" color="#f97316" style={styles.loader} />
        ) : (
          <>
            {hasBusinessProfile ? (
              <View style={styles.linkCard}>
                <Text style={styles.linkLabel}>Profile link</Text>
                <Text style={styles.linkText}>{profileLink || "Not available"}</Text>
              </View>
            ) : (
              <View style={styles.infoCard}>
                <Icon name="briefcase" size={18} color="#f97316" />
                <Text style={styles.infoText}>
                  Create and complete your business profile to unlock expert sharing features.
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => handleNativeShare()}
              disabled={sharing || !profileLink || !hasBusinessProfile}
            >
              {sharing ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.primaryButtonText}>
                  {hasBusinessProfile ? "Share profile" : "Expert profile required"}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.secondaryButtonText}>Back to profile</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
    padding: 20,
    justifyContent: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#fff7ed",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 18,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0f172a",
    textAlign: "center",
  },
  subtitle: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 22,
    color: "#64748b",
    textAlign: "center",
  },
  loader: {
    marginTop: 28,
  },
  linkCard: {
    marginTop: 24,
    backgroundColor: "#f8fafc",
    borderRadius: 18,
    padding: 16,
  },
  linkLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  linkText: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 21,
    color: "#0f172a",
  },
  infoCard: {
    marginTop: 24,
    backgroundColor: "#fff7ed",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#fdba74",
    flexDirection: "row",
    alignItems: "flex-start",
  },
  infoText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    lineHeight: 21,
    color: "#9a3412",
    fontWeight: "600",
  },
  primaryButton: {
    height: 52,
    borderRadius: 16,
    backgroundColor: "#f97316",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 22,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
  },
  secondaryButton: {
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
  },
});
