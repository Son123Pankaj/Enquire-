import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  ActivityIndicator,
  Image,
  Switch,
  Alert,
  BackHandler,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import { useIsFocused } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getProfile } from "../services/profile";
import { showToast } from "../utils/toast";

const menuItems = [
  { name: "Share Profile", icon: "share-2", screen: "ShareProfile" },
  { name: "Profile QR Code", icon: "grid", screen: "ProfileQR" },
  { name: "Personal Info", icon: "user", screen: "PersonalInfo" },
  { name: "Business Details", icon: "briefcase", screen: "BusinessDetails" },
  { name: "Category", icon: "layers", screen: "Category" },
  { name: "Schedule", icon: "calendar", screen: "Schedule" },
  { name: "Consult Fees", icon: "dollar-sign", screen: "CallRates" },
  { name: "Approval", icon: "check-circle", screen: "Approval" },
  { name: "Verification Badge", icon: "award", screen: "Verification" },
  { name: "Favorite", icon: "heart", screen: "Favorite" },
  { name: "About App", icon: "info", screen: "About" },
  { name: "Account Privacy", icon: "lock", screen: "Privacy" },
  { name: "Support", icon: "help-circle", screen: "Support" },
  { name: "Logout", icon: "log-out", screen: "Logout", color: "red" },
];

const ProfileScreen = ({ navigation }) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [switchEnabled, setSwitchEnabled] = useState(false);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (!isFocused) {
      return;
    }

    fetchProfile();
  }, [isFocused]);

  useEffect(() => {
    if (!menuVisible) {
      return undefined;
    }

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        setMenuVisible(false);
        return true;
      }
    );

    return () => subscription.remove();
  }, [menuVisible]);

  const fetchProfile = async () => {
    try {
      const account = await getProfile();
      setUser(account);
      setSwitchEnabled(Boolean(account?.is_business));
    } catch (error) {
      showToast("Unable to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = (screen) => {
    setMenuVisible(false);
    if (screen === "Logout") {
      handleLogout();
      return;
    }

    const directScreens = [
      "BusinessDetails",
      "Category",
      "Schedule",
      "CallRates",
      "Approval",
    ];

    if (directScreens.includes(screen)) {
      navigation.navigate(screen, { entryMode: "direct" });
      return;
    }

    navigation.navigate(screen);
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Do you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.multiRemove(["token", "is_business"]);
          navigation.reset({
            index: 0,
            routes: [{ name: "EmailLogin" }],
          });
        },
      },
    ]);
  };

  let displayName = "No Name";
  if (user) {
    const fullName = user.full_name?.trim();
    displayName =
      fullName ||
      `${user.first_name || ""} ${user.last_name || ""}`.trim() ||
      "No Name";
  }

  const username = user?.username ? `@${user.username}` : "@username";
  const profileImage = user?.profile_pic?.url || user?.profile_pic_url;
  const initial = displayName.charAt(0).toUpperCase() || "U";
  const isVerified = Boolean(user?.is_verified || user?.verified_badge);
  const businessStatus = user?.business_profile?.approval_status;
  const isBusiness = Boolean(user?.is_business);

  const handleBusinessToggle = (value) => {
    if (value) {
      navigation.navigate("BusinessDetails", { entryMode: "step" });
      return;
    }

    setSwitchEnabled(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{ width: 24 }} />

        <View style={styles.centerProfile}>
          {loading ? (
            <ActivityIndicator size="small" color="#000" />
          ) : profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.avatarImage} />
          ) : (
            <View style={styles.iconCircle}>
              <Text style={styles.initialText}>{initial}</Text>
            </View>
          )}

          <View style={styles.nameRow}>
            <Text style={styles.name}>{displayName}</Text>
            {isVerified && (
              <View style={styles.badge}>
                <Icon name="check-circle" size={14} color="#fff" />
                <Text style={styles.badgeText}>Verified</Text>
              </View>
            )}
          </View>
          <Text style={styles.username}>{username}</Text>
          {businessStatus ? (
            <Text style={styles.statusText}>
              {businessStatus.charAt(0).toUpperCase() + businessStatus.slice(1)}
            </Text>
          ) : null}

          {isBusiness ? (
            <Text style={styles.businessText}>
              Business Account
            </Text>
          ) : null}

          <View style={styles.switchCard}>
            <View style={styles.switchTextWrap}>
              <Text style={styles.switchTitle}>Switch to business account</Text>
              <Text style={styles.switchSubtitle}>
                {switchEnabled ? "Business mode selected" : "Customer mode selected"}
              </Text>
            </View>

            <Switch
              value={switchEnabled}
              onValueChange={handleBusinessToggle}
              trackColor={{ false: "#cbd5e1", true: "#f59e0b" }}
              thumbColor="#fff"
            />
          </View>
        </View>

        <TouchableOpacity onPress={() => setMenuVisible(true)}>
          <Icon name="more-vertical" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <Modal
        transparent
        visible={menuVisible}
        animationType="slide"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={styles.overlay}
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.bottomSheet}>
            <FlatList
              data={menuItems}
              keyExtractor={(item, index) => index.toString()}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.menuItem}
                  activeOpacity={0.7}
                  onPress={() => handleNavigate(item.screen)}
                >
                  <View style={styles.menuRow}>
                    <Icon
                      name={item.icon}
                      size={20}
                      color={item.screen === "Logout" ? "#dc2626" : "#333"}
                    />
                    <Text
                      style={[
                        styles.menuText,
                        item.screen === "Logout" && styles.logoutText,
                      ]}
                    >
                      {item.name}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 20,
  },

  centerProfile: {
    alignItems: "center",
    flex: 1,
  },

  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "#1E5BFF",
    justifyContent: "center",
    alignItems: "center",
  },

  avatarImage: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "#e2e8f0",
  },

  initialText: {
    color: "#fff",
    fontSize: 34,
    fontWeight: "700",
  },

  name: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0f172a",
  },

  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },

  username: {
    marginTop: 4,
    fontSize: 14,
    color: "#64748b",
  },

  statusText: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: "600",
    color: "#128405",
    backgroundColor: "#12840533",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },

  businessText: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: "600",
    color: "#1E5BFF",
    backgroundColor: "#1E5BFF33",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },

  badge: {
    marginLeft: 8,
    backgroundColor: "#f59e0b",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
  },

  badgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
    marginLeft: 4,
  },

  switchCard: {
    marginTop: 20,
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  switchTextWrap: {
    flex: 1,
    paddingRight: 12,
  },

  switchTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0f172a",
  },

  switchSubtitle: {
    marginTop: 4,
    fontSize: 12,
    color: "#64748b",
  },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "flex-end",
  },

  bottomSheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 15,
    maxHeight: "80%",
  },

  menuItem: {
    paddingVertical: 15,
    borderBottomWidth: 0.5,
    borderColor: "#ddd",
  },

  menuRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  menuText: {
    fontSize: 16,
    marginLeft: 12,
  },

  logoutText: {
    color: "#dc2626",
    fontWeight: "700",
  },
});
