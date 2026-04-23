import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Feather";
import FontAwesomeIcon from "react-native-vector-icons/FontAwesome";
import { useNavigation } from "@react-navigation/native";
import {
  favoriteBusiness,
  getBusinessById,
  getBusinessByUid,
  unfavoriteBusiness,
} from "../services/business";
import { getProfile } from "../services/profile";
import {
  buildExpertDeepLink,
  buildExpertShareMessage,
} from "../utils/profileLinks";
import { extractApiError } from "../utils/apiError";
import { showToast } from "../utils/toast";

const TAB_KEYS = {
  ABOUT: "about",
  SCHEDULE: "schedule",
  REVIEWS: "reviews",
};

const DAY_ORDER = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

const normalizeDayOfWeek = (value) => {
  if (typeof value === "number") {
    return DAY_ORDER[value] || "";
  }

  if (typeof value === "string") {
    const numericValue = Number(value);

    if (!Number.isNaN(numericValue) && value.trim() !== "") {
      return DAY_ORDER[numericValue] || value.toLowerCase();
    }

    return value.toLowerCase();
  }

  return "";
};

const formatTime = (time) => {
  if (!time) {
    return "";
  }

  const [hourText, minute = "00"] = time.split(":");
  const hour = Number(hourText);

  if (Number.isNaN(hour)) {
    return time;
  }

  const normalizedHour = hour % 12 || 12;
  const suffix = hour >= 12 ? "PM" : "AM";

  return `${normalizedHour}:${minute} ${suffix}`;
};

const getInitial = (value) => (value || "E").trim().charAt(0).toUpperCase();

export default function ExpertDetailsScreen({ route }) {
  const navigation = useNavigation();
  const initialExpert = route?.params?.expert;
  const deepLinkedExpertId = route?.params?.expertId;
  const deepLinkedUid = route?.params?.uid;
  const [expert, setExpert] = useState(initialExpert || null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(TAB_KEYS.ABOUT);
  const [isFavorite, setIsFavorite] = useState(Boolean(initialExpert?.favorite));
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [viewer, setViewer] = useState(null);

  useEffect(() => {
    const loadExpert = async () => {
      const targetExpertId = initialExpert?.id || deepLinkedExpertId;
      const targetUid = initialExpert?.account?.uid || deepLinkedUid;

      if (!targetExpertId && !targetUid) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const [response, account] = await Promise.all([
          targetUid ? getBusinessByUid(targetUid) : getBusinessById(targetExpertId),
          getProfile(),
        ]);
        const businessProfile = response?.business_profile || initialExpert;
        setViewer(account);
        setExpert(businessProfile);
        setIsFavorite(Boolean(businessProfile?.favorite));
      } catch (error) {
        setExpert(initialExpert);
        setIsFavorite(Boolean(initialExpert?.favorite));
      } finally {
        setLoading(false);
      }
    };

    loadExpert();
  }, [deepLinkedExpertId, deepLinkedUid, initialExpert]);

  const customSchedules = useMemo(
    () =>
      (expert?.schedules || []).filter(
        (item) => item?.availability_type === "custom"
      ),
    [expert]
  );

  const groupedSchedules = useMemo(() => {
    return DAY_ORDER.map((day) => ({
      day,
      slots: customSchedules.filter(
        (item) => normalizeDayOfWeek(item?.day_of_week) === day
      ),
    })).filter((item) => item.slots.length > 0);
  }, [customSchedules]);

  const tabs = useMemo(() => {
    const nextTabs = [{ key: TAB_KEYS.ABOUT, label: "About" }];

    if (customSchedules.length > 0) {
      nextTabs.push({ key: TAB_KEYS.SCHEDULE, label: "Schedule" });
    }

    nextTabs.push({ key: TAB_KEYS.REVIEWS, label: "Reviews" });
    return nextTabs;
  }, [customSchedules.length]);

  useEffect(() => {
    if (activeTab === TAB_KEYS.SCHEDULE && customSchedules.length === 0) {
      setActiveTab(TAB_KEYS.ABOUT);
    }
  }, [activeTab, customSchedules.length]);

  const isUnavailable = expert?.currently_available === false || expert?.is_available === false;
  const isOwnBusiness = viewer?.id && expert?.account_id === viewer.id;
  const voiceCallDisabled = isUnavailable;
  const videoCallDisabled = isUnavailable;
  const displayName = expert?.account?.full_name || expert?.business_name || "Expert";
  const displayBio = expert?.bio || "Business profile";
  const displayRating = expert?.avg_rating || 0;
  const displayReviewsCount = expert?.reviews_count || 0;
  const aboutCategories = expert?.categories?.map((item) => item.name).filter(Boolean);
  const aboutLanguages = expert?.account?.languages || [];
  const locationText = [expert?.account?.city, expert?.account?.state].filter(Boolean).join(", ");

  const handleChat = () => {
    if (isOwnBusiness) {
      showToast("You cannot start a chat with your own business profile");
      return;
    }

    if (isUnavailable) {
      showToast("This expert is currently unavailable");
      return;
    }

    navigation.navigate("Chat", { expert });
  };

  const handleVoiceCall = () => {
    if (isOwnBusiness) {
      showToast("You cannot start a voice call with your own business profile");
      return;
    }

    if (isUnavailable) {
      showToast("This expert is currently unavailable");
      return;
    }

    navigation.navigate("AgoraCall", {
      expert,
      callType: "audio",
      channelName: `expert-${expert?.id}-audio`,
      uid: expert?.account_id || expert?.id || String(Math.floor(Math.random() * 1000000)),
    });
  };

  const handleVideoCall = () => {
    if (isOwnBusiness) {
      showToast("You cannot start a video call with your own business profile");
      return;
    }

    if (isUnavailable) {
      showToast("This expert is currently unavailable");
      return;
    }

    navigation.navigate("AgoraCall", {
      expert,
      callType: "video",
      channelName: `expert-${expert?.id}-video`,
      uid: expert?.account_id || expert?.id || String(Math.floor(Math.random() * 1000000)),
    });
  };

  const handleFavoriteToggle = async () => {
    if (!expert?.id || favoriteLoading) {
      showToast("Expert profile is not available");
      return;
    }

    if (isOwnBusiness) {
      showToast("You cannot favorite your own business profile");
      return;
    }

    try {
      setFavoriteLoading(true);
      if (isFavorite) {
        const response = await unfavoriteBusiness(expert.id);
        setIsFavorite(false);
        setExpert((prev) => (prev ? { ...prev, favorite: false } : prev));
        showToast(response?.message || "Expert removed from favorites");
      } else {
        const response = await favoriteBusiness(expert.id);
        setIsFavorite(true);
        setExpert((prev) => (prev ? { ...prev, favorite: true } : prev));
        showToast(response?.message || "Expert added to favorites");
      }
    } catch (error) {
      showToast(extractApiError(error, "Unable to update favorite"));
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleShareProfile = async () => {
    const shareLink =
      expert?.share_url ||
      expert?.deep_link_url ||
      buildExpertDeepLink(expert?.account?.uid);

    if (!shareLink) {
      showToast("Profile link is not available");
      return;
    }

    try {
      await Share.share({
        title: displayName,
        message: buildExpertShareMessage({
          uid: expert?.account?.uid,
          name: displayName,
          link: shareLink,
        }),
        url: shareLink,
      });
      setMenuVisible(false);
    } catch (error) {
      showToast(error?.message || "Unable to share profile");
    }
  };

  const renderInfoRow = (icon, title, value) => {
    if (!value || (Array.isArray(value) && value.length === 0)) {
      return null;
    }

    return (
      <View style={styles.infoRow}>
        <View style={styles.infoIconWrap}>
          <Icon name={icon} size={18} color="#f97316" />
        </View>
        <View style={styles.infoBody}>
          <Text style={styles.infoTitle}>{title}</Text>
          <Text style={styles.infoText}>
            {Array.isArray(value) ? value.join(", ") : value}
          </Text>
        </View>
      </View>
    );
  };

  const renderAboutTab = () => (
    <View style={styles.tabContent}>
      {renderInfoRow("briefcase", "Expertise", aboutCategories)}
      {renderInfoRow("info", "About", expert?.about || displayBio)}
      {renderInfoRow("globe", "Languages", aboutLanguages)}
      {renderInfoRow("map-pin", "Location", locationText)}
    </View>
  );

  const renderScheduleTab = () => (
    <View style={styles.tabContent}>
      {groupedSchedules.map((item) => (
        <View key={item.day} style={styles.scheduleCard}>
          <Text style={styles.scheduleDay}>
            {item.day.charAt(0).toUpperCase() + item.day.slice(1)}
          </Text>
          {item.slots.map((slot) => (
            <Text key={slot.id} style={styles.scheduleSlot}>
              {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
            </Text>
          ))}
        </View>
      ))}
    </View>
  );

  const renderReviewsTab = () => {
    const reviews = expert?.reviews || [];

    if (reviews.length === 0) {
      return (
        <View style={styles.tabContent}>
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No reviews available yet.</Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.tabContent}>
        {reviews.map((item) => (
          <View key={item.id} style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <View style={styles.reviewAvatar}>
                <Text style={styles.reviewAvatarText}>
                  {getInitial(item.reviewer_name)}
                </Text>
              </View>

              <View style={styles.reviewMeta}>
                <Text style={styles.reviewName}>{item.reviewer_name || "User"}</Text>
                <Text style={styles.reviewUsername}>
                  @{item.reviewer_username || "guest"}
                </Text>
              </View>

              <View style={styles.reviewPill}>
                <Icon name="star" size={14} color="#f59e0b" />
                <Text style={styles.reviewPillText}>{item.rating || 0}</Text>
              </View>
            </View>

            <Text style={styles.reviewComment}>
              {item.comment || "No review comment added."}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  const renderActiveTab = () => {
    if (activeTab === TAB_KEYS.SCHEDULE && customSchedules.length > 0) {
      return renderScheduleTab();
    }

    if (activeTab === TAB_KEYS.REVIEWS) {
      return renderReviewsTab();
    }

    return renderAboutTab();
  };

  if (!expert && !loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loaderWrap}>
          <Text style={styles.emptyText}>Expert profile is not available.</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loaderWrap}>
          <ActivityIndicator size="large" color="#f97316" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <View style={styles.topRow}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Icon name="arrow-left" size={20} color="#111827" />
            </TouchableOpacity>

            <View style={styles.topActions}>
              <TouchableOpacity
                style={styles.topIconButton}
                disabled={favoriteLoading || isOwnBusiness}
                onPress={handleFavoriteToggle}
              >
                {favoriteLoading ? (
                  <ActivityIndicator size="small" color="#dc2626" />
                ) : (
                  <FontAwesomeIcon
                    name={isFavorite ? "heart" : "heart-o"}
                    size={20}
                    color={isFavorite ? "#dc2626" : "#111827"}
                  />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.topIconButton}
                onPress={() => setMenuVisible(true)}
              >
                <Icon name="more-vertical" size={20} color="#111827" />
              </TouchableOpacity>
            </View>
          </View>

          {expert.account?.profile_pic_url || expert.profile_pic_url ? (
            <Image
              source={{ uri: expert.account?.profile_pic_url || expert.profile_pic_url }}
              style={styles.image}
            />
          ) : (
            <View style={styles.imageFallback}>
              <Text style={styles.imageFallbackText}>{getInitial(displayName)}</Text>
            </View>
          )}

          <View style={styles.nameRow}>
            <Text style={styles.name}>{displayName}</Text>
            {expert.verified_badge && (
              <View style={styles.verifiedBadge}>
                <Icon name="check-circle" size={16} color="#fff" />
              </View>
            )}
          </View>

          <Text style={styles.bio}>{displayBio}</Text>

          <View style={styles.ratingRow}>
            <Icon name="star" size={16} color="#f59e0b" />
            <Text style={styles.ratingText}>
              {displayRating} ({displayReviewsCount} reviews)
            </Text>
          </View>

          <View
            style={[
              styles.statusPill,
              isUnavailable ? styles.statusPillOff : styles.statusPillOn,
            ]}
          >
            <Icon
              name={isUnavailable ? "slash" : "clock"}
              size={14}
              color={isUnavailable ? "#b91c1c" : "#166534"}
            />
            <Text
              style={[
                styles.statusPillText,
                isUnavailable ? styles.statusTextOff : styles.statusTextOn,
              ]}
            >
              {isUnavailable ? "Unavailable right now" : "Available for consultation"}
            </Text>
          </View>

          {isUnavailable && (
            <Text style={styles.statusMessage}>
              This expert is currently unavailable. Chat, call and online meeting
              actions are disabled for now.
            </Text>
          )}
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.actionCard, isUnavailable && styles.actionCardDisabled]}
            disabled={isUnavailable}
            onPress={handleChat}
          >
            <Icon
              name="message-circle"
              size={18}
              color={isUnavailable ? "#9ca3af" : "#16a34a"}
            />
            <Text
              style={[
                styles.actionText,
                isUnavailable && styles.actionTextDisabled,
              ]}
            >
              Chat
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, voiceCallDisabled && styles.actionCardDisabled]}
            disabled={voiceCallDisabled}
            onPress={handleVoiceCall}
          >
            <Icon
              name="phone-call"
              size={18}
              color={voiceCallDisabled ? "#9ca3af" : "#2563eb"}
            />
            <Text
              style={[
                styles.actionText,
                voiceCallDisabled && styles.actionTextDisabled,
              ]}
            >
              Voice Call
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, videoCallDisabled && styles.actionCardDisabled]}
            disabled={videoCallDisabled}
            onPress={handleVideoCall}
          >
            <Icon
              name="video"
              size={18}
              color={videoCallDisabled ? "#9ca3af" : "#db2777"}
            />
            <Text
              style={[
                styles.actionText,
                videoCallDisabled && styles.actionTextDisabled,
              ]}
            >
              Video Call
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tabsWrap}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tabButton,
                activeTab === tab.key && styles.activeTabButton,
              ]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text
                style={[
                  styles.tabButtonText,
                  activeTab === tab.key && styles.activeTabButtonText,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {renderActiveTab()}
      </ScrollView>

      <Modal
        transparent
        visible={menuVisible}
        animationType="slide"
        onRequestClose={() => setMenuVisible(false)}
      >
        <View style={styles.sheetOverlay}>
          <TouchableOpacity
            activeOpacity={1}
            style={styles.sheetBackdrop}
            onPress={() => setMenuVisible(false)}
          />
          <View style={styles.sheetContent}>
            <TouchableOpacity style={styles.sheetRow} onPress={handleShareProfile}>
              <View style={styles.sheetIconWrap}>
                <Icon name="share-2" size={18} color="#f97316" />
              </View>
              <View style={styles.sheetTextWrap}>
                <Text style={styles.sheetTitle}>Share Profile</Text>
                <Text style={styles.sheetSubtitle}>
                  Send this expert profile using your device share options.
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.sheetRow} onPress={handleShareProfile}>
              <View style={styles.sheetIconWrap}>
                <Icon name="link" size={18} color="#2563eb" />
              </View>
              <View style={styles.sheetTextWrap}>
                  <Text style={styles.sheetTitle}>Profile Link</Text>
                <Text style={styles.sheetSubtitle} numberOfLines={2}>
                  {expert?.share_url ||
                    expert?.deep_link_url ||
                    buildExpertDeepLink(expert?.account?.uid) ||
                    "Profile link is not available"}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  loaderWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  heroCard: {
    backgroundColor: "#fff",
    margin: 16,
    borderRadius: 24,
    padding: 20,
    alignItems: "center",
  },
  topRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
  },
  topActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  topIconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },
  image: {
    width: 104,
    height: 104,
    borderRadius: 52,
  },
  imageFallback: {
    width: 104,
    height: 104,
    borderRadius: 52,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fed7aa",
  },
  imageFallbackText: {
    fontSize: 34,
    fontWeight: "700",
    color: "#9a3412",
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
  },
  name: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
  },
  verifiedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginLeft: 8,
    backgroundColor: "#f97316",
    alignItems: "center",
    justifyContent: "center",
  },
  bio: {
    textAlign: "center",
    color: "#6b7280",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },
  ratingText: {
    marginLeft: 6,
    color: "#111827",
    fontSize: 14,
    fontWeight: "600",
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginTop: 16,
  },
  statusPillOn: {
    backgroundColor: "#dcfce7",
  },
  statusPillOff: {
    backgroundColor: "#fee2e2",
  },
  statusPillText: {
    marginLeft: 8,
    fontSize: 13,
    fontWeight: "600",
  },
  statusTextOn: {
    color: "#166534",
  },
  statusTextOff: {
    color: "#b91c1c",
  },
  statusMessage: {
    marginTop: 10,
    textAlign: "center",
    color: "#991b1b",
    fontSize: 13,
    lineHeight: 18,
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 16,
    marginBottom: 14,
  },
  actionCard: {
    flex: 1,
    marginHorizontal: 4,
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  actionCardDisabled: {
    backgroundColor: "#e5e7eb",
  },
  actionText: {
    marginTop: 6,
    color: "#111827",
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
  actionTextDisabled: {
    color: "#9ca3af",
  },
  tabsWrap: {
    flexDirection: "row",
    marginHorizontal: 16,
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 6,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 14,
  },
  activeTabButton: {
    backgroundColor: "#fff7ed",
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
  },
  activeTabButtonText: {
    color: "#ea580c",
  },
  tabContent: {
    margin: 16,
    marginTop: 14,
  },
  infoRow: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
  },
  infoIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#fff7ed",
    alignItems: "center",
    justifyContent: "center",
  },
  infoBody: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: "#111827",
    lineHeight: 20,
  },
  scheduleCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
  },
  scheduleDay: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  scheduleSlot: {
    fontSize: 14,
    color: "#4b5563",
    marginTop: 4,
  },
  reviewCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  reviewAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#fed7aa",
    alignItems: "center",
    justifyContent: "center",
  },
  reviewAvatarText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#9a3412",
  },
  reviewMeta: {
    flex: 1,
    marginLeft: 12,
  },
  reviewName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  reviewUsername: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  reviewPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff7ed",
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  reviewPillText: {
    marginLeft: 6,
    color: "#9a3412",
    fontWeight: "700",
  },
  reviewComment: {
    marginTop: 12,
    color: "#374151",
    fontSize: 14,
    lineHeight: 20,
  },
  emptyCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
  },
  emptyText: {
    textAlign: "center",
    color: "#6b7280",
    fontSize: 14,
  },
  sheetOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  sheetBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 23, 42, 0.25)",
  },
  sheetContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 24,
  },
  sheetRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  sheetIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f8fafc",
    alignItems: "center",
    justifyContent: "center",
  },
  sheetTextWrap: {
    flex: 1,
    marginLeft: 12,
  },
  sheetTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a",
  },
  sheetSubtitle: {
    marginTop: 4,
    fontSize: 12,
    color: "#64748b",
    lineHeight: 18,
  },
});
